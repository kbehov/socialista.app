import { ModelType } from '@socialista/types'
import { AudioLinesIcon, ImageIcon, SpeechIcon, TypeIcon, VideoIcon, type LucideIcon } from 'lucide-react'

export type ModelTypeOption = {
  value: ModelType
  label: string
  icon: LucideIcon
}

export const MODEL_TYPE_OPTIONS: ModelTypeOption[] = [
  { value: ModelType.VIDEO, label: 'Video', icon: VideoIcon },
  { value: ModelType.AUDIO, label: 'Audio', icon: AudioLinesIcon },
  { value: ModelType.IMAGE, label: 'Image', icon: ImageIcon },
  { value: ModelType.TEXT, label: 'Text', icon: TypeIcon },
  { value: ModelType.TEXT_TO_IMAGE, label: 'Text to Image', icon: ImageIcon },
  { value: ModelType.TEXT_TO_VIDEO, label: 'Text to Video', icon: VideoIcon },
  { value: ModelType.IMAGE_TO_VIDEO, label: 'Image to Video', icon: VideoIcon },
  { value: ModelType.IMAGE_TO_IMAGE, label: 'Image to Image', icon: ImageIcon },
  { value: ModelType.AUDIO_TO_TEXT, label: 'Audio to Text', icon: TypeIcon },
  { value: ModelType.TEXT_TO_AUDIO, label: 'Text to Audio', icon: AudioLinesIcon },
  { value: ModelType.TEXT_TO_SPEECH, label: 'Text to Speech', icon: SpeechIcon },
]

export function getModelTypeOption(type: ModelType) {
  return MODEL_TYPE_OPTIONS.find(option => option.value === type)
}
