'use client'

import { PromptAnatomy, type PromptAnatomySegment } from '@/components/studio/images/prompt-anatomy'
import { useSlideshowStudio } from '@/components/studio/slideshows/slideshow-studio-provider'

const SLIDESHOW_SEGMENT_STYLES = {
  hook: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle:
      'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
  format: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle:
      'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
  audience: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle:
      'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
  voice: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle:
      'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
  cta: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle:
      'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
} as const

export const SLIDESHOW_PROMPT_ANATOMY_SEGMENTS = [
  {
    id: 'hook',
    label: 'Hook',
    snippet: 'I used this serum for 30 days and nobody talks about what happened, ',
    exampleText: 'I used this serum for 30 days',
    styles: SLIDESHOW_SEGMENT_STYLES.hook,
  },
  {
    id: 'format',
    label: 'Format',
    snippet: 'a 7-slide story with a turning point in the middle, ',
    exampleText: 'a 7-slide story',
    styles: SLIDESHOW_SEGMENT_STYLES.format,
  },
  {
    id: 'audience',
    label: 'Audience',
    snippet: 'for women 22–32 who already try too many products, ',
    exampleText: 'for women 22–32',
    styles: SLIDESHOW_SEGMENT_STYLES.audience,
  },
  {
    id: 'voice',
    label: 'Voice',
    snippet: 'first person until the lesson, then switch to you, ',
    exampleText: 'first person, then you',
    styles: SLIDESHOW_SEGMENT_STYLES.voice,
  },
  {
    id: 'cta',
    label: 'CTA',
    snippet: 'only if it fits, end on save this so they can come back to it',
    exampleText: 'save this for later',
    styles: SLIDESHOW_SEGMENT_STYLES.cta,
  },
] as const satisfies readonly PromptAnatomySegment[]

export function SlideshowPromptAnatomy() {
  const { insertSnippet } = useSlideshowStudio()

  return (
    <PromptAnatomy
      segments={SLIDESHOW_PROMPT_ANATOMY_SEGMENTS}
      onInsertSnippet={insertSnippet}
      collapsible
      defaultOpen={false}
      triggerLabel="Prompt structure"
      tip="Hook, format, audience, voice — add a CTA only if you want one."
    />
  )
}
