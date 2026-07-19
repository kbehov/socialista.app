import type { GenerationKind, GenerationStatus } from '@socialista/types'

export const GENERATION_KIND_LABELS: Record<GenerationKind, string> = {
  image: 'Image',
  'static-ad': 'Static ad',
  video: 'Video',
}

export const GENERATION_STATUS_META: Record<
  GenerationStatus,
  { label: string; className: string; dotClassName: string }
> = {
  running: {
    label: 'Running',
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    dotClassName: 'bg-amber-500',
  },
  completed: {
    label: 'Completed',
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    dotClassName: 'bg-emerald-500',
  },
  failed: {
    label: 'Failed',
    className: 'border-destructive/20 bg-destructive/10 text-destructive',
    dotClassName: 'bg-destructive',
  },
}

export function formatAbsoluteDate(value: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function getGenerationTitle(prompt?: string, kind?: GenerationKind): string {
  const trimmed = prompt?.trim()
  if (trimmed) return trimmed
  if (kind) return GENERATION_KIND_LABELS[kind]
  return 'Generation'
}
