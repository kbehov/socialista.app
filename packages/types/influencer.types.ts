import type { AspectRatio } from "./image-generation.types.js";

export const INFLUENCER_GENDERS = ["female", "male"] as const;
export type InfluencerGender = (typeof INFLUENCER_GENDERS)[number];

export const INFLUENCER_AGE_RANGES = [
  "18-24",
  "25-34",
  "35-44",
  "45-55",
  "65+",
] as const;
export type InfluencerAgeRange = (typeof INFLUENCER_AGE_RANGES)[number];

export const INFLUENCER_HEIGHTS = ["short", "average", "tall"] as const;
export type InfluencerHeight = (typeof INFLUENCER_HEIGHTS)[number];

export const INFLUENCER_VISIBILITIES = ["public", "private"] as const;
export type InfluencerVisibility = (typeof INFLUENCER_VISIBILITIES)[number];

export const INFLUENCER_SOURCES = ["library", "generated", "cloned"] as const;
export type InfluencerSource = (typeof INFLUENCER_SOURCES)[number];

export const INFLUENCER_STATUSES = [
  "draft",
  "generating",
  "ready",
  "failed",
] as const;
export type InfluencerStatus = (typeof INFLUENCER_STATUSES)[number];

export const INFLUENCER_IDENTITY_METHODS = ["reference", "lora"] as const;
export type InfluencerIdentityMethod =
  (typeof INFLUENCER_IDENTITY_METHODS)[number];

export const INFLUENCER_CLONE_STATUSES = [
  "pending",
  "processing",
  "ready",
  "failed",
] as const;
export type InfluencerCloneStatus = (typeof INFLUENCER_CLONE_STATUSES)[number];

export const INFLUENCER_NICHES = [
  "fitness",
  "fashion",
  "beauty",
  "travel",
  "tech",
  "food",
  "gaming",
  "lifestyle",
  "business",
  "comedy",
  "wellness",
  "finance",
  "parenting",
  "pets",
  "education",
  "diy",
] as const;
export type InfluencerNiche = (typeof INFLUENCER_NICHES)[number];

export const INFLUENCER_ETHNICITIES = [
  "asian",
  "south-asian",
  "black",
  "latin",
  "middle-eastern",
  "white",
  "mixed",
  "indigenous",
  "pacific-islander",
] as const;
export type InfluencerEthnicity = (typeof INFLUENCER_ETHNICITIES)[number];

export const INFLUENCER_FACIAL_HAIR = [
  "none",
  "stubble",
  "beard",
  "mustache",
  "goatee",
] as const;
export type InfluencerFacialHair = (typeof INFLUENCER_FACIAL_HAIR)[number];

export const INFLUENCER_MAKEUP_STYLES = [
  "natural",
  "no-makeup",
  "glam",
  "bold",
] as const;
export type InfluencerMakeupStyle = (typeof INFLUENCER_MAKEUP_STYLES)[number];

export const INFLUENCER_PHOTO_STYLES = [
  "ugc-phone",
  "creator-camera",
  "studio-polish",
] as const;
export type InfluencerPhotoStyle = (typeof INFLUENCER_PHOTO_STYLES)[number];

/** UGC scene / situation presets for scroll-stopping social content. */
export const INFLUENCER_SCENES = [
  "home",
  "kitchen-cooking",
  "bedroom-morning",
  "bathroom-vanity",
  "balcony",
  "playground",
  "coffee-shop",
  "restaurant",
  "podcast-setup",
  "gym",
  "yoga",
  "outdoor-run",
  "airport",
  "plane",
  "car",
  "hotel-room",
  "beach",
  "street",
  "snow",
  "winter-city",
  "park",
  "store",
  "farmers-market",
  "grocery-store",
  "streaming-desk",
  "asmr-desk",
  "mirror-ootd",
  "unboxing-desk",
  "grwm",
  "library",
  "classroom",
  "study-desk",
  "home-office",
  "product-hook",
  "pointing-reveal",
  "sitting-testimonial",
  "pregnant-bump",
] as const;
export type InfluencerScene = (typeof INFLUENCER_SCENES)[number];

/** Worn / held props that stay consistent across the shot pack. */
export const INFLUENCER_ACCESSORIES = [
  "headphones",
  "glasses",
  "sunglasses",
  "hat",
  "beanie",
  "bag",
  "jewelry",
  "watch",
  "scarf",
  "backpack",
  "candle",
  "mic",
  "phone",
  "laptop",
  "dumbbell",
  "coffee-cup",
  "water-bottle",
  "skincare-bottle",
  "pet",
  "shopping-bag",
  "books",
  "notebook",
] as const;
export type InfluencerAccessory = (typeof INFLUENCER_ACCESSORIES)[number];

/** On-camera energy / demeanor, independent of visual aesthetic. */
export const INFLUENCER_VIBES = [
  "energetic",
  "calm",
  "confident",
  "playful",
  "warm",
  "authoritative",
  "quirky",
  "aspirational",
] as const;
export type InfluencerVibe = (typeof INFLUENCER_VIBES)[number];

export const INFLUENCER_SCENES_MAX = 3;
export const INFLUENCER_ACCESSORIES_MAX = 4;
export const INFLUENCER_VIBES_MAX = 2;

export const INFLUENCER_SORTS = ["popular", "newest", "az"] as const;
export type InfluencerSort = (typeof INFLUENCER_SORTS)[number];

/** Default model for influencer anchor / cover generation. */
export const INFLUENCER_DEFAULT_MODEL = "openai/gpt-image-2" as const;

/** Default generation output: portrait, full body, and one distinct UGC frame. */
export const INFLUENCER_GENERATION_SHOT_MIN = 1;
export const INFLUENCER_GENERATION_SHOT_MAX = 3;
export const INFLUENCER_GENERATION_SHOT_COUNT = 3;
/** @deprecated Use shotCount × model.cost. Default pack size. */
export const INFLUENCER_GENERATION_BILLED = INFLUENCER_GENERATION_SHOT_COUNT;
export const INFLUENCER_MAX_USER_REFERENCE_IMAGES = 3;

export const INFLUENCER_HOOK_VIDEO_COUNT_MIN = 1;
export const INFLUENCER_HOOK_VIDEO_COUNT_MAX = 3;
export const INFLUENCER_HOOK_VIDEO_COUNT_DEFAULT = 1;
export const INFLUENCER_HOOK_VIDEO_ASPECT_RATIO = "9:16" as const;
export const INFLUENCER_HOOK_VIDEO_RESOLUTION = "720p" as const;

export function clampInfluencerHookVideoCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return INFLUENCER_HOOK_VIDEO_COUNT_DEFAULT;
  return Math.min(
    INFLUENCER_HOOK_VIDEO_COUNT_MAX,
    Math.max(INFLUENCER_HOOK_VIDEO_COUNT_MIN, Math.round(n)),
  );
}

/**
 * Short seeds for image-to-video. One slow change each.
 * Stacked blinks, degree counts, and multi-step face beats make these models warp the face.
 */
export const INFLUENCER_HOOK_PRESETS = [
  {
    id: "shocked-reaction",
    label: "Shocked reaction",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. A slow quiet surprise: eyes open a little wider, lips part slightly, then they hold that look. Body stays in the start pose.",
  },
  {
    id: "wait-for-it",
    label: "Wait for it",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. They stay almost still, looking at the camera, then a small reaction shows slowly in the eyes. One gentle change. Mouth stays closed.",
  },
  {
    id: "pov-lean",
    label: "POV lean",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. They lean a little closer to the lens and keep calm eye contact. Small, slow movement. Mouth stays closed.",
  },
  {
    id: "hot-take",
    label: "Hot take",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. Chin lifts slightly and they look steadily at the camera, confident, as if about to speak. Mouth stays closed.",
  },
  {
    id: "skeptical-squint",
    label: "Skeptical squint",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. Eyes narrow a little, a mild skeptical look at the camera. Very small movement. Mouth stays closed.",
  },
  {
    id: "sad-snob",
    label: "Sad snob",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. Chin tips up slightly, a tired unimpressed look, mouth relaxed. Very small movement.",
  },
  {
    id: "hand-on-mouth",
    label: "Hand on mouth",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. The nearest hand rises slowly and rests over the mouth, fingers together, eyes a little wider. One slow gesture. Face stays natural.",
  },
  {
    id: "finger-point",
    label: "Finger point",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. One hand lifts slowly and points toward the camera, wrist loose, a small playful look. One slow gesture. Face stays natural.",
  },
  {
    id: "side-eye",
    label: "Side-eye",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. Eyes glance a little to the side, head follows slightly, a soft judging look, then they ease back toward the camera. Slow and small.",
  },
  {
    id: "double-take",
    label: "Double-take",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. They glance slightly off camera, then look back at the lens with a quiet surprised expression. Slow and small. Mouth barely moves.",
  },
  {
    id: "eye-roll",
    label: "Eye roll",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. Eyes drift upward briefly, then return to the camera with a flat unimpressed mouth. Slow and small.",
  },
  {
    id: "knowing-smirk",
    label: "Knowing smirk",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. One corner of the mouth lifts into a small smirk, eyes stay on the camera. Very small movement.",
  },
  {
    id: "whisper-tea",
    label: "Whisper tea",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. They lean in a little, eyes slightly wider, mouth almost closed, like sharing a secret without speaking. Small, slow movement.",
  },
  {
    id: "stitch-glance",
    label: "Stitch glance",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. They glance slightly off camera, then look back at the lens with a knowing expression. Slow and small. Mouth stays closed.",
  },
  {
    id: "look-down-up",
    label: "Look down, up",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. Eyes drop for a moment, then rise back to the camera. Slow and small. Mouth stays closed.",
  },
  {
    id: "eyebrow-raise",
    label: "Eyebrow raise",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. Eyebrows lift slightly, a quiet curious look at the camera. Very small movement. Mouth stays relaxed.",
  },
  {
    id: "cringe-wince",
    label: "Cringe wince",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. Eyes tighten a little and the mouth pulls in, a small embarrassed wince, then they ease. Slow and small.",
  },
  {
    id: "plot-twist",
    label: "Plot twist",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. A faint smile fades into a quieter, more serious look at the camera. One slow change.",
  },
  {
    id: "soft-laugh",
    label: "Soft laugh",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. A small silent laugh, eyes crinkling, shoulders barely moving. Gentle. Mouth stays closed between the smile.",
  },
  {
    id: "knowing-nod",
    label: "Knowing nod",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. One small slow nod while looking at the camera. Very small movement. Mouth stays closed.",
  },
  {
    id: "head-shake-no",
    label: "Head shake no",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. One small slow head shake, eyes on the camera, mouth closed. Very small movement.",
  },
  {
    id: "peek-fingers",
    label: "Peek",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. One hand rises slowly in front of the eyes, fingers together with a small gap, a shy smile. One slow gesture. Face stays natural.",
  },
  {
    id: "chefs-kiss",
    label: "Chef's kiss",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. One hand lifts slowly, fingertips meet near the lips and move a little away, a pleased look at the camera. One slow gesture. Face stays natural.",
  },
  {
    id: "come-closer",
    label: "Watch this",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. They lean in slightly and make a small come-here gesture with one open hand, a playful look at the camera. Slow and small.",
  },
  {
    id: "unimpressed-blink",
    label: "Unimpressed blink",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. A flat unimpressed look at the camera, almost still, mouth relaxed. Natural face, very little movement.",
  },
  {
    id: "slow-realize",
    label: "Slow realize",
    prompt:
      "Same person, clothes, and room as the photo. Camera holds. Eyes widen gradually and the lips part a little, a quiet realization. Body stays in the start pose.",
  },
] as const;

export type InfluencerHookPresetId =
  (typeof INFLUENCER_HOOK_PRESETS)[number]["id"];

export function isInfluencerHookPresetId(
  value: unknown,
): value is InfluencerHookPresetId {
  return (
    typeof value === "string" &&
    INFLUENCER_HOOK_PRESETS.some((preset) => preset.id === value)
  );
}

export function clampInfluencerShotCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return INFLUENCER_GENERATION_SHOT_COUNT;
  return Math.min(
    INFLUENCER_GENERATION_SHOT_MAX,
    Math.max(INFLUENCER_GENERATION_SHOT_MIN, Math.round(n)),
  );
}

/** @deprecated Shot packs removed — use INFLUENCER_GENERATION_* constants. */
export const INFLUENCER_SHOT_PACKS = ["quick", "ugc-kit"] as const;
export type InfluencerShotPack = (typeof INFLUENCER_SHOT_PACKS)[number];

/** @deprecated Shot packs removed — generation always bills INFLUENCER_GENERATION_BILLED. */
export const INFLUENCER_SHOT_PACK_SPEC = {
  quick: {
    shots: INFLUENCER_GENERATION_SHOT_COUNT,
    coverCandidates: 1,
    billed: INFLUENCER_GENERATION_BILLED,
  },
  "ugc-kit": {
    shots: INFLUENCER_GENERATION_SHOT_COUNT,
    coverCandidates: 1,
    billed: INFLUENCER_GENERATION_BILLED,
  },
} as const satisfies Record<
  InfluencerShotPack,
  { shots: number; coverCandidates: number; billed: number }
>;

/** @deprecated Use INFLUENCER_GENERATION_SHOT_COUNT. */
export const INFLUENCER_ANCHOR_SHOT_COUNT = INFLUENCER_GENERATION_SHOT_COUNT;

export const INFLUENCER_SHOT_IDS = [
  "front-portrait",
  "three-quarter",
  "full-body",
  "selfie-talking",
  "product-hold",
  "seated-testimonial",
  "outdoor-walk",
  "mirror-ootd",
] as const;
export type InfluencerShotId = (typeof INFLUENCER_SHOT_IDS)[number];

export type InfluencerAppearance = {
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  bodyShape: string;
  height?: InfluencerHeight;
  distinguishingFeatures?: string[];
  facialHair?: string;
  makeup?: string;
  /** Worn / held props locked across shots. */
  accessories?: string[];
};

/** Compact photographic spec for cover shot; reused on follow-ups with shot-specific canvas/pose. */
export type InfluencerLookSpec = {
  canvas: { crop: string; subject_scale: string };
  pose: {
    head: string;
    torso: string;
    arms: string;
    gaze: string;
    expression: string;
  };
  wardrobe: { garment: string; material: string; color: string; fit: string };
  environment: { location: string; surfaces: string; light_props: string };
  lighting: {
    source: string;
    direction: string;
    quality: string;
    color_temperature: string;
  };
  camera: {
    device: string;
    focal_length: string;
    height: string;
    depth_of_field: string;
    processing: string;
  };
  texture: { skin: string; hair: string; fabric: string; background: string };
};

/** LLM-authored identity lock reused on every subsequent generation. */
export type InfluencerCharacterSheet = {
  identityLock: string;
  signatureDetails: string[];
  wardrobe: { casual: string; onCamera: string; active: string };
  environments: string[];
  expressionRange: string[];
  /** Physical face facts for prompt lock (optional — older sheets omit). */
  face?: {
    shape: string;
    eyes: string;
    brows: string;
    nose: string;
    lips: string;
    makeup: string;
  };
  skin?: { tone: string; texture: string; retouching: string };
  hair?: { length: string; texture: string; part: string; shine: string };
  /** Derived from photoStyle — phone UGC vs creator vs studio polish. */
  cameraFamily?: string;
  lightingFamily?: string;
  /** Cover-shot photographic JSON; follow-ups reuse with shot overrides. */
  lookSpec?: InfluencerLookSpec;
};

export type InfluencerGalleryShot = {
  shotId: InfluencerShotId | string;
  url: string;
  aspectRatio: string;
};

export type InfluencerHookVideo = {
  _id: string;
  sourceImageUrl: string;
  videoUrl: string;
  videoId: string;
  generationId: string;
  prompt: string;
  presetId?: string;
  model: string;
  durationSec: number;
  createdAt: Date;
};

export type InfluencerIdentity = {
  method: InfluencerIdentityMethod;
  seed?: number;
  basePromptFragment: string;
  /** Generated gallery anchors used for future identity-locked shots. */
  referenceImageUrls: string[];
  /** Optional user-uploaded style references (lighting / palette), max 3. */
  userReferenceImageUrls?: string[];
  loraModelId?: string;
  characterSheet?: InfluencerCharacterSheet;
  shotPack?: InfluencerShotPack;
};

export type Influencer = {
  _id: string;
  workspaceId: string | null;
  projectId?: string | null;
  createdBy: string | null;
  visibility: InfluencerVisibility;
  source: InfluencerSource;
  name: string;
  bio?: string;
  /** Free-text creative direction for scenes, outfits, and mood. */
  directions?: string;
  niche: string[];
  /** Structured UGC situations (max 3); rotates across generation shots. */
  scenes?: string[];
  /** On-camera energy / demeanor (max 2). */
  vibeTags?: string[];
  gender: InfluencerGender;
  ageRange: InfluencerAgeRange;
  ethnicity?: string;
  appearance: InfluencerAppearance;
  aestheticTags: string[];
  photoStyle?: InfluencerPhotoStyle;
  identity: InfluencerIdentity;
  status: InfluencerStatus;
  coverImageUrl?: string;
  galleryImageUrls: string[];
  /** Labeled gallery entries for pack shots (preferred over galleryImageUrls alone). */
  galleryShots?: InfluencerGalleryShot[];
  /** Short hook / reaction clips keyed to a gallery still. */
  hookVideos?: InfluencerHookVideo[];
  usageCount: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InfluencerCloneRequest = {
  _id: string;
  workspaceId: string;
  userId: string;
  uploadedImageUrls: string[];
  consentConfirmedAt: Date;
  status: InfluencerCloneStatus;
  resultInfluencerId?: string;
  trainingJobId?: string;
  error?: string;
  name: string;
  bio?: string;
  niche: string[];
  gender: InfluencerGender;
  ageRange: InfluencerAgeRange;
  ethnicity?: string;
  appearance?: InfluencerAppearance;
  aestheticTags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type CreateInfluencerAppearancePayload = {
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  bodyShape: string;
  height?: InfluencerHeight;
  distinguishingFeatures?: string[];
  facialHair?: string;
  makeup?: string;
  accessories?: string[];
};

export type CreateInfluencerPayload = {
  workspaceId: string;
  projectId?: string;
  model?: string;
  name: string;
  bio?: string;
  /** Free-text creative direction for scenes, outfits, and mood. */
  directions?: string;
  /** Empty allowed when userReferenceImageUrls are provided. */
  niche: string[];
  /** Structured UGC situations (max 3). */
  scenes?: string[];
  /** On-camera energy / demeanor (max 2). */
  vibeTags?: string[];
  gender: InfluencerGender;
  ageRange: InfluencerAgeRange;
  ethnicity?: string;
  appearance: CreateInfluencerAppearancePayload;
  aestheticTags?: string[];
  photoStyle?: InfluencerPhotoStyle;
  /** Optional advanced override; otherwise built server-side from appearance. */
  basePromptFragment?: string;
  /**
   * Optional style / face reference images (lighting / palette / vibe), max 3 HTTPS URLs.
   * When provided, niche / look / style fields may be omitted — refs drive generation.
   */
  userReferenceImageUrls?: string[];
  /** How many portraits to generate (1–3). Defaults to 3. */
  shotCount?: number;
};

export type UpdateInfluencerPayload = {
  name?: string;
  bio?: string;
  directions?: string;
  niche?: string[];
  scenes?: string[];
  vibeTags?: string[];
  aestheticTags?: string[];
  photoStyle?: InfluencerPhotoStyle;
};

export type CloneInfluencerPayload = {
  workspaceId: string;
  model?: string;
  uploadedImageUrls: string[];
  consentConfirmed: boolean;
  name: string;
  bio?: string;
  niche?: string[];
  gender: InfluencerGender;
  ageRange: InfluencerAgeRange;
  ethnicity?: string;
  appearance?: CreateInfluencerAppearancePayload;
  aestheticTags?: string[];
};

export type GetInfluencersResponse = {
  influencers: Influencer[];
};

export type GetInfluencerCloneRequestResponse = {
  cloneRequest: InfluencerCloneRequest;
};

/** Returned when create/clone enqueues a Trigger.dev job. */
export type InfluencerJobResponse = {
  runId: string;
  publicAccessToken: string;
};

export type CreateInfluencerResponse = InfluencerJobResponse & {
  influencer: Influencer;
};

export type CloneInfluencerResponse = InfluencerJobResponse & {
  cloneRequest: InfluencerCloneRequest;
};

export type DeleteInfluencerResponse = {
  deleted: boolean;
};

export type CreateInfluencerHookVideoPayload = {
  sourceImageUrl: string;
  prompt: string;
  model: string;
  duration: number;
  count?: number;
  presetId?: InfluencerHookPresetId;
  projectId?: string;
};

export type CreateInfluencerHookVideoResponse = InfluencerJobResponse;

export type CreateInfluencerImagePayload = {
  sourceImageUrl: string;
  prompt: string;
  model: string;
  aspectRatio: AspectRatio;
  count?: number;
  projectId?: string;
};

export type CreateInfluencerImageResponse = InfluencerJobResponse;

export type ExploreInfluencersQuery = {
  page?: number;
  limit?: number;
  sort?: InfluencerSort;
  query?: string;
  /** Single value or comma-separated list for `$in` matching. */
  gender?: InfluencerGender | string;
  /** Single value or comma-separated list for `$in` matching. */
  ageRange?: InfluencerAgeRange | string;
  hairColor?: string;
  hairStyle?: string;
  eyeColor?: string;
  skinTone?: string;
  bodyShape?: string;
  niche?: string | string[];
  /** Single value or comma-separated list for `$in` matching. */
  scenes?: string | string[];
  photoStyle?: InfluencerPhotoStyle | string;
  /** Single value or comma-separated list for `$in` matching. */
  ethnicity?: string;
  /** Single value or comma-separated list for `$in` matching. */
  status?: InfluencerStatus | string;
};

export type WorkspaceInfluencersQuery = ExploreInfluencersQuery & {
  visibility?: InfluencerVisibility;
  source?: InfluencerSource;
  projectId?: string;
};
