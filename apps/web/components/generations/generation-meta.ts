import type { GenerationKind, GenerationStatus } from '@socialista/types'

export const GENERATION_KIND_LABELS: Record<GenerationKind, string> = {
  image: 'Image',
  'static-ad': 'Static ad',
  video: 'Video',
  slideshow: 'Slideshow',
}

export const GENERATION_STATUS_META: Record<
  GenerationStatus,
  { label: string; className: string; dotClassName: string }
> = {
  running: {
    label: 'Running',
    className: 'text-amber-700 dark:text-amber-400',
    dotClassName: 'bg-amber-500 motion-safe:animate-pulse',
  },
  completed: {
    label: 'Completed',
    className: 'text-emerald-700 dark:text-emerald-400',
    dotClassName: 'bg-emerald-500',
  },
  failed: {
    label: 'Failed',
    className: 'text-destructive',
    dotClassName: 'bg-destructive',
  },
}

export function getGenerationTitle(prompt?: string, kind?: GenerationKind): string {
  const trimmed = prompt?.trim()
  if (trimmed) return trimmed
  if (kind) return GENERATION_KIND_LABELS[kind]
  return 'Generation'
}
