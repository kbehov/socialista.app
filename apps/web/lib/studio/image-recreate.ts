import { StudioTemplateKind, type StudioTemplateDto } from '@socialista/types'

export const IMAGE_TEMPLATE_RECREATE_IDEAS = [
  {
    id: 'replace-character',
    label: 'Replace character',
    prompt:
      'Replace the person in @image1 with the creator from @image2. Keep the original pose, crop, lighting, and background.',
  },
  {
    id: 'replace-product',
    label: 'Replace product',
    prompt:
      'Replace the product in @image1 with the product from @image2. Keep the original styling, composition, lighting, and layout.',
  },
  {
    id: 'change-the-text',
    label: 'Change the text',
    prompt:
      'Keep the visual from @image1, but replace the headline, on-image copy, and CTA with new text for my brand. Do not change the photography or layout.',
  },
  {
    id: 'use-my-assets',
    label: 'My creator & product',
    prompt:
      'Recreate @image1 using the creator from @image2 holding the product from @image3. Keep the original composition, lighting, and layout so it still feels like this template.',
  },
] as const

export type ImageTemplateRecreateIdea = (typeof IMAGE_TEMPLATE_RECREATE_IDEAS)[number]

export function randomImageTemplateRecreatePrompt(): string {
  const index = Math.floor(Math.random() * IMAGE_TEMPLATE_RECREATE_IDEAS.length)
  return IMAGE_TEMPLATE_RECREATE_IDEAS[index]?.prompt ?? IMAGE_TEMPLATE_RECREATE_IDEAS[0]!.prompt
}

export function storedImageTemplatePrompt(template: StudioTemplateDto): string | undefined {
  if (template.kind !== StudioTemplateKind.IMAGE) return undefined
  const stored = template.payload?.prompt?.trim()
  return stored || undefined
}

export function templateRecreatePrompt(template: StudioTemplateDto): string {
  return storedImageTemplatePrompt(template) ?? randomImageTemplateRecreatePrompt()
}
