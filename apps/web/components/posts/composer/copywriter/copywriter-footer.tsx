'use client'

import { COPYWRITER_GENERATION_PRICE_USD } from '@/components/posts/composer/copywriter/copywriter-constants'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SheetFooter } from '@/components/ui/sheet'
import { CheckIcon, PlusIcon, RefreshCwIcon, SparklesIcon, SquareIcon } from 'lucide-react'

const priceLabel = `~$${COPYWRITER_GENERATION_PRICE_USD.toFixed(2)} per generation`

type CopywriterFooterProps = {
  isLoading: boolean
  hasResult: boolean
  hasExistingCaption: boolean
  canGenerate: boolean
  overLimit: boolean
  completion: string
  onClose: () => void
  onStop: () => void
  onGenerate: () => void
  onApply: (mode: 'replace' | 'append') => void
}

export function CopywriterFooter({
  isLoading,
  hasResult,
  hasExistingCaption,
  canGenerate,
  overLimit,
  completion,
  onClose,
  onStop,
  onGenerate,
  onApply,
}: CopywriterFooterProps) {
  return (
    <SheetFooter
      className={cn(
        'shrink-0 flex-row items-center justify-between gap-2 border-t border-border/40 px-5 py-3.5',
        'bg-background/80 backdrop-blur-xl backdrop-saturate-150',
        'supports-backdrop-filter:bg-background/65',
      )}
    >
      {isLoading ? (
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onStop}
            className="gap-1.5 border-border/60 text-muted-foreground hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
          >
            <SquareIcon className="size-3 fill-current" strokeWidth={0} />
            Stop
          </Button>
        </>
      ) : hasResult ? (
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onGenerate}
            disabled={!canGenerate}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RefreshCwIcon className="size-3.5" strokeWidth={1.75} />
            Regenerate
          </Button>
          <div className="flex items-center gap-2">
            {hasExistingCaption ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onApply('append')}
                disabled={!completion.trim() || overLimit}
                className="gap-1.5 border-border/60"
              >
                <PlusIcon className="size-3.5" strokeWidth={1.75} />
                Append
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              onClick={() => onApply('replace')}
              disabled={!completion.trim() || overLimit}
              className="gap-1.5 shadow-xs active:scale-[0.98]"
            >
              <CheckIcon className="size-3.5" strokeWidth={2} />
              {hasExistingCaption ? 'Replace' : 'Use caption'}
            </Button>
          </div>
        </>
      ) : (
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
            Cancel
          </Button>
          <span className="min-w-0 flex-1 truncate text-center text-[11px] tracking-tight text-muted-foreground/55 tabular-nums">
            {priceLabel}
          </span>
          <Button
            type="button"
            size="sm"
            onClick={onGenerate}
            disabled={!canGenerate}
            className="gap-1.5 shadow-xs active:scale-[0.98]"
          >
            <SparklesIcon className="size-3.5" strokeWidth={1.75} />
            Generate
          </Button>
        </>
      )}
    </SheetFooter>
  )
}
