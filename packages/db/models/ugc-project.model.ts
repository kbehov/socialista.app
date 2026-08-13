import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import {
  UgcProjectStatus,
  UgcScriptSource,
  UgcVariantStatus,
  type IUgcProject,
  type IUgcProjectModels,
  type IUgcProjectScript,
  type IUgcSceneStill,
  type IUgcVariant,
} from '../types/ugc-project.types.js'

const modelsSchema = new Schema<IUgcProjectModels>(
  {
    image: { type: String, required: true },
    script: { type: String },
    video: { type: String, required: true },
    planner: { type: String },
  },
  { _id: false },
)

const scriptSchema = new Schema<IUgcProjectScript>(
  {
    text: { type: String, default: '' },
    source: {
      type: String,
      enum: enumValues(UgcScriptSource),
      default: UgcScriptSource.USER,
    },
  },
  { _id: false },
)

const stillSchema = new Schema<IUgcSceneStill>(
  {
    index: { type: Number, required: true },
    imageUrl: { type: String },
    generationId: { type: String },
  },
  { _id: false },
)

const variantSchema = new Schema<IUgcVariant>(
  {
    id: { type: String, required: true },
    influencerId: { type: Schema.Types.ObjectId, ref: 'Influencer', required: true },
    status: {
      type: String,
      enum: enumValues(UgcVariantStatus),
      default: UgcVariantStatus.IDLE,
    },
    stills: { type: [stillSchema], default: [] },
    plannedPrompt: { type: String },
    negativePrompt: { type: String },
    videoUrl: { type: String },
    thumbnailUrl: { type: String },
    generationId: { type: String },
    composedVideoId: { type: Schema.Types.ObjectId, ref: 'Video' },
    error: { type: String },
  },
  { _id: false },
)

const ugcProjectSchema = new Schema<IUgcProject>(
  {
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: enumValues(UgcProjectStatus),
      default: UgcProjectStatus.DRAFT,
    },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productImageUrls: { type: [String], default: [] },
    productName: { type: String },
    influencerIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Influencer' }], default: [] },
    sceneCount: { type: Number, enum: [1, 2, 3], default: 2 },
    aspectRatio: { type: String, default: '9:16' },
    models: { type: modelsSchema, required: true },
    script: { type: scriptSchema, default: () => ({ text: '', source: UgcScriptSource.USER }) },
    directions: { type: String },
    variants: { type: [variantSchema], default: [] },
    stillsRunId: { type: String },
    videoRunId: { type: String },
    error: { type: String },
  },
  { timestamps: true },
)

ugcProjectSchema.index({ workspace: 1, updatedAt: -1 })
ugcProjectSchema.index({ workspace: 1, status: 1 })

export const UgcProjectModel = model<IUgcProject>('UgcProject', ugcProjectSchema)
