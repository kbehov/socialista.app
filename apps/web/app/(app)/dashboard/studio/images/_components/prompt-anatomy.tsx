'use client'

import { useImageStudio } from '@/context/image-studio-provider'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const ANATOMY_SEGMENTS = [
  {
    id: 'subject',
    label: 'Subject',
    snippet: 'A young Gen-Z creator ',
    exampleText: 'A young Gen-Z girl',
  },
  {
    id: 'framing',
    label: 'Framing',
    snippet: 'first-person POV, front-facing iPhone camera selfie, ',
    exampleText: 'taking a casual iPhone selfie in her bedroom, first-person POV, front-facing iPhone camera selfie',
  },
  {
    id: 'lighting',
    label: 'Lighting',
    snippet: 'soft window light, ',
    exampleText: 'soft window light',
  },
  {
    id: 'style',
    label: 'Style',
    snippet: 'UGC creator aesthetic, scroll-stopping, not staged',
    exampleText: 'natural relaxed expression, slightly messy authentic background, UGC creator aesthetic, not staged',
  },
] as const

type SegmentId = (typeof ANATOMY_SEGMENTS)[number]['id']

const SEGMENT_STYLES: Record<
  SegmentId,
  { text: string; surface: string; chip: string; decoration: string; chipIdle: string }
> = {
  subject: {
    text: 'text-sky-700 dark:text-sky-300',
    surface: 'bg-sky-500/10',
    chip: 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    chipIdle: 'hover:border-sky-500/20 hover:bg-sky-500/8 hover:text-sky-700 dark:hover:text-sky-300',
    decoration: 'decoration-sky-500/55',
  },
  framing: {
    text: 'text-violet-700 dark:text-violet-300',
    surface: 'bg-violet-500/10',
    chip: 'border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    chipIdle: 'hover:border-violet-500/20 hover:bg-violet-500/8 hover:text-violet-700 dark:hover:text-violet-300',
    decoration: 'decoration-violet-500/55',
  },
  lighting: {
    text: 'text-amber-800 dark:text-amber-300',
    surface: 'bg-amber-500/10',
    chip: 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300',
    chipIdle: 'hover:border-amber-500/20 hover:bg-amber-500/8 hover:text-amber-800 dark:hover:text-amber-300',
    decoration: 'decoration-amber-500/55',
  },
  style: {
    text: 'text-emerald-700 dark:text-emerald-300',
    surface: 'bg-emerald-500/10',
    chip: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    chipIdle: 'hover:border-emerald-500/20 hover:bg-emerald-500/8 hover:text-emerald-700 dark:hover:text-emerald-300',
    decoration: 'decoration-emerald-500/55',
  },
}

export function PromptAnatomy() {
  const { insertSnippet } = useImageStudio()
  const [activeSegment, setActiveSegment] = useState<SegmentId | null>(null)

  return (
    <div className="space-y-2" onMouseLeave={() => setActiveSegment(null)}>
      <p className="text-xs leading-snug text-muted-foreground/75">
        <span className="mr-1.5 font-medium text-foreground">Tip:</span>
        Tap a segment or button below to insert it into your prompt.
      </p>

      <div className="text-xs font-normal leading-relaxed">
        {ANATOMY_SEGMENTS.map((segment, index) => {
          const isActive = activeSegment === segment.id
          const styles = SEGMENT_STYLES[segment.id]

          return (
            <span key={segment.id}>
              <button
                type="button"
                onMouseEnter={() => setActiveSegment(segment.id)}
                onFocus={() => setActiveSegment(segment.id)}
                onBlur={() => setActiveSegment(null)}
                onClick={() => insertSnippet(segment.snippet)}
                className={cn(
                  'rounded px-0.5 py-px font-medium underline-offset-[3px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50',
                  isActive
                    ? cn(styles.text, styles.surface, 'underline', styles.decoration)
                    : 'text-foreground/75 hover:bg-muted/40 hover:text-foreground hover:underline hover:decoration-foreground/25',
                )}
              >
                {segment.exampleText}
              </button>
              {index < ANATOMY_SEGMENTS.length - 1 ? <span className="text-muted-foreground/40">, </span> : null}
            </span>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-1">
        {ANATOMY_SEGMENTS.map(segment => {
          const isActive = activeSegment === segment.id
          const styles = SEGMENT_STYLES[segment.id]

          return (
            <button
              key={segment.id}
              type="button"
              onMouseEnter={() => setActiveSegment(segment.id)}
              onFocus={() => setActiveSegment(segment.id)}
              onBlur={() => setActiveSegment(null)}
              onClick={() => insertSnippet(segment.snippet)}
              className={cn(
                'rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50',
                isActive
                  ? styles.chip
                  : cn(
                      'border-border/50 bg-background text-muted-foreground',
                      styles.chipIdle,
                    ),
              )}
            >
              + {segment.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
