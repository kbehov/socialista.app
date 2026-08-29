'use client'

import { generateSlideshowSlides } from '@/actions/slideshow.actions'
import { StudioPanelScrollArea, StudioPanelSection } from '@/components/carousel/studio-segmented-tabs'
import { StudioSkillPicker } from '@/components/skills/studio-skill-picker'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Textarea } from '@/components/ui/textarea'
import { isBlankSlide } from '@/lib/carousel/defaults'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'
import { formatCredits } from '@/utils/format'
import { PROMPT_KEYS } from '@socialista/types'
import { Loader2Icon, MinusIcon, PlusIcon, SparklesIcon } from 'lucide-react'
import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

const SLIDE_COUNT_MIN = 3
const SLIDE_COUNT_MAX = 10
const GENERATION_CREDIT_COST = 2
const PROMPT_MAX_LENGTH = 800

const PROMPT_EXAMPLES = [
  {
    label: 'Hot take',
    prompt: 'Unpopular opinion: consistency is overrated — here’s what actually grows accounts',
  },
  {
    label: 'POV',
    prompt: 'POV: you finally stopped posting random content and built a system that prints views',
  },
  {
    label: 'Glow-up',
    prompt: 'How I went from 0 to a content brand people actually save and share',
  },
  {
    label: 'Red flags',
    prompt: '5 creator red flags that quietly kill your reach (and what to do instead)',
  },
  {
    label: 'Money talk',
    prompt: 'How creators actually make money in 2026 — no fluff, just the real paths',
  },
  {
    label: 'Save this',
    prompt: 'Save this if you’re tired of posting into the void: the carousel formula that converts',
  },
  {
    label: 'Before/after',
    prompt: 'Before vs after I fixed my hooks — the exact shift that changed everything',
  },
  {
    label: 'Algorithm',
    prompt: 'What the algorithm actually rewards right now (and what it’s quietly killing)',
  },
  {
    label: 'Art breakdown',
    prompt:
      'Explain the painting “The Chess Players” (The Devil’s Checkmate) by Friedrich Moritz August Retzsch. Each slide focuses on one visual detail. Keep every slide to 5–6 words. Only the most interesting finds — no CTA.',
  },
  {
    label: 'Detail hunt',
    prompt:
      'Break down a viral product photo: one hidden detail per slide, ultra-short captions (max 6 words), curiosity first, no fluff, end with a save CTA',
  },
] as const

export function SlideshowGeneratorPanel({ embedded = false }: { embedded?: boolean }) {
  const applyGeneratedContent = useEditorStore(s => s.applyGeneratedContent)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [prompt, setPrompt] = useState('')
  const [slideCount, setSlideCount] = useState<number>(5)
  const [skillId, setSkillId] = useState<string | undefined>()
  const [isPending, startTransition] = useTransition()

  const trimmed = prompt.trim()
  const canGenerate = trimmed.length > 0 && !isPending
  const charCount = prompt.length

  const handleGenerate = () => {
    if (!trimmed) {
      toast.error('Enter a topic or directions first')
      textareaRef.current?.focus()
      return
    }

    startTransition(async () => {
      const result = await generateSlideshowSlides(trimmed, slideCount, skillId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      const slidesBefore = useEditorStore.getState().slides
      const existingCount =
        slidesBefore.length === 1 && slidesBefore[0] && isBlankSlide(slidesBefore[0])
          ? 0
          : slidesBefore.length

      applyGeneratedContent(result.texts)
      useEditorStore.getState().setStudioPanelTab('design')

      const updated = Math.min(existingCount, result.texts.length)
      const created = Math.max(0, result.texts.length - existingCount)
      const detail =
        created > 0 && updated > 0
          ? `Updated ${updated} slide${updated === 1 ? '' : 's'}, added ${created} new`
          : created > 0
            ? `Added ${created} slide${created === 1 ? '' : 's'}`
            : `Updated ${updated} slide${updated === 1 ? '' : 's'}`
      toast.success(`${detail} · ${result.contentType}`)
    })
  }

  const applyExample = (example: (typeof PROMPT_EXAMPLES)[number]) => {
    setPrompt(example.prompt)
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(example.prompt.length, example.prompt.length)
    })
  }

  return (
    <aside
      className={
        embedded
          ? 'flex h-full min-h-0 flex-col overflow-hidden'
          : 'flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm'
      }
    >
      {!embedded ? (
        <div className="shrink-0 border-b border-border/50 px-3.5 py-3">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground/6 text-foreground">
              <SparklesIcon className="size-3.5" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <h2 className="text-[13px] font-medium tracking-[-0.01em] text-foreground">AI generator</h2>
              <p className="mt-0.5 text-[11px] leading-[1.45] text-muted-foreground">
                Optional — skip anytime and design manually
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <StudioPanelScrollArea contentClassName="gap-5 p-3.5 pb-4">
        <StudioPanelSection
          title="Topic & directions"
          description="A topic alone works. Add directions for structure, word count, tone, or focus."
        >
          <div className="relative">
            <Textarea
              ref={textareaRef}
              id="slideshow-prompt"
              placeholder='e.g. Explain this painting — one detail per slide, 5–6 words each…'
              value={prompt}
              onChange={e => setPrompt(e.target.value.slice(0, PROMPT_MAX_LENGTH))}
              rows={5}
              disabled={isPending}
              aria-describedby="slideshow-prompt-hint"
              className={cn(
                'min-h-30 resize-none rounded-xl border-border/50 bg-muted/10 px-3 pt-2.5 pb-7 text-[13px] leading-relaxed shadow-none',
                'placeholder:text-muted-foreground/55',
                'focus-visible:border-ring/60 focus-visible:bg-background focus-visible:ring-2',
                'transition-[background-color,border-color,box-shadow] duration-150',
              )}
              onKeyDown={e => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault()
                  if (canGenerate) handleGenerate()
                }
              }}
            />
            <div
              id="slideshow-prompt-hint"
              className="pointer-events-none absolute right-2.5 bottom-2 flex items-center gap-1.5"
            >
              <span
                className={cn(
                  'text-[10px] tabular-nums tracking-tight',
                  charCount > PROMPT_MAX_LENGTH * 0.9 ? 'text-muted-foreground' : 'text-muted-foreground/50',
                )}
              >
                {charCount > 0 ? `${charCount}` : null}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5" role="list" aria-label="Example prompts">
            {PROMPT_EXAMPLES.map(example => {
              const active = prompt === example.prompt
              return (
                <button
                  key={example.label}
                  type="button"
                  role="listitem"
                  disabled={isPending}
                  onClick={() => applyExample(example)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[11px] tracking-tight transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                    'disabled:pointer-events-none disabled:opacity-50',
                    'active:scale-[0.97]',
                    active
                      ? 'border-foreground/15 bg-foreground/6 font-medium text-foreground'
                      : 'border-border/50 bg-muted/15 text-muted-foreground hover:border-border hover:bg-muted/35 hover:text-foreground',
                  )}
                >
                  {example.label}
                </button>
              )
            })}
          </div>
        </StudioPanelSection>

        <StudioPanelSection title="Pages">
          <div className="bg-muted/20 p-2.5">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Fewer pages"
                disabled={isPending || slideCount <= SLIDE_COUNT_MIN}
                onClick={() => setSlideCount(n => Math.max(SLIDE_COUNT_MIN, n - 1))}
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background text-muted-foreground',
                  'transition-colors duration-150 hover:border-border hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  'active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40',
                )}
              >
                <MinusIcon className="size-3.5" strokeWidth={2} />
              </button>

              <div className="min-w-0 flex-1" aria-live="polite">
                <p className="text-[22px] leading-none font-medium tracking-[-0.03em] tabular-nums text-foreground">
                  {slideCount}
                </p>
                <p className="mt-1 text-[11px] tracking-tight text-muted-foreground">
                  {slideCount === 1 ? 'page' : 'pages'}
                </p>
              </div>

              <button
                type="button"
                aria-label="More pages"
                disabled={isPending || slideCount >= SLIDE_COUNT_MAX}
                onClick={() => setSlideCount(n => Math.min(SLIDE_COUNT_MAX, n + 1))}
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background text-muted-foreground',
                  'transition-colors duration-150 hover:border-border hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  'active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40',
                )}
              >
                <PlusIcon className="size-3.5" strokeWidth={2} />
              </button>
            </div>

            <div
              className="mt-2.5 flex gap-1 px-0.5"
              role="radiogroup"
              aria-label="Quick page count"
            >
              {[3, 5, 7, 10].map(n => {
                const selected = slideCount === n
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={isPending}
                    onClick={() => setSlideCount(n)}
                    className={cn(
                      'h-7 flex-1 rounded-md text-[11px] tabular-nums transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                      'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
                      selected
                        ? 'bg-foreground/8 font-medium text-foreground'
                        : 'font-medium text-muted-foreground hover:bg-foreground/4 hover:text-foreground',
                    )}
                  >
                    {n}
                  </button>
                )
              })}
            </div>
          </div>
        </StudioPanelSection>
      </StudioPanelScrollArea>

      <div className="shrink-0 space-y-2 border-t border-border/40 bg-background p-3.5">
        <StudioSkillPicker
          target={PROMPT_KEYS.slideshow}
          value={skillId}
          onChange={setSkillId}
          disabled={isPending}
        />
        <Button
          className="h-9 w-full gap-2 rounded-lg text-[12px] font-medium tracking-tight"
          onClick={handleGenerate}
          disabled={!canGenerate}
        >
          {isPending ? (
            <Loader2Icon className="size-3.5 animate-spin" strokeWidth={2} />
          ) : (
            <SparklesIcon className="size-3.5" strokeWidth={2} />
          )}
          {isPending ? 'Generating…' : `Generate ${slideCount} pages`}
        </Button>
        <div className="flex items-center justify-between gap-2 px-0.5 text-[11px] text-muted-foreground">
          <p>
            ≈ {formatCredits(GENERATION_CREDIT_COST)} credits per generation
          </p>
          <p className="flex items-center gap-1">
            <Kbd className="h-4 min-w-4 px-1 text-[10px]">⌘</Kbd>
            <Kbd className="h-4 min-w-4 px-1 text-[10px]">↵</Kbd>
          </p>
        </div>
      </div>
    </aside>
  )
}
