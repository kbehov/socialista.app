import { HydratedDocument, Types } from 'mongoose'

export enum InfluencerGender {
  FEMALE = 'female',
  MALE = 'male',
}

export enum InfluencerAgeRange {
  AGE_18_24 = '18-24',
  AGE_25_34 = '25-34',
  AGE_35_44 = '35-44',
  AGE_45_55 = '45-55',
  AGE_65_PLUS = '65+',
}

export enum InfluencerHeight {
  SHORT = 'short',
  AVERAGE = 'average',
  TALL = 'tall',
}

export enum InfluencerVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum InfluencerSource {
  LIBRARY = 'library',
  GENERATED = 'generated',
  CLONED = 'cloned',
}

export enum InfluencerStatus {
  DRAFT = 'draft',
  GENERATING = 'generating',
  READY = 'ready',
  FAILED = 'failed',
}

export enum InfluencerIdentityMethod {
  REFERENCE = 'reference',
  LORA = 'lora',
}

export enum InfluencerPhotoStyle {
  UGC_PHONE = 'ugc-phone',
  CREATOR_CAMERA = 'creator-camera',
  STUDIO_POLISH = 'studio-polish',
}

export enum InfluencerShotPack {
  QUICK = 'quick',
  UGC_KIT = 'ugc-kit',
}

export enum InfluencerCloneRequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}

export interface InfluencerAppearance {
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

export interface InfluencerLookSpec {
  canvas: { crop: string; subject_scale: string }
  pose: {
    head: string
    torso: string
    arms: string
    gaze: string
    expression: string
  }
  wardrobe: { garment: string; material: string; color: string; fit: string }
  environment: { location: string; surfaces: string; light_props: string }
  lighting: {
    source: string
    direction: string
    quality: string
    color_temperature: string
  }
  camera: {
    device: string
    focal_length: string
    height: string
    depth_of_field: string
    processing: string
  }
  texture: { skin: string; hair: string; fabric: string; background: string }
}

export interface InfluencerCharacterSheet {
  identityLock: string
  signatureDetails: string[]
  wardrobe: { casual: string; onCamera: string; active: string }
  environments: string[]
  expressionRange: string[]
  face?: {
    shape: string
    eyes: string
    brows: string
    nose: string
    lips: string
    makeup: string
  }
  skin?: { tone: string; texture: string; retouching: string }
  hair?: { length: string; texture: string; part: string; shine: string }
  cameraFamily?: string
  lightingFamily?: string
  lookSpec?: InfluencerLookSpec
}

export interface InfluencerGalleryShot {
  shotId: string
  url: string
  aspectRatio: string
}

export interface InfluencerHookVideo {
  _id: Types.ObjectId
  sourceImageUrl: string
  videoUrl: string
  videoId: string
  generationId: string
  prompt: string
  presetId?: string
  model: string
  durationSec: number
  createdAt: Date
}

export type AppendInfluencerHookVideoInput = {
  sourceImageUrl: string
  videoUrl: string
  videoId: string
  generationId: string
  prompt: string
  presetId?: string
  model: string
  durationSec: number
  createdAt?: Date
}

export type AppendInfluencerGalleryImageInput = {
  url: string
  aspectRatio: string
  shotId?: string
}

export interface InfluencerIdentity {
  method: InfluencerIdentityMethod
  seed?: number
  basePromptFragment: string
  /** Generated gallery anchors used for future identity-locked shots. */
  referenceImageUrls: string[]
  /** Optional user-uploaded style references (lighting / palette), max 3. */
  userReferenceImageUrls?: string[]
  loraModelId?: string
  characterSheet?: InfluencerCharacterSheet
  shotPack?: InfluencerShotPack
}

export interface IInfluencer {
  _id: Types.ObjectId
  /** Null for system/library influencers. */
  workspace: Types.ObjectId | null
  project?: Types.ObjectId | null
  createdBy: Types.ObjectId | null
  visibility: InfluencerVisibility
  source: InfluencerSource
  name: string
  bio?: string
  /** Free-text creative direction for scenes, outfits, and mood. */
  directions?: string
  niche: string[]
  /** Structured UGC situations (max 3); rotates across shot pack. */
  scenes?: string[]
  /** On-camera energy / demeanor (max 2). */
  vibeTags?: string[]
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
  galleryShots?: InfluencerGalleryShot[]
  hookVideos?: InfluencerHookVideo[]
  usageCount: number
  error?: string
  createdAt: Date
  updatedAt: Date
}

export type InfluencerDocument = HydratedDocument<IInfluencer>

export type CreateInfluencerInput = {
  workspace?: string | null
  project?: string | null
  createdBy?: string | null
  visibility: InfluencerVisibility
  source: InfluencerSource
  name: string
  bio?: string
  directions?: string
  niche: string[]
  scenes?: string[]
  vibeTags?: string[]
  gender: InfluencerGender
  ageRange: InfluencerAgeRange
  ethnicity?: string
  appearance: InfluencerAppearance
  aestheticTags?: string[]
  photoStyle?: InfluencerPhotoStyle
  identity: InfluencerIdentity
  status?: InfluencerStatus
  coverImageUrl?: string
  galleryImageUrls?: string[]
  galleryShots?: InfluencerGalleryShot[]
}

export type UpdateInfluencerInput = {
  name?: string
  bio?: string | null
  directions?: string | null
  niche?: string[]
  scenes?: string[]
  vibeTags?: string[]
  aestheticTags?: string[]
  photoStyle?: InfluencerPhotoStyle | null
  status?: InfluencerStatus
  coverImageUrl?: string | null
  galleryImageUrls?: string[]
  galleryShots?: InfluencerGalleryShot[]
  identity?: Partial<InfluencerIdentity>
  usageCount?: number
  error?: string | null
  visibility?: InfluencerVisibility
}

export interface IInfluencerCloneRequest {
  _id: Types.ObjectId
  workspace: Types.ObjectId
  userId: Types.ObjectId
  uploadedImageUrls: string[]
  consentConfirmedAt: Date
  status: InfluencerCloneRequestStatus
  resultInfluencerId?: Types.ObjectId
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

export type InfluencerCloneRequestDocument = HydratedDocument<IInfluencerCloneRequest>

export type CreateInfluencerCloneRequestInput = {
  workspace: string
  userId: string
  uploadedImageUrls: string[]
  consentConfirmedAt: Date
  status?: InfluencerCloneRequestStatus
  name: string
  bio?: string
  niche?: string[]
  gender: InfluencerGender
  ageRange: InfluencerAgeRange
  ethnicity?: string
  appearance?: InfluencerAppearance
  aestheticTags?: string[]
}

export type UpdateInfluencerCloneRequestInput = {
  status?: InfluencerCloneRequestStatus
  resultInfluencerId?: string | null
  trainingJobId?: string | null
  error?: string | null
}
