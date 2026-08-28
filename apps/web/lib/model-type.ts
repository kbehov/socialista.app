import { ModelType } from '@socialista/types'
import { AudioLinesIcon, CaptionsIcon, ImageIcon, TypeIcon, VideoIcon, type LucideIcon } from 'lucide-react'

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
]

export function getModelTypeOption(type: ModelType) {
  return MODEL_TYPE_OPTIONS.find(option => option.value === type)
}
