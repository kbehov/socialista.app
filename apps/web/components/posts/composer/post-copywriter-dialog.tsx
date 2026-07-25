'use client'

import { CharacterCountRing } from '@/components/common/charachter-count-ring'
import { Shimmer } from '@/components/ai-elements/shimmer'
import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useCompletion } from '@ai-sdk/react'
import type { SocialProvider } from '@socialista/types'
import { AnimatePresence, motion } from 'motion/react'
import {
  AlertCircleIcon,
  CheckIcon,
  CopyIcon,
  PlusIcon,
  RefreshCwIcon,
  BotIcon,
  SquareIcon,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { formatProviderList, getStrictestCaptionLimit } from '../../../constants/platform-limits'

const TONE_OPTIONS = [
  { value: '', label: 'Auto' },
  { value: 'bold and scroll-stopping', label: 'Bold' },
  { value: 'playful and witty', label: 'Playful' },
  { value: 'professional and polished', label: 'Professional' },
  { value: 'casual and conversational', label: 'Casual' },
] as const

const BRIEF_SUGGESTIONS = [
  'Product launch — energetic, make people want to tap',
  'Behind-the-scenes moment, authentic and relatable',
  'Ask a question to spark comments',
  'Tease something coming soon — curiosity hook',
] as const

type PostCopywriterDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedProviders: SocialProvider[]
  caption: string
  onApply: (caption: string, mode: 'replace' | 'append') => void
}

export function PostCopywriterDialog({
  open,
  onOpenChange,
  selectedProviders,
  caption,
  onApply,
}: PostCopywriterDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const limit = getStrictestCaptionLimit(selectedProviders)
  const platformLabel = formatProviderList(selectedProviders)
  const trimmedCaption = caption.trim()
  const hasExistingCaption = trimmedCaption.length > 0

  const { completion, complete, isLoading, stop, setCompletion } = useCompletion({
    api: '/api/ai/completions/post',
    streamProtocol: 'text',
    onError: err => {
      setError(err.message ?? 'Something went wrong. Please try again.')
    },
  })

  const isThinking = isLoading && !completion
  const isStreaming = isLoading && !!completion
  const hasResult = !!completion
  const overLimit = completion.length > limit
  const nearLimit = completion.length > limit * 0.9
  const showPreview = isThinking || hasResult
  const charsOver = completion.length - limit

  const reset = useCallback(() => {
    setPrompt('')
    setTone('')
    setError(null)
    setCompletion('')
    stop()
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

  const handleGenerate = useCallback(() => {
    const trimmed = prompt.trim()
    if (!trimmed || isLoading) return
    setError(null)
    setCompletion('')
    void complete(trimmed, {
      body: {
        platforms: selectedProviders,
        existingCaption: trimmedCaption || undefined,
        captionMax: limit,
        tone: tone || undefined,
      },
    })
  }, [complete, isLoading, limit, prompt, selectedProviders, setCompletion, tone, trimmedCaption])

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
      toast.success('Caption copied')
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }, [completion])

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-border/60 text-xs shadow-none transition-colors hover:bg-muted/40"
        >
          <BotIcon className="size-3.5 text-primary" strokeWidth={1.75} />
          Write with AI
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={!isLoading}
        className="w-full gap-0 bg-background p-0 sm:max-w-md"
      >
        <SheetHeader className="shrink-0 space-y-3 border-b border-border/50 px-5 py-4 pr-12">
          <div className="flex items-start gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/8"
              aria-hidden
            >
              <BotIcon className="size-4 text-primary" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 space-y-1">
              <SheetTitle className="text-[15px] font-semibold tracking-[-0.01em]">Write with AI</SheetTitle>
              <SheetDescription className="text-xs leading-relaxed">
                {platformLabel
                  ? `Craft a caption tuned for ${platformLabel}.`
                  : 'Describe your post and get a scroll-stopping caption.'}
              </SheetDescription>
            </div>
          </div>

          {selectedProviders.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedProviders.map(provider => (
                <span
                  key={provider}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/25 py-0.5 pl-1 pr-2.5 text-[11px] font-medium text-muted-foreground"
                >
                  <SocialPlatformIcon provider={provider} size={9} framed={false} className="size-3.5" />
                  <span className="max-w-32 truncate">{getSocialPlatformLabel(provider)}</span>
                </span>
              ))}
              <span className="inline-flex items-center rounded-full px-1 py-0.5 text-[10px] tabular-nums text-muted-foreground/70">
                {limit.toLocaleString()} char max
              </span>
            </div>
          ) : null}
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-muted-foreground">Tone</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TONE_OPTIONS.map(option => {
                  const selected = tone === option.value
                  return (
                    <button
                      key={option.label}
                      type="button"
                      disabled={isLoading}
                      onClick={() => setTone(option.value)}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        'active:scale-[0.97] disabled:opacity-50',
                        selected
                          ? 'border-primary/25 bg-primary/10 text-foreground shadow-xs'
                          : 'border-border/50 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground',
                      )}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="copywriter-brief" className="text-[11px] font-medium text-muted-foreground">
                  Brief
                </label>
                <span className="text-[10px] text-muted-foreground/60">
                  <kbd className="rounded border border-border/60 bg-muted/30 px-1 py-px font-sans text-[10px]">
                    ⌘
                  </kbd>
                  <span className="mx-0.5">+</span>
                  <kbd className="rounded border border-border/60 bg-muted/30 px-1 py-px font-sans text-[10px]">
                    Enter
                  </kbd>
                  <span className="ml-1">to generate</span>
                </span>
              </div>

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
                    ? 'How should we improve your caption? New angle, shorter hook, different tone…'
                    : 'What is this post about? Tone, angle, or hook — one sentence is enough.'
                }
                rows={4}
                disabled={isLoading}
                className="min-h-24 resize-none rounded-xl border-border/50 text-[14px] leading-relaxed shadow-none"
                onKeyDown={event => {
                  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                    event.preventDefault()
                    handleGenerate()
                  }
                }}
              />

              {!showPreview && !prompt.trim() ? (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-muted-foreground">Quick ideas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {BRIEF_SUGGESTIONS.map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        disabled={isLoading}
                        onClick={() => setPrompt(suggestion)}
                        className={cn(
                          'rounded-full border border-border/50 bg-muted/20 px-2.5 py-1 text-left text-[11px] leading-snug text-muted-foreground',
                          'transition-colors hover:border-primary/20 hover:bg-muted/50 hover:text-foreground',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          'active:scale-[0.98] disabled:opacity-50',
                        )}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {hasExistingCaption && !showPreview ? (
                <div className="rounded-xl border border-border/40 bg-muted/15 px-3 py-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">
                    Current caption
                  </p>
                  <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                    {trimmedCaption}
                  </p>
                </div>
              ) : null}
            </div>

            <AnimatePresence initial={false}>
              {showPreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex min-h-0 flex-1 flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {isThinking ? <Shimmer as="span">Writing caption…</Shimmer> : 'Generated caption'}
                    </span>
                    {hasResult ? (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          onClick={() => void handleCopy()}
                          aria-label="Copy caption"
                        >
                          <CopyIcon className="size-3.5" />
                        </Button>
                        <CharacterCountRing current={completion.length} max={limit} />
                        <span
                          className={cn(
                            'text-[11px] tabular-nums tracking-tight',
                            overLimit
                              ? 'font-medium text-destructive'
                              : nearLimit
                                ? 'text-amber-600 dark:text-amber-500'
                                : 'text-muted-foreground',
                          )}
                        >
                          {completion.length.toLocaleString()}
                          <span className="text-muted-foreground/60"> / {limit.toLocaleString()}</span>
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div
                    ref={previewRef}
                    className={cn(
                      'min-h-44 flex-1 overflow-y-auto rounded-xl border px-4 py-3.5',
                      overLimit && hasResult
                        ? 'border-destructive/30 bg-destructive/5'
                        : 'border-border/50 bg-muted/15',
                    )}
                  >
                    {isThinking ? (
                      <div className="space-y-2.5 py-0.5" aria-hidden>
                        {[0.92, 0.78, 0.65, 0.42].map((width, index) => (
                          <div
                            key={index}
                            className="h-3.5 animate-pulse rounded-md bg-muted/70 motion-reduce:animate-none"
                            style={{ width: `${width * 100}%`, animationDelay: `${index * 120}ms` }}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-[14px] leading-[1.65] text-foreground">
                        {completion}
                        {isStreaming ? (
                          <span
                            aria-hidden
                            className="ml-0.5 inline-block h-[1.05em] w-0.5 translate-y-px animate-pulse bg-primary/80 motion-reduce:animate-none"
                          />
                        ) : null}
                      </p>
                    )}
                  </div>

                  {overLimit && hasResult ? (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2">
                      <AlertCircleIcon className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                      <p className="text-[11px] leading-relaxed text-destructive">
                        {charsOver.toLocaleString()} characters over the limit for your selected platforms. Trim or
                        regenerate before using.
                      </p>
                    </div>
                  ) : null}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {error ? (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2.5">
                <AlertCircleIcon className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs text-destructive">{error}</p>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={!prompt.trim()}
                    className="text-[11px] font-medium text-destructive underline-offset-2 hover:underline disabled:opacity-50"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <SheetFooter className="shrink-0 flex-row items-center justify-between gap-2 border-t border-border/50 bg-muted/10 px-5 py-3.5">
            {isLoading ? (
              <>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => stop()}
                  className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <SquareIcon className="size-3.5" />
                  Stop
                </Button>
              </>
            ) : hasResult ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className="gap-1.5"
                >
                  <RefreshCwIcon className="size-3.5" />
                  Regenerate
                </Button>
                <div className="flex items-center gap-2">
                  {hasExistingCaption ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleApply('append')}
                      disabled={!completion.trim() || overLimit}
                      className="gap-1.5"
                    >
                      <PlusIcon className="size-3.5" />
                      Append
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleApply('replace')}
                    disabled={!completion.trim() || overLimit}
                    className="gap-1.5"
                  >
                    <CheckIcon className="size-3.5" />
                    {hasExistingCaption ? 'Replace' : 'Use caption'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className="gap-1.5"
                >
                  <BotIcon className="size-3.5" />
                  Generate
                </Button>
              </>
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
