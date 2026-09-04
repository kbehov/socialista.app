import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import {
  UgcClipStatus,
  UgcClipType,
  UgcFlowStep,
  UgcProductKind,
  UgcProjectStatus,
  UgcScriptSource,
  UgcVoiceProvider,
  type IUgcClip,
  type IUgcClipModels,
  type IUgcClipVoice,
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

const clipModelsSchema = new Schema<IUgcClipModels>(
  {
    image: { type: String },
    script: { type: String },
    video: { type: String },
    planner: { type: String },
  },
  { _id: false },
)

const voiceSchema = new Schema<IUgcClipVoice>(
  {
    provider: {
      type: String,
      enum: enumValues(UgcVoiceProvider),
      default: UgcVoiceProvider.ELEVENLABS,
    },
    voiceId: { type: String },
    voiceName: { type: String },
    speed: { type: Number },
    stability: { type: Number },
    enabled: { type: Boolean },
  },
  { _id: false },
)

const stillSchema = new Schema<IUgcSceneStill>(
  {
    index: { type: Number, required: true },
    imageUrl: { type: String },
    generationId: { type: String },
    enhancedPrompt: { type: String },
  },
  { _id: false },
)

const clipSchema = new Schema<IUgcClip>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: enumValues(UgcClipType),
      required: true,
    },
    name: { type: String },
    status: {
      type: String,
      enum: enumValues(UgcClipStatus),
      default: UgcClipStatus.IDLE,
    },
    durationSec: { type: Number, default: 8 },
    sceneCount: { type: Number, enum: [1, 2, 3] },
    influencerId: { type: Schema.Types.ObjectId, ref: 'Influencer' },
    script: { type: scriptSchema },
    voice: { type: voiceSchema },
    models: { type: clipModelsSchema },
    scenePrompt: { type: String },
    directions: { type: String },
    referenceImageUrls: { type: [String], default: [] },
    stills: { type: [stillSchema], default: [] },
    plannedPrompt: { type: String },
    negativePrompt: { type: String },
    videoUrl: { type: String },
    thumbnailUrl: { type: String },
    generationId: { type: String },
    composedVideoId: { type: Schema.Types.ObjectId, ref: 'Video' },
    stillsRunId: { type: String },
    videoRunId: { type: String },
    approved: { type: Boolean },
    error: { type: String },
  },
  { _id: false },
)

const variantSchema = new Schema<IUgcVariant>(
  {
    id: { type: String, required: true },
    influencerId: { type: Schema.Types.ObjectId, ref: 'Influencer', required: true },
    status: {
      type: String,
      enum: enumValues(UgcClipStatus),
      default: UgcClipStatus.IDLE,
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
    project: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productImageUrls: { type: [String], default: [] },
    productName: { type: String },
    productDescription: { type: String },
    productUrl: { type: String },
    productKind: { type: String, enum: enumValues(UgcProductKind) },
    influencerId: { type: Schema.Types.ObjectId, ref: 'Influencer' },
    aspectRatio: { type: String, default: '9:16' },
    models: { type: modelsSchema, required: true },
    flowStep: { type: String, enum: enumValues(UgcFlowStep) },
    clips: { type: [clipSchema], default: [] },
    assembledVideoUrl: { type: String },
    assembledGenerationId: { type: String },
    assembledRunId: { type: String },
    composedProjectVideoId: { type: Schema.Types.ObjectId, ref: 'Video' },
    error: { type: String },
    influencerIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Influencer' }], default: undefined },
    sceneCount: { type: Number, enum: [1, 2, 3] },
    script: { type: scriptSchema },
    directions: { type: String },
    variants: { type: [variantSchema], default: undefined },
    stillsRunId: { type: String },
    videoRunId: { type: String },
  },
  { timestamps: true },
)

ugcProjectSchema.index({ workspace: 1, updatedAt: -1 })
ugcProjectSchema.index({ workspace: 1, status: 1 })
ugcProjectSchema.index({ project: 1, updatedAt: -1 })
ugcProjectSchema.index({ project: 1, status: 1 })

export const UgcProjectModel = model<IUgcProject>('UgcProject', ugcProjectSchema)
