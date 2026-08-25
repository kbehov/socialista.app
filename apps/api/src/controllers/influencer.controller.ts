import type { AppContext } from "@/middlewares/auth.middleware.js";
import { deleteObjectFromR2 } from "@/lib/aws.js";
import {
  assertHasUpdates,
  optionalTrimmedString,
  parseParamId,
  requireTrimmedString,
  withQueryParam,
  applyProjectQueryAlias,
} from "@/utils/common.utils.js";
import { HttpError, successResponse } from "@/utils/http-response.js";
import {
  collectInfluencerMediaUrls,
  getCloneRequestForMember,
  getInfluencerForMember,
  getInfluencerForViewer,
  parseAgeRange,
  parseAppearance,
  parseGender,
  parseOptionalAppearance,
  parsePhotoStyle,
  parseScenes,
  parseStringArray,
  serializeCloneRequest,
  serializeInfluencer,
  resolveInfluencerGenerationModel,
} from "@/utils/influencer.utils.js";
import { getWorkspaceAsMember, resolveProjectForWorkspace } from "@/utils/workspace.utils.js";
import { buildInfluencerBasePromptFragment } from "@socialista/ai";
import {
  createInfluencer as createInfluencerInDb,
  createInfluencerCloneRequest,
  decrementWorkspaceStorageUsage,
  deleteImage,
  deleteInfluencer as deleteInfluencerInDb,
  deleteInfluencerCloneRequestsByResultInfluencerId,
  ImageModel,
  InfluencerIdentityMethod,
  InfluencerSource,
  InfluencerStatus,
  InfluencerVisibility,
  listInfluencers,
  updateInfluencer as updateInfluencerInDb,
  updateInfluencerCloneRequest,
} from "@socialista/db";
import { createPublicAccessToken } from "@socialista/trigger";
import type {
  CloneInfluencerTask,
  GenerateInfluencerTask,
} from "@socialista/trigger/task-types";
import {
  clampInfluencerShotCount,
  INFLUENCER_MAX_USER_REFERENCE_IMAGES,
  TASK_IDS,
  type CreateInfluencerPayload,
  type UpdateInfluencerPayload,
} from "@socialista/types";
import { tasks } from "@trigger.dev/sdk/v3";
import type { Context } from "hono";

const MIN_CLONE_PHOTOS = 3;
const DEFAULT_EXPLORE_LIMIT = "24";
const DIRECTIONS_MAX = 500;

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parseDirections(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new HttpError(400, "Directions must be a string");
  }
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > DIRECTIONS_MAX) {
    throw new HttpError(
      400,
      `Directions must be ${DIRECTIONS_MAX} characters or fewer`,
    );
  }
  return trimmed;
}

function parseImageUrls(
  value: unknown,
  label: string,
  min: number,
  max?: number,
): string[] {
  if (!Array.isArray(value)) {
    throw new HttpError(400, `${label} must be an array of image URLs`);
  }
  const urls = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  if (urls.length < min) {
    throw new HttpError(400, `At least ${min} images are required`);
  }
  if (max !== undefined && urls.length > max) {
    throw new HttpError(400, `${label} accepts at most ${max} images`);
  }
  for (const url of urls) {
    if (!isValidHttpUrl(url)) {
      throw new HttpError(400, `Invalid image URL: ${url}`);
    }
  }
  return urls;
}

function parseOptionalUserReferenceImageUrls(
  value: unknown,
): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    throw new HttpError(
      400,
      "userReferenceImageUrls must be an array of image URLs",
    );
  }
  if (value.length === 0) return undefined;
  return parseImageUrls(
    value,
    "userReferenceImageUrls",
    1,
    INFLUENCER_MAX_USER_REFERENCE_IMAGES,
  );
}

async function bestEffortDeleteMedia(
  urls: string[],
  workspaceId: string | null,
) {
  if (urls.length === 0) return;

  const images = await ImageModel.find({ url: { $in: urls } }).lean();
  for (const image of images) {
    try {
      await deleteObjectFromR2(image.key);
      await deleteImage(image._id.toString());
      if (workspaceId && image.size && image.size > 0) {
        await decrementWorkspaceStorageUsage(workspaceId, image.size);
      }
    } catch (error) {
      console.error("Failed to delete influencer media", {
        key: image.key,
        error,
      });
    }
  }
}

export const exploreInfluencers = async (c: Context<AppContext>) => {
  const params = new URLSearchParams(c.req.url.split("?")[1] ?? "");
  if (!params.has("limit")) params.set("limit", DEFAULT_EXPLORE_LIMIT);
  params.set("visibility", InfluencerVisibility.PUBLIC);
  params.set("status", InfluencerStatus.READY);

  const data = await listInfluencers(params.toString());
  return successResponse(
    c,
    200,
    { influencers: data.influencers.map(serializeInfluencer) },
    data.meta,
  );
};

export const getWorkspaceInfluencers = async (c: Context<AppContext>) => {
  const userId = c.get("userId");
  const workspaceId = parseParamId(c.req.param("workspaceId"), "workspace ID");
  await getWorkspaceAsMember(workspaceId, userId);

  const params = new URLSearchParams(
    applyProjectQueryAlias(withQueryParam(c.req.url, "workspace", workspaceId)),
  );
  if (!params.has("limit")) params.set("limit", DEFAULT_EXPLORE_LIMIT);

  const data = await listInfluencers(params.toString());
  return successResponse(
    c,
    200,
    { influencers: data.influencers.map(serializeInfluencer) },
    data.meta,
  );
};

export const getInfluencer = async (c: Context<AppContext>) => {
  const userId = c.get("userId");
  const id = parseParamId(c.req.param("id"), "influencer ID");
  const influencer = await getInfluencerForViewer(id, userId);
  return successResponse(c, 200, {
    influencer: serializeInfluencer(influencer),
  });
};

export const createInfluencer = async (c: Context<AppContext>) => {
  const userId = c.get("userId");
  const body = (await c.req.json()) as CreateInfluencerPayload &
    Record<string, unknown>;
  const workspaceId = parseParamId(body.workspaceId, "workspace ID");
  await getWorkspaceAsMember(workspaceId, userId);
  const project = await resolveProjectForWorkspace(workspaceId, body.projectId);

  const name = requireTrimmedString(body.name, "Name");
  const gender = parseGender(body.gender);
  const ageRange = parseAgeRange(body.ageRange);
  const appearance = parseAppearance(body.appearance);
  const niche = parseStringArray(body.niche);
  const scenes = parseScenes(body.scenes);
  const aestheticTags = parseStringArray(body.aestheticTags);
  const bio = optionalTrimmedString(body.bio);
  const directions = parseDirections(body.directions);
  const ethnicity = optionalTrimmedString(body.ethnicity);
  const photoStyle = parsePhotoStyle(body.photoStyle);
  const userReferenceImageUrls = parseOptionalUserReferenceImageUrls(
    body.userReferenceImageUrls,
  );
  const shotCount = clampInfluencerShotCount(body.shotCount);
  // IMAGE context already required for all influencer models (cover → pack chaining).
  const model = await resolveInfluencerGenerationModel(body.model);

  const basePromptFragment =
    optionalTrimmedString(body.basePromptFragment) ??
    buildInfluencerBasePromptFragment({
      name,
      gender,
      ageRange,
      ethnicity,
      appearance,
    });

  const seed = Math.floor(Math.random() * 1_000_000_000);

  const influencer = await createInfluencerInDb({
    workspace: workspaceId,
    project: project._id.toString(),
    createdBy: userId,
    visibility: InfluencerVisibility.PRIVATE,
    source: InfluencerSource.GENERATED,
    name,
    bio,
    directions,
    niche,
    scenes,
    gender,
    ageRange,
    ethnicity,
    appearance,
    aestheticTags,
    photoStyle,
    identity: {
      method: InfluencerIdentityMethod.REFERENCE,
      seed,
      basePromptFragment,
      referenceImageUrls: [],
      ...(userReferenceImageUrls ? { userReferenceImageUrls } : {}),
    },
    status: InfluencerStatus.GENERATING,
    galleryImageUrls: [],
  });

  const handle = await tasks.trigger<GenerateInfluencerTask>(
    TASK_IDS.generateInfluencer,
    {
      influencerId: influencer._id.toString(),
      workspaceId,
      userId,
      model,
      shotCount,
    },
  );

  const publicAccessToken = await createPublicAccessToken(handle.id);

  return successResponse(c, 202, {
    influencer: serializeInfluencer(influencer),
    runId: handle.id,
    publicAccessToken,
  });
};

export const cloneInfluencer = async (c: Context<AppContext>) => {
  const userId = c.get("userId");
  const body = (await c.req.json()) as Record<string, unknown>;
  const workspaceId = parseParamId(
    typeof body.workspaceId === "string" ? body.workspaceId : undefined,
    "workspace ID",
  );
  await getWorkspaceAsMember(workspaceId, userId);

  if (body.consentConfirmed !== true) {
    throw new HttpError(400, "Consent confirmation is required");
  }

  const uploadedImageUrls = parseImageUrls(
    body.uploadedImageUrls,
    "uploadedImageUrls",
    MIN_CLONE_PHOTOS,
  );
  const name = requireTrimmedString(body.name, "Name");
  const gender = parseGender(body.gender);
  const ageRange = parseAgeRange(body.ageRange);
  const appearance = parseOptionalAppearance(body.appearance);
  const niche = parseStringArray(body.niche);
  const aestheticTags = parseStringArray(body.aestheticTags);
  const bio = optionalTrimmedString(body.bio);
  const ethnicity = optionalTrimmedString(body.ethnicity);
  const model = await resolveInfluencerGenerationModel(body.model);

  const cloneRequest = await createInfluencerCloneRequest({
    workspace: workspaceId,
    userId,
    uploadedImageUrls,
    consentConfirmedAt: new Date(),
    name,
    bio,
    niche,
    gender,
    ageRange,
    ethnicity,
    appearance,
    aestheticTags,
  });

  const handle = await tasks.trigger<CloneInfluencerTask>(
    TASK_IDS.cloneInfluencer,
    {
      cloneRequestId: cloneRequest._id.toString(),
      workspaceId,
      userId,
      model,
    },
  );

  await updateInfluencerCloneRequest(cloneRequest._id.toString(), {
    trainingJobId: handle.id,
  });

  const publicAccessToken = await createPublicAccessToken(handle.id);

  return successResponse(c, 202, {
    cloneRequest: serializeCloneRequest({
      ...cloneRequest,
      trainingJobId: handle.id,
    }),
    runId: handle.id,
    publicAccessToken,
  });
};

export const getCloneRequest = async (c: Context<AppContext>) => {
  const userId = c.get("userId");
  const id = parseParamId(c.req.param("id"), "clone request ID");
  const request = await getCloneRequestForMember(id, userId);
  return successResponse(c, 200, {
    cloneRequest: serializeCloneRequest(request),
  });
};

export const updateInfluencer = async (c: Context<AppContext>) => {
  const userId = c.get("userId");
  const id = parseParamId(c.req.param("id"), "influencer ID");
  const influencer = await getInfluencerForMember(id, userId);

  if (influencer.status === InfluencerStatus.GENERATING) {
    throw new HttpError(409, "Cannot update influencer while generating");
  }

  const body = (await c.req.json()) as UpdateInfluencerPayload &
    Record<string, unknown>;
  const updates: {
    name?: string;
    bio?: string | null;
    directions?: string | null;
    niche?: string[];
    scenes?: string[];
    aestheticTags?: string[];
    photoStyle?: ReturnType<typeof parsePhotoStyle> | null;
  } = {};

  if (body.name !== undefined) {
    updates.name = requireTrimmedString(body.name, "Name");
  }
  if (body.bio !== undefined) {
    updates.bio = optionalTrimmedString(body.bio) ?? null;
  }
  if (body.directions !== undefined) {
    updates.directions = parseDirections(body.directions) ?? null;
  }
  if (body.niche !== undefined) {
    updates.niche = parseStringArray(body.niche);
  }
  if (body.scenes !== undefined) {
    updates.scenes = parseScenes(body.scenes);
  }
  if (body.aestheticTags !== undefined) {
    updates.aestheticTags = parseStringArray(body.aestheticTags);
  }
  if (body.photoStyle !== undefined) {
    updates.photoStyle = parsePhotoStyle(body.photoStyle) ?? null;
  }

  assertHasUpdates(updates);

  const updated = await updateInfluencerInDb(id, updates);
  if (!updated) {
    throw new HttpError(404, "Influencer not found");
  }

  return successResponse(c, 200, { influencer: serializeInfluencer(updated) });
};

export const deleteInfluencer = async (c: Context<AppContext>) => {
  const userId = c.get("userId");
  const id = parseParamId(c.req.param("id"), "influencer ID");
  const influencer = await getInfluencerForMember(id, userId);

  const mediaUrls = collectInfluencerMediaUrls(influencer);
  const workspaceId = influencer.workspace?.toString() ?? null;

  await deleteInfluencerCloneRequestsByResultInfluencerId(id);
  await deleteInfluencerInDb(id);
  await bestEffortDeleteMedia(mediaUrls, workspaceId);

  return successResponse(c, 200, { deleted: true });
};
