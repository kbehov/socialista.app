'use client'

import { Shimmer } from '@/components/ai-elements/shimmer'
import { CaptionLengthIndicator } from '@/components/posts/composer/caption-length-indicator'
import {
  COPYWRITER_FADE_EASE,
  COPYWRITER_SPRING,
} from '@/components/posts/composer/copywriter/copywriter-constants'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircleIcon, CheckIcon, CopyIcon } from 'lucide-react'
import type { RefObject } from 'react'

type CopywriterResultProps = {
  previewRef: RefObject<HTMLDivElement | null>
  completion: string
  limit: number
  isThinking: boolean
  isStreaming: boolean
  hasResult: boolean
  overLimit: boolean
  charsOver: number
  copied: boolean
  onCopy: () => void
}

export function CopywriterResult({
  previewRef,
  completion,
  limit,
  isThinking,
  isStreaming,
  hasResult,
  overLimit,
  charsOver,
  copied,
  onCopy,
}: CopywriterResultProps) {
  return (
    <motion.section
      key="preview"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={COPYWRITER_SPRING}
      className="flex min-h-0 flex-1 flex-col gap-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {isThinking ? (
            <Shimmer as="span" className="normal-case tracking-normal">
              Writing…
            </Shimmer>
          ) : isStreaming ? (
            <Shimmer as="span" className="normal-case tracking-normal">
              Streaming…
            </Shimmer>
          ) : (
            'Caption'
          )}
        </span>

        {hasResult ? (
          <div className="flex items-center gap-1.5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-7 text-muted-foreground hover:text-foreground active:scale-[0.96]"
                    onClick={onCopy}
                    aria-label={copied ? 'Copied' : 'Copy caption'}
                  >
                    {copied ? (
                      <CheckIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <CopyIcon className="size-3.5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{copied ? 'Copied' : 'Copy'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <CaptionLengthIndicator current={completion.length} max={limit} className="pl-0.5" />
          </div>
        ) : null}
      </div>

      <div
        ref={previewRef}
        className={cn(
          'min-h-48 flex-1 overflow-y-auto rounded-2xl border px-4 py-4',
          'transition-[border-color,background-color] duration-200',
          overLimit && hasResult
            ? 'border-destructive/30 bg-destructive/[0.04]'
            : 'border-border/50 bg-gradient-to-b from-muted/25 to-muted/10',
        )}
      >
        {isThinking ? (
          <div className="space-y-3 py-1" aria-busy aria-label="Generating caption">
            {[0.94, 0.82, 0.7, 0.48].map((width, index) => (
              <div
                key={index}
                className="h-3.5 animate-pulse rounded-md bg-muted/80 motion-reduce:animate-none"
                style={{
                  width: `${width * 100}%`,
                  animationDelay: `${index * 90}ms`,
                }}
              />
            ))}
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-[14.5px] leading-[1.7] tracking-[-0.005em] text-foreground">
            {completion}
            {isStreaming ? (
              <span
                aria-hidden
                className="ml-0.5 inline-block h-[1.1em] w-[1.5px] translate-y-px animate-pulse rounded-full bg-foreground/70 motion-reduce:animate-none"
              />
            ) : null}
          </p>
        )}
      </div>

      <AnimatePresence initial={false}>
        {overLimit && hasResult ? (
          <motion.div
            key="over-limit"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: COPYWRITER_FADE_EASE }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/[0.04] px-3 py-2.5">
              <AlertCircleIcon className="mt-0.5 size-3.5 shrink-0 text-destructive" />
              <p className="text-[12px] leading-relaxed text-destructive/90">
                {charsOver.toLocaleString()} characters over the limit. Trim or regenerate before
                using.
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  )
}
