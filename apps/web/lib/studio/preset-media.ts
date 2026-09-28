import type { StudioHomeFeatureCard } from '@/components/studio/studio-home-hero'
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

/** Curated prompts for image studio typing placeholder when no presets are loaded. */
export const IMAGE_STUDIO_PLACEHOLDER_EXAMPLES = [
  'Matte serum on travertine, hard side light, luxury PDP still…',
  'Creator unboxing skincare, soft window light, authentic UGC…',
  'Minimal product flat lay, linen backdrop, editorial ecommerce…',
  'Perfume bottle in golden hour, shallow depth, campaign hero…',
  'Matcha tin on slate, overhead 50mm, crisp shadows, feed-ready…',
] as const

export function mapPresetToFeatureCard(preset: Preset): StudioHomeFeatureCard {
  return {
    id: preset._id,
    title: preset.name,
    description: preset.description,
    prompt: preset.prompt,
    image: preset.image,
  }
}
