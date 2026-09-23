import { resolveTemplateRecreatePrompt } from '@/lib/studio/template-recreate'
import type { StudioTemplateDto } from '@socialista/types'

export const VIDEO_TEMPLATE_RECREATE_IDEAS = [
  {
    id: 'replace-character',
    label: 'Replace character',
    prompt:
      'Replace the person in @image1 with the creator from @image2. Keep the original motion, framing, lighting, and background.',
  },
  {
    id: 'replace-product',
    label: 'Replace product',
    prompt:
      'Replace the product in @image1 with the product from @image2. Keep the original camera move, styling, and pacing.',
  },
  {
    id: 'match-the-shot',
    label: 'Match the shot',
    prompt:
      'Recreate the camera move, pacing, and lighting from @image1. Keep the subject and setting, and make it feel native to Reels.',
  },
  {
    id: 'use-my-assets',
    label: 'My creator & product',
    prompt:
      'Recreate @image1 using the creator from @image2 with the product from @image3. Keep the original motion, framing, and lighting so it still feels like this template.',
  },
] as const

export function videoTemplateRecreatePrompt(template: StudioTemplateDto): string {
  return resolveTemplateRecreatePrompt(template, VIDEO_TEMPLATE_RECREATE_IDEAS)
}
