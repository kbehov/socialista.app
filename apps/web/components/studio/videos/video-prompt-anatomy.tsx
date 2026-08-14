'use client'

import { PromptAnatomy, type PromptAnatomySegment } from '@/components/studio/images/prompt-anatomy'
import { useVideoStudio } from '@/components/studio/videos/video-studio-provider'

const VIDEO_SEGMENT_STYLES = {
  subject: {
    text: 'text-sky-800 dark:text-sky-300',
    surface: 'bg-sky-500/10',
    chip: 'border-sky-500/25 bg-sky-500/10 text-sky-800 dark:text-sky-300',
    chipIdle: 'hover:border-sky-500/20 hover:bg-sky-500/8 hover:text-sky-700 dark:hover:text-sky-300',
    decoration: 'decoration-sky-500/55',
  },
  motion: {
    text: 'text-violet-700 dark:text-violet-300',
    surface: 'bg-violet-500/10',
    chip: 'border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    chipIdle:
      'hover:border-violet-500/20 hover:bg-violet-500/8 hover:text-violet-700 dark:hover:text-violet-300',
    decoration: 'decoration-violet-500/55',
  },
  camera: {
    text: 'text-rose-700 dark:text-rose-300',
    surface: 'bg-rose-500/10',
    chip: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300',
    chipIdle: 'hover:border-rose-500/20 hover:bg-rose-500/8 hover:text-rose-700 dark:hover:text-rose-300',
    decoration: 'decoration-rose-500/55',
  },
  lighting: {
    text: 'text-amber-800 dark:text-amber-300',
    surface: 'bg-amber-500/10',
    chip: 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300',
    chipIdle:
      'hover:border-amber-500/20 hover:bg-amber-500/8 hover:text-amber-800 dark:hover:text-amber-300',
    decoration: 'decoration-amber-500/55',
  },
  sound: {
    text: 'text-emerald-700 dark:text-emerald-300',
    surface: 'bg-emerald-500/10',
    chip: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    chipIdle:
      'hover:border-emerald-500/20 hover:bg-emerald-500/8 hover:text-emerald-700 dark:hover:text-emerald-300',
    decoration: 'decoration-emerald-500/55',
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
