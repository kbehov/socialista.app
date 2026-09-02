'use client'

import { PromptAnatomy, type PromptAnatomySegment } from '@/components/studio/images/prompt-anatomy'
import { useVideoStudio } from '@/components/studio/videos/video-studio-provider'

const VIDEO_SEGMENT_STYLES = {
  subject: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle:
      'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
  motion: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle:
      'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
  camera: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle:
      'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
  lighting: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle:
      'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
  sound: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle:
      'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
} as const

export const VIDEO_PROMPT_ANATOMY_SEGMENTS = [
  {
    id: 'subject',
    label: 'Subject',
    snippet: 'A young woman in a linen shirt, relaxed natural expression, ',
    exampleText: 'A young woman in a linen shirt',
    styles: VIDEO_SEGMENT_STYLES.subject,
  },
  {
    id: 'motion',
    label: 'Motion',
    snippet: 'she turns toward camera and smiles, steam drifting from a mug, ',
    exampleText: 'turns toward camera and smiles',
    styles: VIDEO_SEGMENT_STYLES.motion,
  },
  {
    id: 'camera',
    label: 'Camera',
    snippet: 'slow push-in, handheld micro-sway, eye-level medium shot, ',
    exampleText: 'slow push-in, handheld',
    styles: VIDEO_SEGMENT_STYLES.camera,
  },
  {
    id: 'lighting',
    label: 'Light',
    snippet: 'soft morning window light from the left, gentle falloff, ',
    exampleText: 'soft morning window light',
    styles: VIDEO_SEGMENT_STYLES.lighting,
  },
  {
    id: 'sound',
    label: 'Sound',
    snippet: 'quiet room tone, fabric rustle, she says "this changed everything"',
    exampleText: 'quiet room tone, a short line',
    styles: VIDEO_SEGMENT_STYLES.sound,
  },
] as const satisfies readonly PromptAnatomySegment[]

export function VideoPromptAnatomy() {
  const { insertSnippet } = useVideoStudio()

  return (
    <PromptAnatomy
      segments={VIDEO_PROMPT_ANATOMY_SEGMENTS}
      onInsertSnippet={insertSnippet}
      collapsible
      defaultOpen={false}
      triggerLabel="Prompt structure"
      tip="Subject, motion, camera, light, then sound — tap a phrase to add it."
    />
  )
}
