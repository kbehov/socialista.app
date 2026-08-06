import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import {
  InfluencerAgeRange,
  InfluencerGender,
  InfluencerHeight,
  InfluencerIdentityMethod,
  InfluencerPhotoStyle,
  InfluencerSource,
  InfluencerStatus,
  InfluencerVisibility,
  type IInfluencer,
  type InfluencerAppearance,
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
    loraModelId: { type: String },
  },
  { _id: false },
)

const influencerSchema = new Schema<IInfluencer>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', default: null, index: true },
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
    usageCount: { type: Number, default: 0 },
    error: { type: String },
  },
  { timestamps: true },
)

influencerSchema.index({ visibility: 1, status: 1, usageCount: -1 })
influencerSchema.index({ visibility: 1, status: 1, createdAt: -1 })
influencerSchema.index({ workspace: 1, status: 1, updatedAt: -1 })
influencerSchema.index({ workspace: 1, name: 1 })
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
