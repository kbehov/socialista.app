import type { AttachedMedia } from '@/components/files/attach-media/types'
import type { StudioTemplateRecreateIdea } from '@/lib/studio/template-recreate'
import type { StaticAdTemplateDto } from '@socialista/types'

export const STATIC_AD_RECREATE_PROMPT = 'Recreate this ad with my attached images.'

export const STATIC_AD_TEMPLATE_PAGE_SIZE = 24

export const STATIC_AD_TEMPLATE_RECREATE_IDEAS: readonly StudioTemplateRecreateIdea[] = [
  {
    id: 'match-layout',
    label: 'Match layout',
    prompt: STATIC_AD_RECREATE_PROMPT,
  },
  {
    id: 'replace-product',
    label: 'Replace product',
    prompt:
      'Recreate the layout from @image1 using the product from @image2. Keep the original composition, lighting, and on-image structure.',
  },
  {
    id: 'change-copy',
    label: 'Change copy',
    prompt:
      'Keep the visual from @image1, but replace the headline, on-image copy, and CTA with new text for my brand. Do not change the photography or layout.',
  },
  {
    id: 'creator-product',
    label: 'Creator & product',
    prompt:
      'Recreate @image1 using the creator from @image2 with the product from @image3. Keep the original ad structure and styling.',
  },
] as const

export function staticAdTemplateRecreatePrompt(): string {
  const index = Math.floor(Math.random() * STATIC_AD_TEMPLATE_RECREATE_IDEAS.length)
  return STATIC_AD_TEMPLATE_RECREATE_IDEAS[index]?.prompt ?? STATIC_AD_RECREATE_PROMPT
}

export function staticAdTemplateToAttachments(template: StaticAdTemplateDto): AttachedMedia[] {
  return [
    {
      id: `${template._id}-reference`,
      url: template.imageUrl,
      name: 'Template reference',
      kind: 'image',
      source: 'library',
      label: 'Template reference',
    },
  ]
}
