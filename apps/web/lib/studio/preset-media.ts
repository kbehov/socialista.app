import type { AttachedMedia } from '@/components/files/attach-media/types'
import type { Preset } from '@socialista/types'

export function presetToAttachedMedia(preset: Preset): AttachedMedia[] {
  return preset.attachments.map((attachment, index) => ({
    id: `${preset._id}-attachment-${index}`,
    url: attachment.url,
    name: attachment.name,
    kind: 'image',
    source: 'library',
    label: attachment.name ?? 'Reference',
  }))
}

export function truncatePresetPrompt(text: string, max = 84): string {
  if (text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}…`
}

export function buildPresetPlaceholderExamples(presets: Preset[]): string[] {
  return presets.map(preset => truncatePresetPrompt(preset.prompt))
}
