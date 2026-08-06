import { HydratedDocument, Types } from 'mongoose'

export enum InfluencerGender {
  FEMALE = 'female',
  MALE = 'male',
  NON_BINARY = 'non-binary',
}

export enum InfluencerAgeRange {
  AGE_18_24 = '18-24',
  AGE_25_34 = '25-34',
  AGE_35_44 = '35-44',
  AGE_45_PLUS = '45+',
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
}

export interface InfluencerIdentity {
  method: InfluencerIdentityMethod
  seed?: number
  basePromptFragment: string
  referenceImageUrls: string[]
  loraModelId?: string
}

export interface IInfluencer {
  _id: Types.ObjectId
  /** Null for system/library influencers. */
  workspace: Types.ObjectId | null
  createdBy: Types.ObjectId | null
  visibility: InfluencerVisibility
  source: InfluencerSource
  name: string
  bio?: string
  /** Free-text creative direction for scenes, outfits, and mood. */
  directions?: string
  niche: string[]
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
  usageCount: number
  error?: string
  createdAt: Date
  updatedAt: Date
}

export type InfluencerDocument = HydratedDocument<IInfluencer>

export type CreateInfluencerInput = {
  workspace?: string | null
  createdBy?: string | null
  visibility: InfluencerVisibility
  source: InfluencerSource
  name: string
  bio?: string
  directions?: string
  niche: string[]
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
}

export type UpdateInfluencerInput = {
  name?: string
  bio?: string | null
  directions?: string | null
  niche?: string[]
  aestheticTags?: string[]
  photoStyle?: InfluencerPhotoStyle | null
  status?: InfluencerStatus
  coverImageUrl?: string | null
  galleryImageUrls?: string[]
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
