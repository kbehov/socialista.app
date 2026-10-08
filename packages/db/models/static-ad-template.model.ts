import { ASPECT_RATIOS, STATIC_AD_TEMPLATE_FORMATS } from '@socialista/types'
import { model, Schema } from 'mongoose'
import type {
  IStaticAdTemplate,
  IStaticAdTemplateBlueprint,
  IStaticAdTemplatePaletteSwatch,
} from '../types/static-ad-template.types.js'

const staticAdTemplatePaletteSchema = new Schema<IStaticAdTemplatePaletteSwatch>(
  {
    hex: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
  },
  { _id: false },
)

const staticAdTemplateBlueprintSchema = new Schema<IStaticAdTemplateBlueprint>(
  {
    format: { type: String, required: true, enum: [...STATIC_AD_TEMPLATE_FORMATS] },
    layout: { type: String, required: true, trim: true },
    typeHierarchy: { type: String, required: true, trim: true },
    palette: { type: [staticAdTemplatePaletteSchema], required: true, default: [] },
    hookStyle: { type: String, required: true, trim: true },
    sceneJob: { type: String, required: true, trim: true },
    aspectRatioHint: { type: String, enum: [...ASPECT_RATIOS] },
    analyzedAt: { type: Date, required: true },
    version: { type: Number, required: true },
  },
  { _id: false },
)

const staticAdTemplateSchema = new Schema<IStaticAdTemplate>(
  {
    imageUrl: { type: String, required: true },
    sourceImageUrl: { type: String, required: true, unique: true },
    categories: { type: [String], required: true, default: [] },
    name: { type: String, trim: true },
    blueprint: { type: staticAdTemplateBlueprintSchema },
    active: { type: Boolean, required: true, default: true, index: true },
  },
  { timestamps: true },
)

staticAdTemplateSchema.index({ active: 1, categories: 1 })
staticAdTemplateSchema.index({ active: 1, createdAt: -1 })

export const StaticAdTemplateModel = model<IStaticAdTemplate>('StaticAdTemplate', staticAdTemplateSchema)
