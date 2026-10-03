import { ModelType } from '@socialista/types'
import { AudioLinesIcon, CaptionsIcon, ImageIcon, MicIcon, TypeIcon, VideoIcon, type LucideIcon } from 'lucide-react'

export type ModelTypeOption = {
  value: ModelType
  label: string
  icon: LucideIcon
}

export const MODEL_TYPE_OPTIONS: ModelTypeOption[] = [
  { value: ModelType.TEXT, label: 'Text', icon: TypeIcon },
  { value: ModelType.IMAGE, label: 'Image', icon: ImageIcon },
  { value: ModelType.VIDEO, label: 'Video', icon: VideoIcon },
  { value: ModelType.AUDIO, label: 'Audio', icon: AudioLinesIcon },
  { value: ModelType.TRANSCRIBE, label: 'Transcribe', icon: CaptionsIcon },
  { value: ModelType.LIP_SYNC, label: 'Lip sync', icon: MicIcon },
]

export function getModelTypeOption(type: ModelType) {
  return MODEL_TYPE_OPTIONS.find(option => option.value === type)
}

/** Short capability line for marketing surfaces (e.g. landing model grid). */
export const MODEL_TYPE_LANDING_CATEGORY: Record<ModelType, string> = {
  [ModelType.TEXT]: 'Copy & prompts',
  [ModelType.IMAGE]: 'Image creation',
  [ModelType.VIDEO]: 'Video creation',
  [ModelType.AUDIO]: 'Voiceover generation',
  [ModelType.TRANSCRIBE]: 'Transcription',
  [ModelType.LIP_SYNC]: 'Video creation',
}

export function getModelTypeLandingCategory(type: ModelType) {
  return MODEL_TYPE_LANDING_CATEGORY[type] ?? type
}
