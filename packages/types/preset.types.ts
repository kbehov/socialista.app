export const PresetKind = {
  IMAGE: 'image',
  VIDEO: 'video',
  SLIDESHOW: 'slideshow',
} as const

export type PresetKind = (typeof PresetKind)[keyof typeof PresetKind]

export const PRESET_KIND_VALUES = Object.values(PresetKind)

const PRESET_KIND_SET = new Set<string>(PRESET_KIND_VALUES)

export function isPresetKind(value: unknown): value is PresetKind {
  return typeof value === 'string' && PRESET_KIND_SET.has(value)
}

export const PRESET_ATTACHMENT_MAX = 3
export const PRESET_NAME_MAX_LENGTH = 80
export const PRESET_DESCRIPTION_MAX_LENGTH = 200
export const PRESET_PROMPT_MAX_LENGTH = 4000

export type PresetAttachment = {
  url: string
  name?: string
}

export type Preset = {
  _id: string
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

export type CreatePresetPayload = {
  kind: PresetKind
  name: string
  description: string
  prompt: string
  image: string
  attachments?: PresetAttachment[]
  active?: boolean
  sortOrder?: number
}

export type UpdatePresetPayload = {
  kind?: PresetKind
  name?: string
  description?: string
  prompt?: string
  image?: string
  attachments?: PresetAttachment[] | null
  active?: boolean
  sortOrder?: number
}

export type PresetResponse = {
  preset: Preset
}

export type GetPresetsResponse = {
  presets: Preset[]
}
