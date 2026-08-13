import type { AppContext } from '@/middlewares/auth.middleware.js'
import { parseParamId, withQueryParam } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import {
  assertCanGenerateScript,
  assertCanGenerateStills,
  assertCanGenerateVideo,
  assertClipLimit,
  assertClipNotGenerating,
  buildNewClip,
  emptyStills,
  getUgcProjectForMember,
  parseClipType,
  parseScriptText,
  requireClip,
  serializeUgcProject,
  serializeUgcProjectSummary,
} from '@/utils/ugc-project.utils.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import { DEFAULT_VIDEO_FPS, DEFAULT_VIDEO_RESOLUTION } from '@/utils/video.utils.js'
import { generateUgcAdScript } from '@socialista/ai'
import {
  addUgcClip,
  createUgcProject as createUgcProjectInDb,
  createVideo as createVideoInDb,
  deleteUgcProject as deleteUgcProjectInDb,
  getInfluencerById,
  getModels,
  getProductById,
  getUgcProjects,
  removeUgcClip,
  toObjectId,
  updateUgcClip,
  updateUgcProject as updateUgcProjectInDb,
  UgcClipStatus,
  UgcProjectStatus,
  UgcScriptSource,
  VideoStatus,
  type IUgcClip,
  type IUgcProject,
  type IUgcProjectModels,
} from '@socialista/db'
import { createPublicAccessToken } from '@socialista/trigger'
import type { GenerateUgcStillsTask, GenerateUgcVideoTask } from '@socialista/trigger/task-types'
import {
  clampUgcDuration,
  TASK_IDS,
  UGC_CLIP_DEFAULT_SCENE_COUNT,
  UGC_CLIP_TYPE_LABELS,
  UGC_DEFAULT_ASPECT_RATIO,
  UGC_DEFAULT_DURATION,
  type CreateUgcClipPayload,
  type CreateUgcProjectPayload,
  type UpdateUgcClipPayload,
  type UpdateUgcProjectPayload,
  type UgcClipType,
} from '@socialista/types'
import { tasks } from '@trigger.dev/sdk/v3'
import type { Context } from 'hono'

async function resolveDefaultModels(): Promise<IUgcProjectModels> {
  const [image, video, text] = await Promise.all([
    getModels('limit=1&modelType=text-to-image&contextSupports=image&sort=-usageCount'),
    getModels('limit=1&modelType=image-to-video&sort=-usageCount'),
    getModels('limit=1&modelType=text&contextSupports=image&sort=-usageCount'),
  ])

  const imageModel = image.models[0]
  const videoModel = video.models[0]
  const plannerModel = text.models[0]

  if (!imageModel || !videoModel) {
    throw new HttpError(400, 'Add image-context and image-to-video models in the catalog first')
  }

  const scriptOnly = plannerModel
    ? plannerModel
    : (await getModels('limit=1&modelType=text&sort=-usageCount')).models[0]

  return {
    image: imageModel.value,
    video: videoModel.value,
    ...(scriptOnly ? { script: scriptOnly.value } : {}),
    ...(plannerModel ? { planner: plannerModel.value } : {}),
  }
}

export const createUgcProject = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const input = (await c.req.json()) as CreateUgcProjectPayload
  const workspaceId = parseParamId(input.workspaceId, 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const defaults = await resolveDefaultModels()
  const productImageUrls = input.productImageUrls?.filter(url => typeof url === 'string' && url.length > 0) ?? []

  let productName = typeof input.productName === 'string' ? input.productName.trim() : undefined
  let productId: string | undefined
  if (typeof input.productId === 'string' && input.productId) {
    productId = parseParamId(input.productId, 'product ID')
    const product = await getProductById(productId)
    if (product) {
      if (productImageUrls.length === 0) {
        productImageUrls.push(...(product.images ?? []))
      }
      productName = productName || product.name
    }
  }

  const models: IUgcProjectModels = {
    image: input.models?.image || defaults.image,
    video: input.models?.video || defaults.video,
    script: input.models?.script || defaults.script,
    planner: input.models?.planner || defaults.planner,
  }

  const project = await createUgcProjectInDb({
    name: typeof input.name === 'string' && input.name.trim() ? input.name.trim() : 'Untitled UGC ad',
    status: UgcProjectStatus.DRAFT,
    workspace: toObjectId(workspaceId),
    createdBy: toObjectId(userId),
    ...(productId ? { productId: toObjectId(productId) } : {}),
    productImageUrls,
    productName,
    aspectRatio: input.aspectRatio || UGC_DEFAULT_ASPECT_RATIO,
    models,
    clips: [],
  })

  return successResponse(c, 201, { project: serializeUgcProject(project.toObject() as IUgcProject) })
}

export const getWorkspaceUgcProjects = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const data = await getUgcProjects(withQueryParam(c.req.url, 'workspace', workspaceId))
  return successResponse(
    c,
    200,
    { projects: data.projects.map(project => serializeUgcProjectSummary(project as IUgcProject)) },
    data.meta,
  )
}

export const getUgcProject = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const project = await getUgcProjectForMember(id, userId)
  return successResponse(c, 200, { project: serializeUgcProject(project) })
}

export const updateUgcProject = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const input = (await c.req.json()) as UpdateUgcProjectPayload
  await getUgcProjectForMember(id, userId)

  const updates: Partial<IUgcProject> = {}
  if (typeof input.name === 'string' && input.name.trim()) updates.name = input.name.trim()
  if (Array.isArray(input.productImageUrls)) {
    updates.productImageUrls = input.productImageUrls.filter(url => typeof url === 'string')
  }
  if (typeof input.productName === 'string') updates.productName = input.productName.trim()
  if (input.productId === null) {
    updates.productId = undefined
  } else if (typeof input.productId === 'string' && input.productId) {
    updates.productId = toObjectId(parseParamId(input.productId, 'product ID'))
  }
  if (typeof input.aspectRatio === 'string' && input.aspectRatio) updates.aspectRatio = input.aspectRatio
  if (input.models) {
    const project = await getUgcProjectForMember(id, userId)
    updates.models = {
      ...project.models,
      ...(input.models.image ? { image: input.models.image } : {}),
      ...(input.models.video ? { video: input.models.video } : {}),
      ...(input.models.script ? { script: input.models.script } : {}),
      ...(input.models.planner ? { planner: input.models.planner } : {}),
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, 'No valid fields to update')
  }

  const updated = await updateUgcProjectInDb(id, updates)
  if (!updated) throw new HttpError(404, 'UGC project not found')
  return successResponse(c, 200, { project: serializeUgcProject(updated) })
}

export const deleteUgcProject = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  await getUgcProjectForMember(id, userId)
  const deleted = await deleteUgcProjectInDb(id)
  if (!deleted) throw new HttpError(404, 'UGC project not found')
  return successResponse(c, 200, { id })
}

export const createUgcClip = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const input = (await c.req.json()) as CreateUgcClipPayload
  const project = await getUgcProjectForMember(id, userId)
  assertClipLimit(project)

  const type = parseClipType(input.type)
  const influencerId =
    typeof input.influencerId === 'string' && input.influencerId
      ? parseParamId(input.influencerId, 'influencer ID')
      : undefined

  const clip = buildNewClip({
    type,
    durationSec: input.durationSec,
    influencerId,
    name: input.name,
  })
  const updated = await addUgcClip(id, clip)
  if (!updated) throw new HttpError(404, 'UGC project not found')
  return successResponse(c, 201, { project: serializeUgcProject(updated) })
}

export const updateUgcClipHandler = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const input = (await c.req.json()) as UpdateUgcClipPayload
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  assertClipNotGenerating(clip)

  const clipUpdates: Partial<IUgcClip> = {}
  if (typeof input.name === 'string' && input.name.trim()) clipUpdates.name = input.name.trim()
  if (input.durationSec !== undefined) {
    clipUpdates.durationSec = clampUgcDuration(input.durationSec)
  }
  if (input.influencerId === null) {
    clipUpdates.influencerId = undefined
  } else if (typeof input.influencerId === 'string' && input.influencerId) {
    clipUpdates.influencerId = toObjectId(parseParamId(input.influencerId, 'influencer ID'))
  }
  if (input.script) {
    clipUpdates.script = {
      text: typeof input.script.text === 'string' ? parseScriptText(input.script.text) : (clip.script?.text ?? ''),
      source: input.script.source === 'ai' ? UgcScriptSource.AI : UgcScriptSource.USER,
    }
  }
  if (typeof input.scenePrompt === 'string') clipUpdates.scenePrompt = input.scenePrompt
  if (input.scenePrompt === null) clipUpdates.scenePrompt = undefined
  if (typeof input.directions === 'string') clipUpdates.directions = input.directions
  if (input.directions === null) clipUpdates.directions = undefined
  if (Array.isArray(input.referenceImageUrls)) {
    clipUpdates.referenceImageUrls = input.referenceImageUrls.filter(url => typeof url === 'string')
  }
  if (typeof input.plannedPrompt === 'string') clipUpdates.plannedPrompt = input.plannedPrompt
  if (input.plannedPrompt === null) clipUpdates.plannedPrompt = undefined

  if (Object.keys(clipUpdates).length === 0) {
    throw new HttpError(400, 'No valid fields to update')
  }

  const updated = await updateUgcClip(id, clip.id, clipUpdates)
  if (!updated) throw new HttpError(404, 'Clip not found')
  return successResponse(c, 200, { project: serializeUgcProject(updated) })
}

export const deleteUgcClip = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  assertClipNotGenerating(clip)
  const updated = await removeUgcClip(id, clip.id)
  if (!updated) throw new HttpError(404, 'UGC project not found')
  return successResponse(c, 200, { project: serializeUgcProject(updated) })
}

export const duplicateUgcClip = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  assertClipLimit(project)

  const type = clip.type as UgcClipType
  const copy = buildNewClip({
    type: clip.type,
    durationSec: clip.durationSec,
    influencerId: clip.influencerId?.toString(),
    name: clip.name ? `${clip.name} copy` : `${UGC_CLIP_TYPE_LABELS[type]} · ${clip.durationSec}s`,
  })
  copy.script = clip.script ? { ...clip.script } : copy.script
  copy.scenePrompt = clip.scenePrompt
  copy.directions = clip.directions
  copy.referenceImageUrls = [...(clip.referenceImageUrls ?? [])]
  copy.stills = emptyStills(UGC_CLIP_DEFAULT_SCENE_COUNT[type])

  const updated = await addUgcClip(id, copy)
  if (!updated) throw new HttpError(404, 'UGC project not found')
  return successResponse(c, 201, { project: serializeUgcProject(updated) })
}

export const generateUgcClipScript = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const body = (await c.req.json().catch(() => ({}))) as { model?: string }
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  assertClipNotGenerating(clip)
  assertCanGenerateScript(clip)

  const modelValue = body.model || project.models.script
  if (!modelValue) {
    throw new HttpError(400, 'Choose a script model')
  }

  const influencer = clip.influencerId ? await getInfluencerById(clip.influencerId.toString()) : null
  const text = await generateUgcAdScript({
    model: modelValue,
    productName: project.productName,
    directions: clip.directions || clip.scenePrompt,
    influencerName: influencer?.name,
    clipType: clip.type,
    durationSec: clip.durationSec ?? UGC_DEFAULT_DURATION,
  })

  const updated = await updateUgcClip(id, clip.id, {
    script: { text, source: UgcScriptSource.AI },
  })
  if (!updated) throw new HttpError(404, 'Clip not found')
  return successResponse(c, 200, { project: serializeUgcProject(updated) })
}

async function triggerStills(
  project: IUgcProject,
  clip: IUgcClip,
  userId: string,
  options?: { stillIndex?: number; skipEnhance?: boolean },
) {
  assertClipNotGenerating(clip)
  assertCanGenerateStills(project, clip)

  const handle = await tasks.trigger<GenerateUgcStillsTask>(TASK_IDS.generateUgcStills, {
    projectId: project._id.toString(),
    workspaceId: project.workspace.toString(),
    userId,
    clipId: clip.id,
    stillIndex: options?.stillIndex,
    skipEnhance: options?.skipEnhance,
  })
  const publicAccessToken = await createPublicAccessToken(handle.id)
  const updated = await updateUgcClip(
    project._id.toString(),
    clip.id,
    { status: UgcClipStatus.GENERATING, stillsRunId: handle.id, error: undefined },
    { status: UgcProjectStatus.GENERATING, stillsRunId: handle.id, error: undefined },
  )

  return {
    project: serializeUgcProject(updated ?? project),
    runId: handle.id,
    publicAccessToken,
  }
}

async function triggerVideo(
  project: IUgcProject,
  clip: IUgcClip,
  userId: string,
  options?: { plannedPrompt?: string; skipPlanner?: boolean },
) {
  assertClipNotGenerating(clip)
  assertCanGenerateVideo(project, clip)

  const handle = await tasks.trigger<GenerateUgcVideoTask>(TASK_IDS.generateUgcVideo, {
    projectId: project._id.toString(),
    workspaceId: project.workspace.toString(),
    userId,
    clipId: clip.id,
    plannedPrompt: options?.plannedPrompt,
    skipPlanner: options?.skipPlanner,
  })
  const publicAccessToken = await createPublicAccessToken(handle.id)
  const updated = await updateUgcClip(
    project._id.toString(),
    clip.id,
    { status: UgcClipStatus.GENERATING, videoRunId: handle.id, error: undefined },
    { status: UgcProjectStatus.GENERATING, videoRunId: handle.id, error: undefined },
  )

  return {
    project: serializeUgcProject(updated ?? project),
    runId: handle.id,
    publicAccessToken,
  }
}

export const generateUgcClipStills = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const body = (await c.req.json().catch(() => ({}))) as { stillIndex?: number; skipEnhance?: boolean }
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  const result = await triggerStills(project, clip, userId, {
    stillIndex: typeof body.stillIndex === 'number' ? body.stillIndex : undefined,
    skipEnhance: body.skipEnhance === true,
  })
  return successResponse(c, 202, result)
}

export const generateUgcClipVideos = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const body = (await c.req.json().catch(() => ({}))) as { plannedPrompt?: string; skipPlanner?: boolean }
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  const result = await triggerVideo(project, clip, userId, {
    plannedPrompt: typeof body.plannedPrompt === 'string' ? body.plannedPrompt : undefined,
    skipPlanner: body.skipPlanner === true,
  })
  return successResponse(c, 202, result)
}

export const regenerateUgcClipStill = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const index = Number(c.req.param('index'))
  if (!Number.isInteger(index) || index < 0 || index > 2) {
    throw new HttpError(400, 'Invalid scene index')
  }
  const body = (await c.req.json().catch(() => ({}))) as { skipEnhance?: boolean }
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  const result = await triggerStills(project, clip, userId, {
    stillIndex: index,
    skipEnhance: body.skipEnhance === true,
  })
  return successResponse(c, 202, result)
}

export const regenerateUgcClipVideo = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const body = (await c.req.json().catch(() => ({}))) as { plannedPrompt?: string; skipPlanner?: boolean }
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  const result = await triggerVideo(project, clip, userId, {
    plannedPrompt: typeof body.plannedPrompt === 'string' ? body.plannedPrompt : undefined,
    skipPlanner: body.skipPlanner === true,
  })
  return successResponse(c, 202, result)
}

export const openUgcClipEditor = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'project ID')
  const clipId = c.req.param('clipId')
  const project = await getUgcProjectForMember(id, userId)
  const clip = requireClip(project, clipId)
  if (!clip.videoUrl) {
    throw new HttpError(400, 'Generate a video first')
  }

  if (clip.composedVideoId) {
    return successResponse(c, 200, { videoId: clip.composedVideoId.toString() })
  }

  const duration = clip.durationSec || UGC_DEFAULT_DURATION
  const assetId = `asset_${clip.id}`
  const timelineClipId = `clip_${clip.id}`
  const trackId = `track_${clip.id}`

  const video = await createVideoInDb({
    name: `${project.name} · ${clip.name ?? 'cut'}`,
    status: VideoStatus.DRAFT,
    workspace: project.workspace,
    createdBy: toObjectId(userId),
    resolution: DEFAULT_VIDEO_RESOLUTION,
    fps: DEFAULT_VIDEO_FPS,
    duration,
    tracks: [{ id: trackId, type: 'video', name: 'Video', muted: false, locked: false, clips: [timelineClipId] }],
    clips: [
      {
        id: timelineClipId,
        type: 'video',
        assetId,
        trackId,
        startTime: 0,
        duration,
        trimIn: 0,
        trimOut: duration,
        volume: 1,
        speed: 1,
        filters: [],
      },
    ],
    textOverlays: [],
    assets: [
      {
        id: assetId,
        name: `${project.name}.mp4`,
        type: 'video',
        hash: clip.id,
        duration,
        width: DEFAULT_VIDEO_RESOLUTION.width,
        height: DEFAULT_VIDEO_RESOLUTION.height,
        url: clip.videoUrl,
      },
    ],
  })

  await updateUgcClip(id, clip.id, { composedVideoId: video._id })
  return successResponse(c, 201, { videoId: video._id.toString() })
}
