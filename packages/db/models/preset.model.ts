import { PRESET_KIND_VALUES } from '@socialista/types'
import { model, Schema } from 'mongoose'
import type { IPreset } from '../types/preset.types.js'

const presetAttachmentSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
  },
  { _id: false },
)

const presetSchema = new Schema<IPreset>(
  {
    kind: { type: String, enum: PRESET_KIND_VALUES, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, default: '' },
    prompt: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    attachments: { type: [presetAttachmentSchema], required: true, default: [] },
    active: { type: Boolean, required: true, default: true, index: true },
    sortOrder: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
)

presetSchema.index({ kind: 1, active: 1, sortOrder: 1 })

export const PresetModel = model<IPreset>('Preset', presetSchema)
