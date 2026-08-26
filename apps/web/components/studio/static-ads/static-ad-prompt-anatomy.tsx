'use client'

import {
  PromptAnatomy,
  type PromptAnatomySegment,
  type PromptAnatomySegmentStyles,
} from '@/components/studio/images/prompt-anatomy'
import { useStaticAdStudio } from './static-ad-studio-provider'

const STATIC_AD_SEGMENT_STYLES = {
  format: {
    text: 'text-sky-700 dark:text-sky-300',
    surface: 'bg-sky-500/10',
    chip: 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    chipIdle: 'hover:border-sky-500/20 hover:bg-sky-500/8 hover:text-sky-700 dark:hover:text-sky-300',
    decoration: 'decoration-sky-500/55',
  },
  scene: {
    text: 'text-violet-700 dark:text-violet-300',
    surface: 'bg-violet-500/10',
    chip: 'border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    chipIdle:
      'hover:border-violet-500/20 hover:bg-violet-500/8 hover:text-violet-700 dark:hover:text-violet-300',
    decoration: 'decoration-violet-500/55',
  },
  product: {
    text: 'text-rose-700 dark:text-rose-300',
    surface: 'bg-rose-500/10',
    chip: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    chipIdle: 'hover:border-rose-500/20 hover:bg-rose-500/8 hover:text-rose-700 dark:hover:text-rose-300',
    decoration: 'decoration-rose-500/55',
  },
  copy: {
    text: 'text-amber-800 dark:text-amber-300',
    surface: 'bg-amber-500/10',
    chip: 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300',
    chipIdle:
      'hover:border-amber-500/20 hover:bg-amber-500/8 hover:text-amber-800 dark:hover:text-amber-300',
    decoration: 'decoration-amber-500/55',
  },
  style: {
    text: 'text-emerald-700 dark:text-emerald-300',
    surface: 'bg-emerald-500/10',
    chip: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    chipIdle:
      'hover:border-emerald-500/20 hover:bg-emerald-500/8 hover:text-emerald-700 dark:hover:text-emerald-300',
    decoration: 'decoration-emerald-500/55',
  },
} as const satisfies Record<string, PromptAnatomySegmentStyles>

export const STATIC_AD_ANATOMY_SEGMENTS = [
  {
    id: 'format',
    label: 'Format',
    snippet:
      "UGC: real creator holding the product toward an iPhone at arm's length, ",
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
    snippet:
      'product large in the foreground, exact packaging from the reference, label readable, ',
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
