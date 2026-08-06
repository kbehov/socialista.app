import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import {
  InfluencerAgeRange,
  InfluencerCloneRequestStatus,
  InfluencerGender,
  InfluencerHeight,
  type IInfluencerCloneRequest,
  type InfluencerAppearance,
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
  },
  { _id: false },
)

const influencerCloneRequestSchema = new Schema<IInfluencerCloneRequest>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    uploadedImageUrls: { type: [String], required: true },
    consentConfirmedAt: { type: Date, required: true },
    status: {
      type: String,
      enum: enumValues(InfluencerCloneRequestStatus),
      required: true,
      default: InfluencerCloneRequestStatus.PENDING,
      index: true,
    },
    resultInfluencerId: { type: Schema.Types.ObjectId, ref: 'Influencer' },
    trainingJobId: { type: String },
    error: { type: String },
    name: { type: String, required: true, trim: true },
    bio: { type: String },
    niche: { type: [String], default: [] },
    gender: {
      type: String,
      enum: enumValues(InfluencerGender),
      required: true,
    },
    ageRange: {
      type: String,
      enum: enumValues(InfluencerAgeRange),
      required: true,
    },
    ethnicity: { type: String },
    appearance: { type: appearanceSchema },
    aestheticTags: { type: [String], default: [] },
  },
  { timestamps: true },
)

influencerCloneRequestSchema.index({ workspace: 1, createdAt: -1 })
influencerCloneRequestSchema.index({ userId: 1, createdAt: -1 })

export const InfluencerCloneRequestModel = model<IInfluencerCloneRequest>(
  'InfluencerCloneRequest',
  influencerCloneRequestSchema,
)
