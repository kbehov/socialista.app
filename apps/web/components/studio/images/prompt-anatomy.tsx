'use client'

import { useImageStudio } from '@/components/studio/images/image-studio-provider'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { ChevronDownIcon, LightbulbIcon } from 'lucide-react'
import { useState } from 'react'

export type PromptAnatomySegmentStyles = {
  text: string
  surface: string
  chip: string
  chipIdle: string
  decoration: string
}

export type PromptAnatomySegment = {
  id: string
  label: string
  snippet: string
  exampleText: string
  styles: PromptAnatomySegmentStyles
}

type PromptAnatomyProps = {
  segments: readonly PromptAnatomySegment[]
  onInsertSnippet: (snippet: string) => void
  tip?: string
  collapsible?: boolean
  defaultOpen?: boolean
  triggerLabel?: string
}

export function PromptAnatomy({
  segments,
  onInsertSnippet,
  tip = 'Tap a segment or button below to insert it into your prompt.',
  collapsible = false,
  defaultOpen = false,
  triggerLabel = 'Prompt helper',
}: PromptAnatomyProps) {
  const [activeSegment, setActiveSegment] = useState<string | null>(null)
  const [open, setOpen] = useState(defaultOpen)

  const content = (
    <div className="space-y-3" onMouseLeave={() => setActiveSegment(null)}>
      <p className="flex items-start gap-2 text-[12px] leading-[1.55] tracking-[-0.01em] text-muted-foreground/85">
        <LightbulbIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/50" aria-hidden />
        <span>{tip}</span>
      </p>

      <div className="rounded-xl bg-muted/12 px-3.5 py-3 text-[12px] font-normal leading-[1.65] tracking-[-0.01em] ring-1 ring-border/30">
        {segments.map((segment, index) => {
          const isActive = activeSegment === segment.id
          const styles = segment.styles

          return (
            <span key={segment.id}>
              <button
                type="button"
                onMouseEnter={() => setActiveSegment(segment.id)}
                onFocus={() => setActiveSegment(segment.id)}
                onBlur={() => setActiveSegment(null)}
                onClick={() => onInsertSnippet(segment.snippet)}
                className={cn(
                  'rounded-md px-1 py-px font-medium underline-offset-[3px] transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/45',
                  isActive
                    ? cn(styles.text, styles.surface, 'underline', styles.decoration)
                    : 'text-foreground/65 hover:bg-muted/45 hover:text-foreground hover:underline hover:decoration-foreground/20',
                )}
              >
                {segment.exampleText}
              </button>
              {index < segments.length - 1 ? <span className="text-muted-foreground/30">, </span> : null}
            </span>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {segments.map(segment => {
          const isActive = activeSegment === segment.id
          const styles = segment.styles

          return (
            <button
              key={segment.id}
              type="button"
              onMouseEnter={() => setActiveSegment(segment.id)}
              onFocus={() => setActiveSegment(segment.id)}
              onBlur={() => setActiveSegment(null)}
              onClick={() => onInsertSnippet(segment.snippet)}
              className={cn(
                'rounded-lg border px-2.5 py-1 text-[11px] font-medium tracking-[-0.015em] transition-[background-color,border-color,color,transform,box-shadow] duration-150',
                'active:scale-[0.97] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/45',
                isActive
                  ? cn(styles.chip, 'shadow-sm')
                  : cn('border-border/40 bg-background/70 text-muted-foreground', styles.chipIdle),
              )}
            >
              + {segment.label}
            </button>
          )
        })}
      </div>
    </div>
  )

  if (!collapsible) {
    return content
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className={cn(
          'group flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left',
          'bg-muted/15 ring-1 ring-border/35 transition-[background-color,box-shadow,ring-color] duration-150',
          'hover:bg-muted/22 hover:ring-border/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
          open && 'bg-muted/20 ring-border/45 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]',
        )}
      >
        <span className="text-[13px] font-medium tracking-[-0.015em] text-foreground">
          {triggerLabel}
        </span>
        <ChevronDownIcon
          className={cn(
            'size-3.5 shrink-0 text-muted-foreground/70 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3.5 data-[state=closed]:animate-none">{content}</CollapsibleContent>
    </Collapsible>
  )
}

const IMAGE_SEGMENT_STYLES = {
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
    chipIdle:
      'hover:border-violet-500/20 hover:bg-violet-500/8 hover:text-violet-700 dark:hover:text-violet-300',
    decoration: 'decoration-violet-500/55',
  },
  lighting: {
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

export const IMAGE_PROMPT_ANATOMY_SEGMENTS = [
  {
    id: 'subject',
    label: 'Subject',
    snippet: 'A young Gen-Z creator ',
    exampleText: 'A young Gen-Z girl',
    styles: IMAGE_SEGMENT_STYLES.subject,
  },
  {
    id: 'framing',
    label: 'Framing',
    snippet: 'first-person POV, front-facing iPhone camera selfie, ',
    exampleText:
      'taking a casual iPhone selfie in her bedroom, first-person POV, front-facing iPhone camera selfie',
    styles: IMAGE_SEGMENT_STYLES.framing,
  },
  {
    id: 'lighting',
    label: 'Lighting',
    snippet: 'soft window light, ',
    exampleText: 'soft window light',
    styles: IMAGE_SEGMENT_STYLES.lighting,
  },
  {
    id: 'style',
    label: 'Style',
    snippet: 'UGC creator aesthetic, scroll-stopping, not staged',
    exampleText:
      'natural relaxed expression, slightly messy authentic background, UGC creator aesthetic, not staged',
    styles: IMAGE_SEGMENT_STYLES.style,
  },
] as const satisfies readonly PromptAnatomySegment[]

export function ImagePromptAnatomy() {
  const { insertSnippet } = useImageStudio()

  return (
    <PromptAnatomy
      segments={IMAGE_PROMPT_ANATOMY_SEGMENTS}
      onInsertSnippet={insertSnippet}
      collapsible
      triggerLabel="Build a stronger prompt"
      tip="Tap a colored phrase or chip to insert it into your prompt."
    />
  )
}
