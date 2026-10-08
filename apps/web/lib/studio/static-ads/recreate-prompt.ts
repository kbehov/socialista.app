import type { StudioTemplateRecreateIdea } from '@/lib/studio/template-recreate'
import type { StaticAdTemplateBlueprint, StaticAdTemplateFormat } from '@socialista/types'

export const STATIC_AD_RECREATE_PROMPT =
  'Edit the attached template in place. Keep the concept, person, colors, layout, and type placement. Change only the product, and translate the existing headline into my selected language.'

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
      'Change only the product to the one from @image1. Keep the same concept, person, pose, colors, layout, and type placement. Translate the existing headline into my selected language.',
  },
  {
    id: 'change-copy',
    label: 'Change copy',
    prompt:
      'Keep the attached template layout and photography structure, but replace the headline and CTA with a new scroll-stopping hook for my product.',
  },
  {
    id: 'creator-product',
    label: 'Creator & product',
    prompt:
      'Recreate the attached template using the creator from @image1 and the product from @image2. Keep the original ad structure and type placement.',
  },
] as const

function hookStyleClause(hookStyle: string): string {
  const style = hookStyle.replace(/\s+/g, ' ').trim().slice(0, 80)
  if (!style) return ''
  return ` Follow this hook style: ${style}. Write new words for my product.`
}

function ideasForFormat(
  format: StaticAdTemplateFormat,
  hookStyle: string,
): readonly StudioTemplateRecreateIdea[] {
  const hook = hookStyleClause(hookStyle)
  const match = STATIC_AD_TEMPLATE_RECREATE_IDEAS[0]!
  const swapProduct: StudioTemplateRecreateIdea = {
    id: 'replace-product',
    label: 'Swap product only',
    prompt:
      'Change only the product to the one from @image1. Keep the same concept, person, pose, colors, layout, and type placement. Translate the existing headline into my selected language.',
  }
  const creator: StudioTemplateRecreateIdea = {
    id: 'creator-product',
    label: 'Same layout, my creator',
    prompt:
      'Recreate the attached template with the creator from @image1 and the product from @image2. Keep the layout, type placement, and scene job.',
  }

  switch (format) {
    case 'ugc':
    case 'apparel-ugc':
      return [
        match,
        creator,
        {
          id: 'new-hook',
          label: 'New headline',
          prompt: `Keep the phone-native framing and type placement. Write a new scroll-stopping headline.${hook}`,
        },
        swapProduct,
      ]
    case 'screenshot':
      return [
        match,
        {
          id: 'rewrite-ui',
          label: 'Rewrite the UI copy',
          prompt:
            'Keep the screenshot chrome and layout. Rewrite the on-screen message for my product. Do not change the interface structure.',
        },
        swapProduct,
        creator,
      ]
    case 'meme':
      return [
        match,
        {
          id: 'new-punchline',
          label: 'New punchline',
          prompt: `Keep the meme framing and type placement. Write a new punchline for my product.${hook}`,
        },
        swapProduct,
        creator,
      ]
    case 'cinematic':
      return [
        match,
        {
          id: 'new-hook',
          label: 'New hook, same shot',
          prompt: `Keep the shot, lighting, and type placement. Write a new scroll-stopping hook.${hook}`,
        },
        swapProduct,
        creator,
      ]
    case 'demo':
      return [
        match,
        swapProduct,
        {
          id: 'same-moment',
          label: 'Same moment, my product',
          prompt:
            'Recreate the same in-use moment from the attached template with the product from @image1. Keep the crop, lighting, and type placement.',
        },
        creator,
      ]
    case 'graphic':
      return [
        match,
        {
          id: 'new-headline',
          label: 'New headline, same layout',
          prompt: `Keep the graphic layout and type hierarchy. Write a new headline and CTA for my product.${hook}`,
        },
        swapProduct,
        creator,
      ]
    case 'lifestyle':
      return [
        match,
        {
          id: 'my-product',
          label: 'My product, same scene',
          prompt:
            'Recreate the attached template scene with the product from @image1. Keep the setting, crop, and type placement.',
        },
        {
          id: 'new-hook',
          label: 'New headline',
          prompt: `Keep the scene and type placement. Write a new scroll-stopping headline.${hook}`,
        },
        creator,
      ]
  }
}

export function staticAdTemplateRecreateIdeas(template?: {
  blueprint?: StaticAdTemplateBlueprint | null
} | null): readonly StudioTemplateRecreateIdea[] {
  const blueprint = template?.blueprint
  if (!blueprint) return STATIC_AD_TEMPLATE_RECREATE_IDEAS
  return ideasForFormat(blueprint.format, blueprint.hookStyle)
}

export function staticAdTemplateRecreateIdeaIndex(templateId: string, count: number): number {
  if (count <= 1) return 0
  let hash = 0
  for (const char of templateId) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return hash % count
}
