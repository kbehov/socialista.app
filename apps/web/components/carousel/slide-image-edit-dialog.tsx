'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Kbd } from '@/components/ui/kbd'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { formatCredits } from '@/utils/format'
import { ImageIcon, Loader2Icon, SparklesIcon } from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'

const PROMPT_MAX_LENGTH = 400
const EDIT_CREDIT_COST = 4

const PROMPT_SUGGESTIONS = [
  {
    label: 'Simpsons',
    prompt:
      'Transform into The Simpsons animated style: yellow skin tones, bold black outlines, flat cel-shaded colors, classic Matt Groening look',
  },
  {
    label: 'Anime',
    prompt:
      'Redraw as high-quality anime: sharp line art, expressive eyes, soft cel shading, vibrant colors, studio Ghibli meets modern shonen aesthetic',
  },
  {
    label: 'Pixar 3D',
    prompt:
      'Turn into a Pixar-style 3D character render: soft subsurface skin, big expressive features, cinematic lighting, polished animation-movie look',
  },
  {
    label: 'Claymation',
    prompt:
      'Make it stop-motion claymation: handmade clay textures, fingerprint details, soft studio lighting, Aardman / Wallace & Gromit vibe',
  },
  {
    label: 'Cyberpunk',
    prompt:
      'Restyle as neon cyberpunk: rainy night city glow, magenta and cyan lights, holographic reflections, Blade Runner mood',
  },
  {
    label: 'Y2K gloss',
    prompt:
      'Apply early-2000s Y2K aesthetic: glossy chrome highlights, soft flash photography, butterfly clips energy, frosted pastel and silver vibes',
  },
  {
    label: 'Vaporwave',
    prompt:
      'Make it vaporwave: pastel pink and cyan gradients, retro 80s grid, dreamy VHS glow, surreal nostalgic internet aesthetic',
  },
  {
    label: 'Pop art',
    prompt:
      'Convert to bold pop art: thick outlines, halftone dots, high-contrast primary colors, Warhol / comic-book poster style',
  },
  {
    label: 'Oil paint',
    prompt:
      'Repaint as rich oil painting: visible brush strokes, classical museum lighting, textured canvas, Rembrandt-inspired depth',
  },
  {
    label: 'Film still',
    prompt:
      'Make it look like a cinematic film still: anamorphic lens feel, subtle grain, teal-and-orange grade, shallow depth of field',
  },
  {
    label: 'Comic panel',
    prompt:
      'Turn into a graphic novel comic panel: inked linework, dynamic shading, speech-bubble-ready composition, modern Marvel/indie comic style',
  },
  {
    label: 'Soft dream',
    prompt:
      'Give it a soft dreamy editorial look: milky highlights, pastel haze, ethereal glow, high-fashion magazine cover vibe',
  },
] as const

type SlideImageEditDialogProps = {
  open: boolean
  imageUrl: string | null
  kind: 'background' | 'layer'
  onOpenChange: (open: boolean) => void
  onSubmit: (prompt: string) => Promise<void>
}

export function SlideImageEditDialog({
  open,
  imageUrl,
  kind,
  onOpenChange,
  onSubmit,
}: SlideImageEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <SlideImageEditDialogBody
          key={`${kind}:${imageUrl ?? 'none'}`}
          imageUrl={imageUrl}
          kind={kind}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  )
}

function SlideImageEditDialogBody({
  imageUrl,
  kind,
  onOpenChange,
  onSubmit,
}: Omit<SlideImageEditDialogProps, 'open'>) {
  const [prompt, setPrompt] = useState('')
  const [isPending, startTransition] = useTransition()
  const [previewFailed, setPreviewFailed] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      textareaRef.current?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  const trimmed = prompt.trim()
  const canSubmit = trimmed.length > 0 && !isPending
  const title = kind === 'background' ? 'Edit background' : 'Edit image'
  const description =
    kind === 'background'
      ? 'Describe the change. AI rewrites this slide background in place.'
      : 'Describe the change. AI rewrites this image layer in place.'

  const handleSubmit = () => {
    if (!canSubmit) return

    startTransition(async () => {
      await onSubmit(trimmed)
    })
  }

  const applySuggestion = (suggestion: (typeof PROMPT_SUGGESTIONS)[number]) => {
    setPrompt(suggestion.prompt)
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(suggestion.prompt.length, suggestion.prompt.length)
    })
  }

  return (
    <DialogContent
      showCloseButton={!isPending}
      className="gap-0 overflow-hidden p-0 sm:max-w-md"
      onPointerDownOutside={event => {
        if (isPending) event.preventDefault()
      }}
      onEscapeKeyDown={event => {
        if (isPending) event.preventDefault()
      }}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-muted/40">
        {imageUrl && !previewFailed ? (
          // eslint-disable-next-line @next/next/no-img-element -- editor preview of arbitrary/local URLs
          <img
            src={imageUrl}
            alt=""
            className="size-full object-cover"
            onError={() => setPreviewFailed(true)}
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="size-6 opacity-50" strokeWidth={1.5} />
            <span className="text-[11px] tracking-tight">Preview unavailable</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-card via-transparent to-transparent" />
        {isPending ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-black/45 backdrop-blur-[2px]">
            <Loader2Icon className="size-5 animate-spin text-white" strokeWidth={2} />
            <p className="text-[12px] font-medium tracking-tight text-white">Editing image…</p>
          </div>
        ) : (
          <div className="absolute right-12 bottom-3 left-3.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-medium tracking-tight text-white backdrop-blur-sm">
              <SparklesIcon className="size-3" strokeWidth={2} />
              AI edit
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-5 pt-4">
        <DialogHeader className="gap-1.5 pr-6">
          <DialogTitle className="text-[15px] font-semibold tracking-[-0.015em]">{title}</DialogTitle>
          <DialogDescription className="text-[12px] leading-relaxed text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              id="image-edit-prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value.slice(0, PROMPT_MAX_LENGTH))}
              placeholder="e.g. brighten the image, add a moody blue tone…"
              rows={4}
              disabled={isPending}
              aria-label="Edit prompt"
              className={cn(
                'min-h-28 resize-none rounded-xl border-border/50 bg-muted/10 px-3 pt-2.5 pb-7 text-[13px] leading-relaxed shadow-none',
                'placeholder:text-muted-foreground/55',
                'focus-visible:border-ring/60 focus-visible:bg-background focus-visible:ring-2',
                'transition-[background-color,border-color,box-shadow] duration-150',
              )}
              onKeyDown={e => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <span
              className={cn(
                'pointer-events-none absolute right-2.5 bottom-2 text-[10px] tabular-nums tracking-tight',
                prompt.length > PROMPT_MAX_LENGTH * 0.9
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/45',
              )}
            >
              {prompt.length > 0 ? prompt.length : null}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium tracking-[0.02em] text-muted-foreground">Style presets</p>
            <div className="flex flex-wrap gap-1.5" role="list" aria-label="Prompt suggestions">
              {PROMPT_SUGGESTIONS.map(suggestion => {
                const active = prompt === suggestion.prompt
                return (
                  <button
                    key={suggestion.label}
                    type="button"
                    role="listitem"
                    disabled={isPending}
                    onClick={() => applySuggestion(suggestion)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[11px] tracking-tight transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                      'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
                      active
                        ? 'border-foreground/15 bg-foreground/6 font-medium text-foreground'
                        : 'border-border/50 bg-muted/15 text-muted-foreground hover:border-border hover:bg-muted/35 hover:text-foreground',
                    )}
                  >
                    {suggestion.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:flex-col sm:space-x-0">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-lg border-border/50 text-[12px] font-medium tracking-tight"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-9 gap-2 rounded-lg text-[12px] font-medium tracking-tight shadow-xs"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isPending ? (
                <Loader2Icon className="size-3.5 animate-spin" strokeWidth={2} />
              ) : (
                <SparklesIcon className="size-3.5" strokeWidth={2} />
              )}
              {isPending ? 'Editing…' : 'Apply edit'}
            </Button>
          </div>
          <p className="flex items-center justify-between gap-2 text-[10px] tracking-wide text-muted-foreground/70 sm:justify-end sm:gap-3">
            <span>≈ {formatCredits(EDIT_CREDIT_COST)} credits per edit</span>
            <span className="flex items-center gap-1">
              <Kbd className="h-4 min-w-4 px-1 text-[10px]">⌘</Kbd>
              <Kbd className="h-4 min-w-4 px-1 text-[10px]">↵</Kbd>
            </span>
          </p>
        </DialogFooter>
      </div>
    </DialogContent>
  )
}
