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

      <div className="rounded-xl bg-black/[0.025] px-3.5 py-3 text-[13px] font-normal leading-[1.7] tracking-[-0.015em] ring-1 ring-black/[0.07] dark:bg-white/[0.025] dark:ring-white/[0.08]">
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
                'transition-[background-color,border-color,color,transform] duration-150',
                'active:scale-[0.97] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/45',
                isActive
                  ? cn(styles.chip)
                  : cn('border-black/10 bg-black/[0.02] text-black/56 dark:border-white/12 dark:bg-white/[0.03] dark:text-white/56', styles.chipIdle),
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
          'group mx-auto flex items-center justify-center gap-1 py-1 text-left',
          'text-black/40 transition-colors duration-150 dark:text-white/40',
          'hover:text-foreground/70',
          'active:scale-[0.99] motion-reduce:active:scale-100',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/45',
          open && 'text-foreground/70',
        )}
      >
        <span className="text-[12px] font-medium tracking-[-0.015em]">
          {triggerLabel}
        </span>
        <ChevronDownIcon
          className={cn(
            'size-3 shrink-0 text-current opacity-60 transition-transform duration-200 ease-out',
            open && 'rotate-180',
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden pt-3 data-[state=closed]:animate-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1 data-[state=open]:duration-200">
        {content}
      </CollapsibleContent>
    </Collapsible>
  )
}

const IMAGE_SEGMENT_STYLES = {
  subject: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle: 'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
  scene: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle: 'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
  camera: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle: 'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
  lighting: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle: 'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
  style: {
    text: 'text-foreground/90',
    surface: 'bg-black/[0.05] dark:bg-white/[0.06]',
    chip: 'border-black/14 bg-black/[0.04] text-foreground/80 dark:border-white/14 dark:bg-white/[0.05]',
    chipIdle: 'hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
    decoration: 'decoration-foreground/25',
  },
} as const satisfies Record<string, PromptAnatomySegmentStyles>

export const IMAGE_PROMPT_ANATOMY_SEGMENTS = [
  {
    id: 'subject',
    label: 'Product',
    snippet: 'A matte glass serum bottle, label square to camera, ',
    exampleText: 'A matte glass serum bottle',
    styles: IMAGE_SEGMENT_STYLES.subject,
  },
  {
    id: 'scene',
    label: 'Set',
    snippet: 'on honed travertine, styled as a luxury PDP hero, ',
    exampleText: 'on honed travertine for a PDP hero',
    styles: IMAGE_SEGMENT_STYLES.scene,
  },
  {
    id: 'camera',
    label: 'Camera',
    snippet: '50mm, slight overhead, product filling the frame, ',
    exampleText: '50mm, slight overhead',
    styles: IMAGE_SEGMENT_STYLES.camera,
  },
  {
    id: 'lighting',
    label: 'Light',
    snippet: 'hard side light, controlled speculars, no fill, ',
    exampleText: 'hard side light, clean speculars',
    styles: IMAGE_SEGMENT_STYLES.lighting,
  },
  {
    id: 'style',
    label: 'Finish',
    snippet: 'luxury ecommerce photography, true color, feed-ready',
    exampleText: 'luxury ecommerce, feed-ready',
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
      tip="Product, set, camera, light, then finish — tap a phrase to add it."
    />
  )
}
