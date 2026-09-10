import type { PresetAttachment, PresetKind } from '@socialista/types'
import type { HydratedDocument, Types } from 'mongoose'

export type { PresetAttachment, PresetKind }

export interface IPreset {
  _id: Types.ObjectId
  kind: PresetKind
  name: string
  description: string
  prompt: string
  image: string
  attachments: PresetAttachment[]
  active: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export type PresetDocument = HydratedDocument<IPreset>

export type CreatePresetInput = {
  kind: PresetKind
  name: string
  description: string
  prompt: string
  image: string
  attachments?: PresetAttachment[]
  active?: boolean
  sortOrder?: number
}

export type UpdatePresetInput = {
  kind?: PresetKind
  name?: string
  description?: string
  prompt?: string
  image?: string
  attachments?: PresetAttachment[] | null
  active?: boolean
  sortOrder?: number
}
