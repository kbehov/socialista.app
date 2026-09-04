import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import {
  InfluencerAgeRange,
  InfluencerGender,
  InfluencerHeight,
  InfluencerIdentityMethod,
  InfluencerPhotoStyle,
  InfluencerShotPack,
  InfluencerSource,
  InfluencerStatus,
  InfluencerVisibility,
  type IInfluencer,
  type InfluencerAppearance,
  type InfluencerCharacterSheet,
  type InfluencerGalleryShot,
  type InfluencerIdentity,
} from '../types/influencer.types.js'

const appearanceSchema = new Schema<InfluencerAppearance>(
  {
    hairColor: { type: String, required: true },
    hairStyle: { type: String, required: true },
    eyeColor: { type: String, required: true },
    skinTone: { type: String, required: true },
    bodyShape: { type: String, required: true },
    height: { type: String, enum: enumValues(InfluencerHeight) },
    distinguishingFeatures: { type: [String], default: undefined },
    facialHair: { type: String },
    makeup: { type: String },
    accessories: { type: [String], default: undefined },
  },
  { _id: false },
)

const characterSheetSchema = new Schema<InfluencerCharacterSheet>(
  {
    identityLock: { type: String, required: true },
    signatureDetails: { type: [String], default: [] },
    wardrobe: {
      type: new Schema(
        {
          casual: { type: String, required: true },
          onCamera: { type: String, required: true },
          active: { type: String, required: true },
        },
        { _id: false },
      ),
      required: true,
    },
    environments: { type: [String], default: [] },
    expressionRange: { type: [String], default: [] },
  },
  { _id: false },
)

const identitySchema = new Schema<InfluencerIdentity>(
  {
    method: {
      type: String,
      enum: enumValues(InfluencerIdentityMethod),
      required: true,
      default: InfluencerIdentityMethod.REFERENCE,
    },
    seed: { type: Number },
    basePromptFragment: { type: String, required: true },
    referenceImageUrls: { type: [String], default: [] },
    userReferenceImageUrls: { type: [String], default: undefined },
    loraModelId: { type: String },
    characterSheet: { type: characterSheetSchema },
    shotPack: { type: String, enum: enumValues(InfluencerShotPack) },
  },
  { _id: false },
)

const galleryShotSchema = new Schema<InfluencerGalleryShot>(
  {
    shotId: { type: String, required: true },
    url: { type: String, required: true },
    aspectRatio: { type: String, required: true },
  },
  { _id: false },
)

const influencerSchema = new Schema<IInfluencer>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', default: null, index: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', default: null, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    visibility: {
      type: String,
      enum: enumValues(InfluencerVisibility),
      required: true,
      default: InfluencerVisibility.PRIVATE,
      index: true,
    },
    source: {
      type: String,
      enum: enumValues(InfluencerSource),
      required: true,
    },
    name: { type: String, required: true, trim: true },
    bio: { type: String },
    directions: { type: String },
    niche: { type: [String], default: [], index: true },
    scenes: { type: [String], default: undefined },
    vibeTags: { type: [String], default: undefined },
    gender: {
      type: String,
      enum: enumValues(InfluencerGender),
      required: true,
      index: true,
    },
    ageRange: {
      type: String,
      enum: enumValues(InfluencerAgeRange),
      required: true,
      index: true,
    },
    ethnicity: { type: String },
    appearance: { type: appearanceSchema, required: true },
    aestheticTags: { type: [String], default: [] },
    photoStyle: {
      type: String,
      enum: enumValues(InfluencerPhotoStyle),
    },
    identity: { type: identitySchema, required: true },
    status: {
      type: String,
      enum: enumValues(InfluencerStatus),
      required: true,
      default: InfluencerStatus.DRAFT,
      index: true,
    },
    coverImageUrl: { type: String },
    galleryImageUrls: { type: [String], default: [] },
    galleryShots: { type: [galleryShotSchema], default: undefined },
    usageCount: { type: Number, default: 0 },
    error: { type: String },
  },
  { timestamps: true },
)

influencerSchema.index({ visibility: 1, status: 1, usageCount: -1 })
influencerSchema.index({ visibility: 1, status: 1, createdAt: -1 })
influencerSchema.index({ workspace: 1, status: 1, updatedAt: -1 })
influencerSchema.index({ workspace: 1, name: 1 })
influencerSchema.index({ project: 1, status: 1, updatedAt: -1 })
influencerSchema.index({ name: 'text', bio: 'text' })
influencerSchema.index({
  gender: 1,
  ageRange: 1,
  'appearance.hairColor': 1,
  'appearance.eyeColor': 1,
  'appearance.skinTone': 1,
  'appearance.bodyShape': 1,
})

export const InfluencerModel = model<IInfluencer>('Influencer', influencerSchema)
