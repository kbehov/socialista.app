'use client'

import { useImageStudio } from '@/components/studio/images/image-studio-provider'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from 'lucide-react'
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
  heading?: string
  tip?: string
  collapsible?: boolean
  defaultOpen?: boolean
  triggerLabel?: string
}

export function PromptAnatomy({
  segments,
  onInsertSnippet,
  heading,
  tip = 'Tap a phrase to add it to your prompt.',
  collapsible = false,
  defaultOpen = false,
  triggerLabel = 'Prompt helper',
}: PromptAnatomyProps) {
  const [activeSegment, setActiveSegment] = useState<string | null>(null)
  const [open, setOpen] = useState(defaultOpen)

  const content = (
    <div className="space-y-3" onMouseLeave={() => setActiveSegment(null)}>
      {!collapsible && (heading || tip) ? (
        <div className="space-y-1 px-0.5">
          {heading ? (
            <p className="text-[12px] font-medium tracking-[-0.015em] text-foreground/80">
              {heading}
            </p>
          ) : null}
          {tip ? (
            <p className="text-[12px] leading-[1.5] tracking-[-0.01em] text-muted-foreground/70">
              {tip}
            </p>
          ) : null}
        </div>
      ) : null}

      {collapsible ? (
        <p className="text-[12px] leading-[1.55] tracking-[-0.01em] text-muted-foreground/85">
          {tip}
        </p>
      ) : null}

      <div className="rounded-2xl bg-muted/12 px-3.5 py-3 text-[13px] font-normal leading-[1.7] tracking-[-0.015em] ring-1 ring-border/30">
        {segments.map((segment, index) => {
          const isActive = activeSegment === segment.id
          const styles = segment.styles

          return (
            <span key={segment.id}>
              <button
                type="button"
                aria-label={`Add ${segment.label}`}
                onPointerDown={() => setActiveSegment(segment.id)}
                onMouseEnter={() => setActiveSegment(segment.id)}
                onFocus={() => setActiveSegment(segment.id)}
                onBlur={() => setActiveSegment(null)}
                onClick={() => onInsertSnippet(segment.snippet)}
                className={cn(
                  'rounded-md px-1 py-px font-medium underline-offset-[3px]',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/45',
                  isActive
                    ? cn(styles.text, styles.surface, 'underline', styles.decoration)
                    : 'text-foreground/70 hover:bg-muted/45 hover:text-foreground hover:underline hover:decoration-foreground/20',
                )}
              >
                {segment.exampleText}
              </button>
              {index < segments.length - 1 ? (
                <span className="text-muted-foreground/30">, </span>
              ) : (
                <span className="text-muted-foreground/30">.</span>
              )}
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
              aria-label={`Add ${segment.label}`}
              onPointerDown={() => setActiveSegment(segment.id)}
              onMouseEnter={() => setActiveSegment(segment.id)}
              onFocus={() => setActiveSegment(segment.id)}
              onBlur={() => setActiveSegment(null)}
              onClick={() => onInsertSnippet(segment.snippet)}
              className={cn(
                'rounded-lg border px-2.5 py-1 text-[11px] font-medium tracking-[-0.015em]',
                'transition-[background-color,border-color,color,transform,box-shadow] duration-150',
                'active:scale-[0.97] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/45',
                isActive
                  ? cn(styles.chip, 'shadow-sm')
                  : cn('border-border/40 bg-background/70 text-muted-foreground', styles.chipIdle),
              )}
            >
              {segment.label}
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
          'group flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-left',
          'bg-muted/12 ring-1 ring-border/30 transition-[background-color,box-shadow,ring-color] duration-150',
          'hover:bg-muted/18 hover:ring-border/45',
          'active:scale-[0.995]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
          open && 'bg-muted/16 ring-border/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]',
        )}
      >
        <span className="text-[13px] font-medium tracking-[-0.015em] text-foreground/90">
          {triggerLabel}
        </span>
        <ChevronDownIcon
          className={cn(
            'size-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-200 ease-out',
            open && 'rotate-180',
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden pt-3.5 data-[state=closed]:animate-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1 data-[state=open]:duration-200">
        {content}
      </CollapsibleContent>
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
  scene: {
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
    snippet: 'A young woman in a linen shirt, relaxed natural expression, ',
    exampleText: 'A young woman in a linen shirt',
    styles: IMAGE_SEGMENT_STYLES.subject,
  },
  {
    id: 'scene',
    label: 'Scene',
    snippet: 'standing at a sunlit kitchen counter, casual in-the-moment lifestyle scene, ',
    exampleText: 'standing at a sunlit kitchen counter',
    styles: IMAGE_SEGMENT_STYLES.scene,
  },
  {
    id: 'camera',
    label: 'Camera',
    snippet: 'medium shot, 35mm lens, eye-level, shallow depth of field, ',
    exampleText: 'medium shot on 35mm',
    styles: IMAGE_SEGMENT_STYLES.camera,
  },
  {
    id: 'lighting',
    label: 'Light',
    snippet: 'soft morning window light from the left, gentle falloff, ',
    exampleText: 'soft morning window light',
    styles: IMAGE_SEGMENT_STYLES.lighting,
  },
  {
    id: 'style',
    label: 'Style',
    snippet: 'photorealistic editorial lifestyle photography, natural color, sharp detail',
    exampleText: 'photorealistic editorial photography',
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
      defaultOpen={false}
      triggerLabel="Prompt structure"
      tip="Subject, scene, camera, light, then style — tap a phrase to add it."
    />
  )
}
