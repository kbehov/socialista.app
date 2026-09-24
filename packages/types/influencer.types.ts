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

/** Short seed prompts the hook-video enhancer expands into a start-frame reaction. */
export const INFLUENCER_HOOK_PRESETS = [
  {
    id: "shocked-reaction",
    label: "Shocked reaction",
    prompt:
      "soft inhale, head eases a few degrees toward camera, brows lift, eyelids widen, lips part just enough for a silent oh, shoulders rise a little then settle, blinks once and holds the look like a real phone reaction",
  },
  {
    id: "wait-for-it",
    label: "Wait for it",
    prompt:
      "holds the start pose a beat too long, almost still, then the face finally lands, brows lift a few millimeters, a small inhale, eyes find camera, the delay is the joke, not a jump-cut or snap",
  },
  {
    id: "pov-lean",
    label: "POV lean",
    prompt:
      "leans a couple centimeters toward camera like the viewer is in the room, eyes soften and lock, a tiny head tilt, holds the look the way a POV clip invites you in, breathing stays visible",
  },
  {
    id: "hot-take",
    label: "Hot take",
    prompt:
      "chin lifts a touch, weight settles, a small confident inhale as if about to drop a take, brows set, one slow blink, holds the here's-the-truth face without speaking",
  },
  {
    id: "skeptical-squint",
    label: "Skeptical squint",
    prompt:
      "eyes narrow just a little, head tips back a degree, mouth presses, the I-wanted-this-to-fail skeptic look, one unimpressed blink, holds, never a cartoon glare",
  },
  {
    id: "sad-snob",
    label: "Sad snob",
    prompt:
      "slow weight shift, chin tips up a touch, eyes drop then look down the nose with a tired unimpressed pout, one lazy blink, mouth presses soft to the side, the kind of sad-snob face people make on TikTok not a costume",
  },
  {
    id: "hand-on-mouth",
    label: "Hand on mouth",
    prompt:
      "a small delay, then the near hand lifts naturally to cover the lips, fingers relaxed not clawed, eyes widen after the hand arrives, a tiny head tilt, holds the silent gasp like they just saw the comments",
  },
  {
    id: "finger-point",
    label: "Finger point",
    prompt:
      "leans in a little, one finger rises and points toward camera with a loose wrist, eyebrows lift in a playful know-it-all beat, a small nod, holds the point the way a creator teases a reveal",
  },
  {
    id: "side-eye",
    label: "Side-eye",
    prompt:
      "eyes slide to the side first, head follows half a beat later, a judging glance with a tiny smirk, then eases back to camera still side-eyeing, soft and natural not a cartoon cut",
  },
  {
    id: "double-take",
    label: "Double-take",
    prompt:
      "looks just off camera as if something passed, a short pause, then turns back with a second quieter look of disbelief, mouth barely opens, one blink, the recatch feels human not a whip-pan gag",
  },
  {
    id: "eye-roll",
    label: "Eye roll",
    prompt:
      "eyes drift up first, lids lazy, head follows a half beat later, a tiny exhale through the nose, comes back to camera still unimpressed, never a full cartoon roll",
  },
  {
    id: "knowing-smirk",
    label: "Knowing smirk",
    prompt:
      "one corner of the mouth lifts, eyes stay on camera, a small nod like I told you so, holds the smirk without breaking into a grin",
  },
  {
    id: "whisper-tea",
    label: "Whisper tea",
    prompt:
      "leans in, nearest shoulder rises a little, eyes widen just enough, lips almost part as if sharing a secret, holds the lean, no spoken words",
  },
  {
    id: "stitch-glance",
    label: "Stitch glance",
    prompt:
      "looks just off-camera like a stitch or quote-post is playing, a beat, then turns to camera with a reply face, brows set, a small head shake or nod, the anyway look creators use on X",
  },
  {
    id: "look-down-up",
    label: "Look down, up",
    prompt:
      "eyes drop as if reading a phone or a comment, a short still, then looks back up to camera with a quieter second expression, mouth barely moves, the recatch is the hook",
  },
  {
    id: "eyebrow-raise",
    label: "Eyebrow raise",
    prompt:
      "one brow lifts first, the other follows a little, eyes widen a millimeter, a silent oh-really, holds, face stays soft not theatrical",
  },
  {
    id: "cringe-wince",
    label: "Cringe wince",
    prompt:
      "shoulders tighten, eyes squeeze halfway, teeth catch the lip, a tiny head tuck, then eases back still wincing, secondhand embarrassment not a scream",
  },
  {
    id: "plot-twist",
    label: "Plot twist",
    prompt:
      "starts with a tiny almost-smile, then the smile fades as the thought lands, brows knit a little, a swallow, holds the new face, one continuous beat",
  },
  {
    id: "soft-laugh",
    label: "Soft laugh",
    prompt:
      "tries to hold it together, mouth tightens, then a silent laugh breaks, shoulders bounce once, eyes crinkle, settles still smiling, no spoken line",
  },
  {
    id: "knowing-nod",
    label: "Knowing nod",
    prompt:
      "a small yes nod, two beats, eyes lock, the this-is-it confirmation, then holds still like a talking-head open",
  },
  {
    id: "head-shake-no",
    label: "Head shake no",
    prompt:
      "slow small no, two short shakes, lips press, eyes stay on camera, disappointed more than angry, eases back to still",
  },
  {
    id: "peek-fingers",
    label: "Peek",
    prompt:
      "near hand rises to cover the eyes, fingers part just enough to peek, a cringe smile, holds like they cannot watch, wrist stays loose",
  },
  {
    id: "chefs-kiss",
    label: "Chef's kiss",
    prompt:
      "near hand lifts, fingertips gather and kiss away from the lips in a small chef's kiss, eyes close half a beat, then looks back at camera pleased, loose wrist not a pose",
  },
  {
    id: "come-closer",
    label: "Watch this",
    prompt:
      "leans in and beckons with the nearest hand or a small come-here flick, brows lift, a playful watch-this face, then holds the invite toward camera",
  },
  {
    id: "unimpressed-blink",
    label: "Unimpressed blink",
    prompt:
      "one long slow blink, mouth flat, head barely moves, the tired and? look, holds like a muted Reels reaction",
  },
  {
    id: "slow-realize",
    label: "Slow realize",
    prompt:
      "eyes widen gradually, lips part on a quiet inhale, head eases back a few degrees, the realization lands in pieces, not a cartoon mind-blown",
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
