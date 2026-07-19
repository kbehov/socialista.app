import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import {
  GenerationKind,
  GenerationResultType,
  GenerationStatus,
  type IGeneration,
} from '../types/generation.types.js'

const generationAdCopySchema = new Schema(
  {
    headline: { type: String },
    subheadline: { type: String },
    cta: { type: String },
    brandName: { type: String },
  },
  { _id: false },
)

const generationInputsSchema = new Schema(
  {
    aspectRatio: { type: String },
    referenceImageUrl: { type: String },
    productImageUrl: { type: String },
    language: { type: String },
    adCopy: { type: generationAdCopySchema },
  },
  { _id: false, strict: false },
)

const generationResultSchema = new Schema(
  {
    type: {
      type: String,
      enum: enumValues(GenerationResultType),
      required: true,
    },
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    width: { type: Number },
    height: { type: Number },
    durationSec: { type: Number },
    mimeType: { type: String },
    imageId: { type: String },
    videoId: { type: String },
  },
  { _id: false },
)

const generationSchema = new Schema<IGeneration>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    kind: {
      type: String,
      enum: enumValues(GenerationKind),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: enumValues(GenerationStatus),
      default: GenerationStatus.RUNNING,
      index: true,
    },
    taskId: { type: String, required: true },
    triggerRunId: { type: String, required: true },
    prompt: { type: String },
    enhancedPrompt: { type: String },
    model: { type: String, required: true },
    modelName: { type: String },
    modelProvider: { type: String },
    inputs: { type: generationInputsSchema },
    result: { type: generationResultSchema },
    cost: { type: Number, required: true, default: 0 },
    creditsCharged: { type: Number, required: true, default: 0 },
    errorMessage: { type: String },
    startedAt: { type: Date, required: true },
    finishedAt: { type: Date },
    durationMs: { type: Number },
  },
  { timestamps: true },
)

generationSchema.index({ workspace: 1, createdAt: -1 })
generationSchema.index({ workspace: 1, kind: 1, createdAt: -1 })
generationSchema.index({ triggerRunId: 1 }, { unique: true })
generationSchema.index({ workspace: 1, createdBy: 1, createdAt: -1 })
generationSchema.index({ workspace: 1, status: 1, createdAt: -1 })

export const GenerationModel = model<IGeneration>('Generation', generationSchema)
