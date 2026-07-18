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
 * Insertable direction snippets aligned with conversion-first static-ad planning.
 * Sublines / badges / icons are opt-in — not required on every creative.
 */
export const STATIC_AD_ANATOMY_SEGMENTS = [
  {
    id: 'hook',
    label: 'Conversion hook',
    snippet:
      'conversion hook: stop the thumb in under a second, make the product obvious, and push tap/shop intent — phone feed tile, not a billboard, ',
    exampleText: 'thumb-stop that also makes the offer obvious on a phone',
    styles: STATIC_AD_SEGMENT_STYLES.hook,
  },
  {
    id: 'scene',
    label: 'Scene',
    snippet:
      'scene: one dominant set piece with Strong integration (wrap / submerge / burst), tight social crop, product fills ~50–60% of frame, shared contact shadows — visual wow that still sells the product, ',
    exampleText: 'tight crop, product fused with the set piece, sells at a glance',
    styles: STATIC_AD_SEGMENT_STYLES.scene,
  },
  {
    id: 'type',
    label: 'Headline & CTA',
    snippet:
      'conversion copy: punchy headline ≤6 words (desire, curiosity, or clear product hook — not vague poetry); add a quieter subline ≤10 words ONLY if it clarifies value; CTA ≤4 words like "Shop now" or "Learn more" when it helps the tap; SCREAM or ELEGANT by niche; phone-legible, ',
    exampleText: 'conversion headline + CTA (subline only if it helps the tap)',
    styles: STATIC_AD_SEGMENT_STYLES.type,
  },
  {
    id: 'features',
    label: 'Badges (optional)',
    snippet:
      'optional UI only if it raises conversion: 1–3 on-pack badges using exact label phrases, icons only if paired with those facts — otherwise no badges and no icons; never invent benefits, stars, or awards, ',
    exampleText: 'badges/icons only when they raise trust — otherwise skip',
    styles: STATIC_AD_SEGMENT_STYLES.features,
  },
  {
    id: 'style',
    label: 'Meta performance',
    snippet:
      'conversion-optimized Meta feed/Stories creative: high contrast at thumbnail size, clear product, one message, DTC performance energy — not billboard art, not badge clutter, not empty poetry',
    exampleText: 'Meta performance creative — clear sell, lean UI',
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
      tip="Aim for conversion: stop the scroll, clarify the product, invite the tap. Sublines, badges, and icons are optional — add only when they help. Leave empty to auto-invent from the product photo."
      triggerLabel="How to direct the creative"
    />
  )
}
