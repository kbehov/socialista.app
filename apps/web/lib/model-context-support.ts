import { ContextSupport } from '@socialista/types'
import {
  AudioLinesIcon,
  FileIcon,
  ImageIcon,
  TypeIcon,
  VideoIcon,
  type LucideIcon,
} from 'lucide-react'

export type ContextSupportOption = {
  value: ContextSupport
  label: string
  icon: LucideIcon
}

export const CONTEXT_SUPPORT_OPTIONS: ContextSupportOption[] = [
  { value: ContextSupport.TEXT, label: 'Text', icon: TypeIcon },
  { value: ContextSupport.IMAGE, label: 'Image', icon: ImageIcon },
  { value: ContextSupport.AUDIO, label: 'Audio', icon: AudioLinesIcon },
  { value: ContextSupport.VIDEO, label: 'Video', icon: VideoIcon },
  { value: ContextSupport.FILE, label: 'File', icon: FileIcon },
]

export function getContextSupportOption(support: ContextSupport) {
  return CONTEXT_SUPPORT_OPTIONS.find(option => option.value === support)
}
