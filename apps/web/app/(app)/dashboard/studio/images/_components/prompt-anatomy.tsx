'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useImageStudio } from '../_lib/studio-context'

const ANATOMY_SEGMENTS = [
  {
    id: 'subject',
    label: 'Subject',
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-500/10 hover:bg-sky-500/15',
    snippet: 'A young Gen-Z creator ',
    exampleText: 'A young Gen-Z girl',
  },
  {
    id: 'framing',
    label: 'Framing',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10 hover:bg-violet-500/15',
    snippet: 'first-person POV, front-facing iPhone camera selfie, ',
    exampleText:
      'taking a casual iPhone selfie in her bedroom, first-person POV, front-facing iPhone camera selfie',
  },
  {
    id: 'lighting',
    label: 'Lighting',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-500/10 hover:bg-amber-500/15',
    snippet: 'soft window light, ',
    exampleText: 'soft window light',
  },
  {
    id: 'style',
    label: 'Style',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
    snippet: 'UGC creator aesthetic, scroll-stopping, not staged',
    exampleText:
      'natural relaxed expression, slightly messy authentic background, UGC creator aesthetic, not staged',
  },
] as const

type SegmentId = (typeof ANATOMY_SEGMENTS)[number]['id']

export function PromptAnatomy() {
  const { insertSnippet } = useImageStudio()
  const [activeSegment, setActiveSegment] = useState<SegmentId | null>(null)

  return (
    <div className="space-y-2">
      <p className="text-[11px] leading-snug text-muted-foreground/75">
        <span className="mr-1.5 inline-flex rounded bg-muted/60 px-1.5 py-px font-medium text-muted-foreground">
          Tip
        </span>
        Tap a colored segment or button below to insert it into your prompt.
      </p>

      <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 text-[13px] leading-relaxed text-foreground">
        {ANATOMY_SEGMENTS.map((segment, index) => {
          const isActive = activeSegment === segment.id
          return (
            <span key={segment.id}>
              <button
                type="button"
                onMouseEnter={() => setActiveSegment(segment.id)}
                onMouseLeave={() => setActiveSegment(null)}
                onFocus={() => setActiveSegment(segment.id)}
                onBlur={() => setActiveSegment(null)}
                onClick={() => insertSnippet(segment.snippet)}
                className={cn(
                  'rounded px-0.5 py-px font-medium underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50',
                  segment.color,
                  segment.bg,
                  isActive && 'underline',
                )}
              >
                {segment.exampleText}
              </button>
              {index < ANATOMY_SEGMENTS.length - 1 ? (
                <span className="text-muted-foreground/50">, </span>
              ) : null}
            </span>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-1">
        {ANATOMY_SEGMENTS.map(segment => (
          <button
            key={segment.id}
            type="button"
            onClick={() => insertSnippet(segment.snippet)}
            className="rounded-md border border-border/50 bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50"
          >
            + {segment.label}
          </button>
        ))}
      </div>
    </div>
  )
}
