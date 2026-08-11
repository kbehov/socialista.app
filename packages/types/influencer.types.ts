export const INFLUENCER_GENDERS = ['female', 'male', 'non-binary'] as const
export type InfluencerGender = (typeof INFLUENCER_GENDERS)[number]

export const INFLUENCER_AGE_RANGES = ['18-24', '25-34', '35-44', '45+'] as const
export type InfluencerAgeRange = (typeof INFLUENCER_AGE_RANGES)[number]

export const INFLUENCER_HEIGHTS = ['short', 'average', 'tall'] as const
export type InfluencerHeight = (typeof INFLUENCER_HEIGHTS)[number]

export const INFLUENCER_VISIBILITIES = ['public', 'private'] as const
export type InfluencerVisibility = (typeof INFLUENCER_VISIBILITIES)[number]

export const INFLUENCER_SOURCES = ['library', 'generated', 'cloned'] as const
export type InfluencerSource = (typeof INFLUENCER_SOURCES)[number]

export const INFLUENCER_STATUSES = ['draft', 'generating', 'ready', 'failed'] as const
export type InfluencerStatus = (typeof INFLUENCER_STATUSES)[number]

export const INFLUENCER_IDENTITY_METHODS = ['reference', 'lora'] as const
export type InfluencerIdentityMethod = (typeof INFLUENCER_IDENTITY_METHODS)[number]

export const INFLUENCER_CLONE_STATUSES = ['pending', 'processing', 'ready', 'failed'] as const
export type InfluencerCloneStatus = (typeof INFLUENCER_CLONE_STATUSES)[number]

export const INFLUENCER_NICHES = [
  'fitness',
  'fashion',
  'beauty',
  'travel',
  'tech',
  'food',
  'gaming',
  'lifestyle',
  'business',
  'comedy',
  'wellness',
  'finance',
  'parenting',
  'pets',
  'education',
  'diy',
] as const
export type InfluencerNiche = (typeof INFLUENCER_NICHES)[number]

export const INFLUENCER_ETHNICITIES = [
  'east-asian',
  'south-asian',
  'southeast-asian',
  'black',
  'latina',
  'latino',
  'middle-eastern',
  'white',
  'mixed',
  'indigenous',
  'pacific-islander',
] as const
export type InfluencerEthnicity = (typeof INFLUENCER_ETHNICITIES)[number]

export const INFLUENCER_FACIAL_HAIR = ['none', 'stubble', 'beard', 'mustache', 'goatee'] as const
export type InfluencerFacialHair = (typeof INFLUENCER_FACIAL_HAIR)[number]

export const INFLUENCER_MAKEUP_STYLES = ['natural', 'no-makeup', 'glam', 'bold'] as const
export type InfluencerMakeupStyle = (typeof INFLUENCER_MAKEUP_STYLES)[number]

export const INFLUENCER_PHOTO_STYLES = ['ugc-phone', 'creator-camera', 'studio-polish'] as const
export type InfluencerPhotoStyle = (typeof INFLUENCER_PHOTO_STYLES)[number]

/** UGC scene / situation presets for scroll-stopping social content. */
export const INFLUENCER_SCENES = [
  'home',
  'kitchen-cooking',
  'bedroom-morning',
  'bathroom-vanity',
  'coffee-shop',
  'restaurant',
  'podcast-setup',
  'gym',
  'yoga',
  'outdoor-run',
  'airport',
  'plane',
  'car',
  'hotel-room',
  'beach',
  'street',
  'snow',
  'winter-city',
  'store',
  'farmers-market',
  'streaming-desk',
  'asmr-desk',
  'mirror-ootd',
  'product-hook',
  'pointing-reveal',
  'sitting-testimonial',
  'pregnant-bump',
] as const
export type InfluencerScene = (typeof INFLUENCER_SCENES)[number]

/** Worn / held props that stay consistent across the shot pack. */
export const INFLUENCER_ACCESSORIES = [
  'headphones',
  'glasses',
  'sunglasses',
  'hat',
  'beanie',
  'bag',
  'jewelry',
  'watch',
  'scarf',
  'candle',
  'mic',
  'phone',
  'laptop',
  'dumbbell',
  'coffee-cup',
  'water-bottle',
  'skincare-bottle',
  'pet',
  'shopping-bag',
] as const
export type InfluencerAccessory = (typeof INFLUENCER_ACCESSORIES)[number]

export const INFLUENCER_SCENES_MAX = 3
export const INFLUENCER_ACCESSORIES_MAX = 4

export const INFLUENCER_SORTS = ['popular', 'newest', 'az'] as const
export type InfluencerSort = (typeof INFLUENCER_SORTS)[number]

/** Default model for influencer anchor / cover generation. */
export const INFLUENCER_DEFAULT_MODEL = 'openai/gpt-image-2' as const

/** Shot packs for influencer generation — Quick (identity floor) vs full UGC kit. */
export const INFLUENCER_SHOT_PACKS = ['quick', 'ugc-kit'] as const
export type InfluencerShotPack = (typeof INFLUENCER_SHOT_PACKS)[number]

export const INFLUENCER_SHOT_PACK_SPEC = {
  quick: { shots: 3, coverCandidates: 1, billed: 3 },
  'ugc-kit': { shots: 6, coverCandidates: 1, billed: 6 },
} as const satisfies Record<
  InfluencerShotPack,
  { shots: number; coverCandidates: number; billed: number }
>

/** @deprecated Prefer INFLUENCER_SHOT_PACK_SPEC[pack].shots — kept for transitional imports. */
export const INFLUENCER_ANCHOR_SHOT_COUNT = INFLUENCER_SHOT_PACK_SPEC.quick.shots

export const INFLUENCER_SHOT_IDS = [
  'front-portrait',
  'three-quarter',
  'full-body',
  'selfie-talking',
  'product-hold',
  'seated-testimonial',
  'outdoor-walk',
  'mirror-ootd',
] as const
export type InfluencerShotId = (typeof INFLUENCER_SHOT_IDS)[number]

export type InfluencerAppearance = {
  hairColor: string
  hairStyle: string
  eyeColor: string
  skinTone: string
  bodyShape: string
  height?: InfluencerHeight
  distinguishingFeatures?: string[]
  facialHair?: string
  makeup?: string
  /** Worn / held props locked across shots. */
  accessories?: string[]
}

/** LLM-authored identity lock reused on every subsequent generation. */
export type InfluencerCharacterSheet = {
  identityLock: string
  signatureDetails: string[]
  wardrobe: { casual: string; onCamera: string; active: string }
  environments: string[]
  expressionRange: string[]
}

export type InfluencerGalleryShot = {
  shotId: InfluencerShotId | string
  url: string
  aspectRatio: string
}

export type InfluencerIdentity = {
  method: InfluencerIdentityMethod
  seed?: number
  basePromptFragment: string
  /** Generated gallery anchors used for future identity-locked shots. */
  referenceImageUrls: string[]
  /** Optional user-uploaded hybrid refs (face + vibe), max 3. */
  userReferenceImageUrls?: string[]
  loraModelId?: string
  characterSheet?: InfluencerCharacterSheet
  shotPack?: InfluencerShotPack
}

export type Influencer = {
  _id: string
  workspaceId: string | null
  createdBy: string | null
  visibility: InfluencerVisibility
  source: InfluencerSource
  name: string
  bio?: string
  /** Free-text creative direction for scenes, outfits, and mood. */
  directions?: string
  niche: string[]
  /** Structured UGC situations (max 3); rotates across shot pack. */
  scenes?: string[]
  gender: InfluencerGender
  ageRange: InfluencerAgeRange
  ethnicity?: string
  appearance: InfluencerAppearance
  aestheticTags: string[]
  photoStyle?: InfluencerPhotoStyle
  identity: InfluencerIdentity
  status: InfluencerStatus
  coverImageUrl?: string
  galleryImageUrls: string[]
  /** Labeled gallery entries for pack shots (preferred over galleryImageUrls alone). */
  galleryShots?: InfluencerGalleryShot[]
  usageCount: number
  error?: string
  createdAt: Date
  updatedAt: Date
}

export type InfluencerCloneRequest = {
  _id: string
  workspaceId: string
  userId: string
  uploadedImageUrls: string[]
  consentConfirmedAt: Date
  status: InfluencerCloneStatus
  resultInfluencerId?: string
  trainingJobId?: string
  error?: string
  name: string
  bio?: string
  niche: string[]
  gender: InfluencerGender
  ageRange: InfluencerAgeRange
  ethnicity?: string
  appearance?: InfluencerAppearance
  aestheticTags: string[]
  createdAt: Date
  updatedAt: Date
}

export type CreateInfluencerAppearancePayload = {
  hairColor: string
  hairStyle: string
  eyeColor: string
  skinTone: string
  bodyShape: string
  height?: InfluencerHeight
  distinguishingFeatures?: string[]
  facialHair?: string
  makeup?: string
  accessories?: string[]
}

export type CreateInfluencerPayload = {
  workspaceId: string
  model?: string
  name: string
  bio?: string
  /** Free-text creative direction for scenes, outfits, and mood. */
  directions?: string
  /** Empty allowed when userReferenceImageUrls are provided. */
  niche: string[]
  /** Structured UGC situations (max 3). */
  scenes?: string[]
  gender: InfluencerGender
  ageRange: InfluencerAgeRange
  ethnicity?: string
  appearance: CreateInfluencerAppearancePayload
  aestheticTags?: string[]
  photoStyle?: InfluencerPhotoStyle
  /** Quick (3) or UGC kit (6). Defaults to quick. */
  shotPack?: InfluencerShotPack
  /** Optional advanced override; otherwise built server-side from appearance. */
  basePromptFragment?: string
  /**
   * Optional hybrid reference images (face + vibe), max 3 HTTPS URLs.
   * When provided, niche / look / style fields may be omitted — refs drive generation.
   */
  userReferenceImageUrls?: string[]
}

export type UpdateInfluencerPayload = {
  name?: string
  bio?: string
  directions?: string
  niche?: string[]
  scenes?: string[]
  aestheticTags?: string[]
  photoStyle?: InfluencerPhotoStyle
}

export type CloneInfluencerPayload = {
  workspaceId: string
  model?: string
  uploadedImageUrls: string[]
  consentConfirmed: boolean
  name: string
  bio?: string
  niche?: string[]
  gender: InfluencerGender
  ageRange: InfluencerAgeRange
  ethnicity?: string
  appearance?: CreateInfluencerAppearancePayload
  aestheticTags?: string[]
}

export type GetInfluencersResponse = {
  influencers: Influencer[]
}

export type GetInfluencerCloneRequestResponse = {
  cloneRequest: InfluencerCloneRequest
}

/** Returned when create/clone enqueues a Trigger.dev job. */
export type InfluencerJobResponse = {
  runId: string
  publicAccessToken: string
}

export type CreateInfluencerResponse = InfluencerJobResponse & {
  influencer: Influencer
}

export type CloneInfluencerResponse = InfluencerJobResponse & {
  cloneRequest: InfluencerCloneRequest
}

export type DeleteInfluencerResponse = {
  deleted: boolean
}

export type ExploreInfluencersQuery = {
  page?: number
  limit?: number
  sort?: InfluencerSort
  query?: string
  /** Single value or comma-separated list for `$in` matching. */
  gender?: InfluencerGender | string
  /** Single value or comma-separated list for `$in` matching. */
  ageRange?: InfluencerAgeRange | string
  hairColor?: string
  hairStyle?: string
  eyeColor?: string
  skinTone?: string
  bodyShape?: string
  niche?: string | string[]
  /** Single value or comma-separated list for `$in` matching. */
  status?: InfluencerStatus | string
}

export type WorkspaceInfluencersQuery = ExploreInfluencersQuery & {
  visibility?: InfluencerVisibility
  source?: InfluencerSource
}
