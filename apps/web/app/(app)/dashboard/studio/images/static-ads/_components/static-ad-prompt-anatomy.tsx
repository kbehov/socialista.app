'use client'

import {
  PromptAnatomy,
  type PromptAnatomySegment,
  type PromptAnatomySegmentStyles,
} from '../../_components/studio/prompt-anatomy'
import { useStaticAdStudio } from './static-ad-studio-provider'

const STATIC_AD_SEGMENT_STYLES = {
  hook: {
    text: 'text-rose-700 dark:text-rose-300',
    surface: 'bg-rose-500/10',
    chip: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    chipIdle: 'hover:border-rose-500/20 hover:bg-rose-500/8 hover:text-rose-700 dark:hover:text-rose-300',
    decoration: 'decoration-rose-500/55',
  },
  scene: {
    text: 'text-violet-700 dark:text-violet-300',
    surface: 'bg-violet-500/10',
    chip: 'border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    chipIdle:
      'hover:border-violet-500/20 hover:bg-violet-500/8 hover:text-violet-700 dark:hover:text-violet-300',
    decoration: 'decoration-violet-500/55',
  },
  type: {
    text: 'text-amber-800 dark:text-amber-300',
    surface: 'bg-amber-500/10',
    chip: 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300',
    chipIdle:
      'hover:border-amber-500/20 hover:bg-amber-500/8 hover:text-amber-800 dark:hover:text-amber-300',
    decoration: 'decoration-amber-500/55',
  },
  features: {
    text: 'text-emerald-700 dark:text-emerald-300',
    surface: 'bg-emerald-500/10',
    chip: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    chipIdle:
      'hover:border-emerald-500/20 hover:bg-emerald-500/8 hover:text-emerald-700 dark:hover:text-emerald-300',
    decoration: 'decoration-emerald-500/55',
  },
  style: {
    text: 'text-blue-700 dark:text-blue-300',
    surface: 'bg-blue-500/10',
    chip: 'border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300',
    chipIdle: 'hover:border-blue-500/20 hover:bg-blue-500/8 hover:text-blue-700 dark:hover:text-blue-300',
    decoration: 'decoration-blue-500/55',
  },
} as const satisfies Record<string, PromptAnatomySegmentStyles>

/**
 * Insertable brief snippets — freeform notes can mix direction, context, and copy.
 */
export const STATIC_AD_ANATOMY_SEGMENTS = [
  {
    id: 'hook',
    label: 'Thumb-stop',
    snippet:
      'thumb-stop: one instantly legible visual idea before text is read, product obvious at phone size, push tap intent — feed tile not billboard, ',
    exampleText: 'interrupt the scroll, then make the offer obvious',
    styles: STATIC_AD_SEGMENT_STYLES.hook,
  },
  {
    id: 'scene',
    label: 'Scene',
    snippet:
      'scene: one dominant set piece or material metaphor fused with the product, cinematic light, tight social crop, shared contact shadows — campaign wow that still sells, ',
    exampleText: 'product fused with one strong set piece / sensory world',
    styles: STATIC_AD_SEGMENT_STYLES.scene,
  },
  {
    id: 'type',
    label: 'Copy',
    snippet:
      'copy: headline "…" (≤6 words); optional CTA "Shop now"; designed into the frame (not drop-shadow slap-on); invent claim-safe desire only — or leave blank to auto-write, ',
    exampleText: 'exact headline/CTA phrases, or let the model invent',
    styles: STATIC_AD_SEGMENT_STYLES.type,
  },
  {
    id: 'features',
    label: 'Context',
    snippet:
      'context: audience / use occasion / tone (e.g. busy professionals, morning ritual, clinical-premium) — no invented ingredients, results, or awards, ',
    exampleText: 'who it is for and the vibe — optional',
    styles: STATIC_AD_SEGMENT_STYLES.features,
  },
  {
    id: 'style',
    label: 'Craft bar',
    snippet:
      'craft: Meta performance creative with editorial lighting and grade, high thumbnail contrast, lean hierarchy — reject average UGC clutter, stock shock faces, and pedestal luxury clichés',
    exampleText: 'campaign craft, not stock Meta template',
    styles: STATIC_AD_SEGMENT_STYLES.style,
  },
] as const satisfies readonly PromptAnatomySegment[]

export function StaticAdPromptAnatomy() {
  const { insertSnippet } = useStaticAdStudio()

  return (
    <PromptAnatomy
      collapsible
      defaultOpen={false}
      segments={STATIC_AD_ANATOMY_SEGMENTS}
      onInsertSnippet={insertSnippet}
      tip="Freeform notes: direction, context, and/or exact copy. Empty = invent from the product photo."
      triggerLabel="Tips for brief notes"
    />
  )
}
