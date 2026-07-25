'use client'

import { Shimmer } from '@/components/ai-elements/shimmer'
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
import { BotIcon, CheckIcon, PlusIcon, RefreshCwIcon, SparklesIcon, SquareIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { formatProviderList, getStrictestCaptionLimit } from '../../../constants/platform-limits'

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
  const [error, setError] = useState<string | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const limit = getStrictestCaptionLimit(selectedProviders)
  const platformLabel = formatProviderList(selectedProviders)

  const { completion, complete, isLoading, stop, setCompletion } = useCompletion({
    api: '/api/ai/completions/post',
    streamProtocol: 'text',
    body: {
      platforms: selectedProviders,
      // existingCaption: caption.trim() || undefined,
      captionMax: limit,
    },
    onError: err => {
      setError(err.message ?? 'Something went wrong. Please try again.')
    },
  })

  const isThinking = isLoading && !completion
  const isStreaming = isLoading && !!completion
  const hasResult = !!completion
  const overLimit = completion.length > limit
  const showPreview = isThinking || hasResult

  const reset = useCallback(() => {
    setPrompt('')
    setError(null)
    setCompletion('')
    stop()
  }, [setCompletion, stop])

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (!isLoading) {
        if (!value) reset()
        onOpenChange(value)
      }
    },
    [isLoading, onOpenChange, reset],
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
    void complete(trimmed)
  }, [complete, isLoading, prompt, setCompletion])

  const handleApply = useCallback(
    (mode: 'replace' | 'append') => {
      const text = completion.trim()
      if (!text) return
      onApply(text, mode)
      handleOpenChange(false)
    },
    [completion, handleOpenChange, onApply],
  )

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
          <BotIcon className="size-3.5" />
          Write with AI
        </Button>
      </SheetTrigger>

      <SheetContent side="right" showCloseButton={!isLoading} className="w-full gap-0 bg-background p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 space-y-1 border-b border-border/50 px-5 py-4 pr-12">
          <SheetTitle className="text-[15px] font-semibold tracking-[-0.01em]">Write with AI</SheetTitle>
          <SheetDescription className="text-xs leading-relaxed">
            {platformLabel
              ? `Generate a caption for ${platformLabel}.`
              : 'Describe your post and get a scroll-stopping caption.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
            <div className="space-y-2">
              <label htmlFor="copywriter-brief" className="text-[11px] font-medium text-muted-foreground">
                Brief
              </label>
              <Textarea
                id="copywriter-brief"
                autoFocus
                value={prompt}
                onChange={event => {
                  setPrompt(event.target.value)
                  if (error) setError(null)
                }}
                placeholder="What is this post about? Tone, angle, or hook — one sentence is enough."
                rows={4}
                disabled={isLoading}
                className="min-h-24 resize-none text-[14px] leading-relaxed"
                onKeyDown={event => {
                  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                    event.preventDefault()
                    handleGenerate()
                  }
                }}
              />
            </div>

            {showPreview ? (
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {isThinking ? <Shimmer as="span">Thinking…</Shimmer> : 'Caption'}
                  </span>
                  {hasResult ? (
                    <span
                      className={cn(
                        'text-[11px] tabular-nums',
                        overLimit ? 'font-medium text-destructive' : 'text-muted-foreground',
                      )}
                    >
                      {completion.length.toLocaleString()} / {limit.toLocaleString()}
                    </span>
                  ) : null}
                </div>

                <div
                  ref={previewRef}
                  className="min-h-40 flex-1 overflow-y-auto  border-t border-border/50 bg-muted/15 px-4 py-3"
                >
                  {!isThinking ? (
                    <p className="whitespace-pre-wrap text-[14px] leading-[1.65] text-foreground">
                      {completion}
                      {isStreaming ? (
                        <span
                          aria-hidden
                          className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-foreground/70 motion-reduce:animate-none"
                        />
                      ) : null}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>

          <SheetFooter className="shrink-0 flex-row items-center justify-between gap-2 border-t border-border/50 bg-muted/10 px-5 py-3.5">
            {isLoading ? (
              <>
                <Button type="button" variant="ghost" size="sm" disabled>
                  Cancel
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => stop()} className="gap-1.5">
                  <SquareIcon className="size-3.5" />
                  Stop
                </Button>
              </>
            ) : hasResult ? (
              <>
                <Button type="button" variant="ghost" size="sm" onClick={handleGenerate} className="gap-1.5">
                  <RefreshCwIcon className="size-3.5" />
                  Regenerate
                </Button>
                <div className="flex items-center gap-2">
                  {caption.trim() ? (
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
                    {caption.trim() ? 'Replace' : 'Use caption'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={handleGenerate} disabled={!prompt.trim()} className="gap-1.5">
                  <SparklesIcon className="size-3.5" />
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
