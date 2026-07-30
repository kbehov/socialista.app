'use client'

import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import {
  BRIEF_SUGGESTIONS,
  COPYWRITER_FADE_EASE,
  TONE_OPTIONS,
} from '@/components/posts/composer/copywriter/copywriter-constants'
import { CopywriterFooter } from '@/components/posts/composer/copywriter/copywriter-footer'
import { CopywriterResult } from '@/components/posts/composer/copywriter/copywriter-result'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { formatProviderList, getStrictestCaptionLimit } from '@/constants/platform-limits'
import type { ComposerMediaItem } from '@/types/composer-types'
import { useCompletion } from '@ai-sdk/react'
import type { SocialProvider } from '@socialista/types'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircleIcon, ImagesIcon, SparklesIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type PostCopywriterDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedProviders: SocialProvider[]
  caption: string
  /** Attached composer visuals — sent to the model so captions are written with the media, not in a vacuum. */
  media?: ComposerMediaItem[]
  onApply: (caption: string, mode: 'replace' | 'append') => void
  /** Toolbar-friendly trigger (icon + short label). */
  compact?: boolean
}

export function PostCopywriterDialog({
  open,
  onOpenChange,
  selectedProviders,
  caption,
  media = [],
  onApply,
  compact = false,
}: PostCopywriterDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const limit = getStrictestCaptionLimit(selectedProviders)
  const platformLabel = formatProviderList(selectedProviders)
  const trimmedCaption = caption.trim()
  const hasExistingCaption = trimmedCaption.length > 0
  const imageContextCount = media.filter(item => item.kind === 'image').length

  const { completion, complete, isLoading, stop, setCompletion } = useCompletion({
    api: '/api/ai/completions/post',
    onError: err => {
      setError(err.message ?? 'Something went wrong. Please try again.')
    },
  })

  const isThinking = isLoading && !completion
  const isStreaming = isLoading && !!completion
  const hasResult = !!completion
  const overLimit = completion.length > limit
  const showPreview = isThinking || hasResult
  const charsOver = completion.length - limit
  const canGenerate = !!prompt.trim() && !isLoading

  const reset = useCallback(() => {
    setPrompt('')
    setTone('')
    setError(null)
    setCopied(false)
    setCompletion('')
    stop()
    if (copyResetRef.current) {
      clearTimeout(copyResetRef.current)
      copyResetRef.current = null
    }
  }, [setCompletion, stop])

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!value) {
        if (isLoading) stop()
        reset()
      }
      onOpenChange(value)
    },
    [isLoading, onOpenChange, reset, stop],
  )

  useEffect(() => {
    if (!previewRef.current) return
    previewRef.current.scrollTop = previewRef.current.scrollHeight
  }, [completion])

  useEffect(() => {
    return () => {
      if (copyResetRef.current) clearTimeout(copyResetRef.current)
    }
  }, [])

  const handleGenerate = useCallback(() => {
    const trimmed = prompt.trim()
    if (!trimmed || isLoading) return
    const previousCaption = completion.trim() || undefined
    // Vision context is images only — video frames are not sent to the model.
    const mediaPayload = media
      .filter(item => item.kind === 'image')
      .slice(0, 4)
      .map(item => ({
        kind: 'image' as const,
        url: item.url,
        altText: item.altText,
      }))
    setError(null)
    setCopied(false)
    setCompletion('')
    void complete(trimmed, {
      body: {
        platforms: selectedProviders,
        existingCaption: trimmedCaption || undefined,
        previousCaption,
        captionMax: limit,
        tone: tone || undefined,
        media: mediaPayload.length > 0 ? mediaPayload : undefined,
      },
    })
  }, [
    complete,
    completion,
    isLoading,
    limit,
    media,
    prompt,
    selectedProviders,
    setCompletion,
    tone,
    trimmedCaption,
  ])

  const handleApply = useCallback(
    (mode: 'replace' | 'append') => {
      const text = completion.trim()
      if (!text) return
      onApply(text, mode)
      handleOpenChange(false)
    },
    [completion, handleOpenChange, onApply],
  )

  const handleCopy = useCallback(async () => {
    const text = completion.trim()
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Caption copied')
      if (copyResetRef.current) clearTimeout(copyResetRef.current)
      copyResetRef.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }, [completion])

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant={compact ? 'ghost' : 'outline'}
          className={cn(
            'gap-1.5 text-xs shadow-none transition-colors active:scale-[0.98]',
            compact
              ? 'h-8 rounded-lg px-2 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              : 'border-border/60 hover:bg-muted/40',
          )}
        >
          <SparklesIcon
            className={cn('size-3.5', compact ? 'text-foreground/70' : 'text-primary')}
            strokeWidth={1.75}
          />
          {compact ? 'AI' : 'Write with AI'}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={!isLoading}
        className="w-full gap-0 overflow-hidden bg-background p-0 sm:max-w-md"
      >
        <SheetHeader
          className={cn(
            'shrink-0 space-y-0 border-b border-border/40 px-5 pt-5 pb-4 pr-12',
            'bg-background/80 backdrop-blur-xl backdrop-saturate-150',
            'supports-backdrop-filter:bg-background/65',
          )}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-2xl',
                'border border-border/50 bg-gradient-to-b from-muted/60 to-muted/20',
                'shadow-xs',
              )}
              aria-hidden
            >
              <SparklesIcon className="size-4 text-foreground/80" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 space-y-1 pt-0.5">
              <SheetTitle className="text-[16px] font-semibold tracking-[-0.02em] text-foreground">
                Write with AI
              </SheetTitle>
              <SheetDescription className="text-[13px] leading-relaxed text-muted-foreground">
                {platformLabel
                  ? `Craft a caption tuned for ${platformLabel}.`
                  : 'Describe your post — get a caption worth posting.'}
              </SheetDescription>
            </div>
          </div>

          {selectedProviders.length > 0 ? (
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
              {selectedProviders.map(provider => (
                <span
                  key={provider}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full',
                    'border border-border/50 bg-muted/30 py-1 pl-1.5 pr-2.5',
                    'text-[11px] font-medium tracking-tight text-foreground/80',
                  )}
                >
                  <SocialPlatformIcon
                    provider={provider}
                    size={9}
                    framed={false}
                    className="size-3.5"
                  />
                  <span className="max-w-28 truncate">{getSocialPlatformLabel(provider)}</span>
                </span>
              ))}
              <span className="ml-0.5 text-[11px] tabular-nums tracking-tight text-muted-foreground/70">
                ≤ {limit.toLocaleString()}
              </span>
            </div>
          ) : null}
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-5 py-5">
            <section className="space-y-2.5">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Tone</p>
              <div
                role="radiogroup"
                aria-label="Caption tone"
                className="inline-flex w-full flex-wrap gap-0.5 rounded-full border border-border/50 bg-muted/30 p-0.5 dark:bg-muted/20"
              >
                {TONE_OPTIONS.map(option => {
                  const selected = tone === option.value
                  return (
                    <button
                      key={option.label}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={isLoading}
                      onClick={() => setTone(option.value)}
                      className={cn(
                        'min-w-0 flex-1 rounded-full px-2.5 py-1.5 text-center text-[11px] font-medium',
                        'transition-[color,background-color,box-shadow,transform] duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                        'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
                        'motion-reduce:active:scale-100',
                        selected
                          ? 'bg-background text-foreground shadow-xs ring-1 ring-border/40'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="copywriter-brief"
                  className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
                >
                  Brief
                </label>
                <span className="hidden items-center gap-1 text-[11px] text-muted-foreground/55 sm:inline-flex">
                  <kbd className="rounded-md border border-border/50 bg-muted/40 px-1.5 py-px font-sans text-[10px] tracking-tight">
                    ⌘
                  </kbd>
                  <span className="text-muted-foreground/40">+</span>
                  <kbd className="rounded-md border border-border/50 bg-muted/40 px-1.5 py-px font-sans text-[10px] tracking-tight">
                    ↵
                  </kbd>
                </span>
              </div>

              <div
                className={cn(
                  'rounded-2xl border border-border/50 bg-muted/15 transition-[border-color,box-shadow] duration-200',
                  'focus-within:border-border focus-within:bg-background focus-within:shadow-xs',
                  'has-disabled:opacity-60',
                )}
              >
                <Textarea
                  id="copywriter-brief"
                  autoFocus
                  value={prompt}
                  onChange={event => {
                    setPrompt(event.target.value)
                    if (error) setError(null)
                  }}
                  placeholder={
                    hasExistingCaption
                      ? 'How should we improve it? Shorter hook, new angle, different energy…'
                      : 'What’s this post about? One sentence is enough.'
                  }
                  rows={showPreview ? 3 : 4}
                  disabled={isLoading}
                  className={cn(
                    'min-h-[5.5rem] resize-none rounded-2xl border-0 bg-transparent px-3.5 py-3',
                    'text-[14px] leading-[1.6] shadow-none',
                    'placeholder:text-muted-foreground/50',
                    'focus-visible:ring-0',
                    showPreview && 'min-h-[4.25rem]',
                  )}
                  onKeyDown={event => {
                    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                      event.preventDefault()
                      handleGenerate()
                    }
                  }}
                />
              </div>

              {imageContextCount > 0 ? (
                <p className="flex items-center gap-1.5 pt-0.5 text-[11px] tracking-tight text-muted-foreground/70">
                  <ImagesIcon className="size-3 shrink-0" strokeWidth={1.75} aria-hidden />
                  AI will write with your {imageContextCount} attached{' '}
                  {imageContextCount === 1 ? 'image' : 'images'} as context
                </p>
              ) : null}

              <AnimatePresence initial={false}>
                {!showPreview && !prompt.trim() ? (
                  <motion.div
                    key="suggestions"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    transition={{ duration: 0.2, ease: COPYWRITER_FADE_EASE }}
                    className="flex flex-wrap gap-1.5 pt-0.5"
                  >
                    {BRIEF_SUGGESTIONS.map(suggestion => (
                      <button
                        key={suggestion.label}
                        type="button"
                        disabled={isLoading}
                        onClick={() => setPrompt(suggestion.prompt)}
                        className={cn(
                          'rounded-full border border-border/45 bg-background px-3 py-1.5',
                          'text-[11px] font-medium tracking-tight text-muted-foreground',
                          'transition-[color,background-color,border-color,transform] duration-150',
                          'hover:border-border hover:bg-muted/40 hover:text-foreground',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          'active:scale-[0.97] disabled:opacity-50 motion-reduce:active:scale-100',
                        )}
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {hasExistingCaption && !showPreview ? (
                  <motion.div
                    key="current-caption"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: COPYWRITER_FADE_EASE }}
                    className="rounded-xl bg-muted/25 px-3.5 py-3"
                  >
                    <p className="text-[10px] font-medium tracking-[0.04em] text-muted-foreground/70 uppercase">
                      Current caption
                    </p>
                    <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                      {trimmedCaption}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </section>

            <AnimatePresence initial={false}>
              {showPreview ? (
                <CopywriterResult
                  previewRef={previewRef}
                  completion={completion}
                  limit={limit}
                  isThinking={isThinking}
                  isStreaming={isStreaming}
                  hasResult={hasResult}
                  overLimit={overLimit}
                  charsOver={charsOver}
                  copied={copied}
                  onCopy={() => void handleCopy()}
                />
              ) : null}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: COPYWRITER_FADE_EASE }}
                  className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/[0.04] px-3.5 py-3"
                  role="alert"
                >
                  <AlertCircleIcon className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="text-[13px] leading-snug text-destructive">{error}</p>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={!prompt.trim()}
                      className={cn(
                        'text-[12px] font-medium text-destructive/90 underline-offset-2 hover:underline',
                        'disabled:pointer-events-none disabled:opacity-50',
                      )}
                    >
                      Try again
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <CopywriterFooter
            isLoading={isLoading}
            hasResult={hasResult}
            hasExistingCaption={hasExistingCaption}
            canGenerate={canGenerate}
            overLimit={overLimit}
            completion={completion}
            onClose={() => handleOpenChange(false)}
            onStop={() => stop()}
            onGenerate={handleGenerate}
            onApply={handleApply}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
