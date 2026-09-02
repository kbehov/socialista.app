'use client'

import {
  PromptAnatomy,
  type PromptAnatomySegment,
  type PromptAnatomySegmentStyles,
} from '@/components/studio/images/prompt-anatomy'
import { useStaticAdStudio } from './static-ad-studio-provider'

const STATIC_AD_SEGMENT_STYLES = {
  format: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle:
      'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
  scene: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle:
      'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
  product: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle:
      'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
  copy: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle:
      'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
  style: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle:
      'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
} as const satisfies Record<string, PromptAnatomySegmentStyles>

export const STATIC_AD_ANATOMY_SEGMENTS = [
  {
    id: 'format',
    label: 'Format',
    snippet: "UGC: real creator holding the product toward an iPhone at arm's length, ",
    exampleText: 'UGC iPhone hold',
    styles: STATIC_AD_SEGMENT_STYLES.format,
  },
  {
    id: 'scene',
    label: 'Scene',
    snippet:
      'tight Stories crop, real room slightly soft behind the product, available indoor or window light only, mild phone grain, natural skin, ',
    exampleText: 'tight Stories crop, real room behind',
    styles: STATIC_AD_SEGMENT_STYLES.scene,
  },
  {
    id: 'product',
    label: 'Product',
    snippet: 'product large in the foreground, exact packaging from the reference, label readable, ',
    exampleText: 'product large, label readable',
    styles: STATIC_AD_SEGMENT_STYLES.product,
  },
  {
    id: 'copy',
    label: 'Copy',
    snippet:
      'headline "I stopped buying the expensive one" with "Shop now" CTA, simple bold social type designed into the frame, ',
    exampleText: 'headline "I stopped buying the expensive one" + Shop now',
    styles: STATIC_AD_SEGMENT_STYLES.copy,
  },
  {
    id: 'style',
    label: 'Style',
    snippet:
      'native Meta Stories still — not cinematic, not studio, not velvet/gold luxury AI, not a stock shock face',
    exampleText: 'native Meta still, not studio AI',
    styles: STATIC_AD_SEGMENT_STYLES.style,
  },
] as const satisfies readonly PromptAnatomySegment[]

export function StaticAdPromptAnatomy() {
  const { insertSnippet } = useStaticAdStudio()

  return (
    <PromptAnatomy
      segments={STATIC_AD_ANATOMY_SEGMENTS}
      onInsertSnippet={insertSnippet}
      collapsible
      defaultOpen={false}
      triggerLabel="Prompt structure"
      tip="Format, scene, product, copy, then style — tap a phrase to add it."
    />
  )
}
