'use client'

import { TypingAnimation } from '@/components/ui/typing-animation'
import { cn } from '@/lib/utils'

type StudioAnimatedPlaceholderProps = {
  words: string[]
  compact?: boolean
}

export function StudioAnimatedPlaceholder({
  words,
  compact = false,
}: StudioAnimatedPlaceholderProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 z-[5] overflow-hidden',
        compact ? 'px-3 pt-2.5' : 'px-4 pt-4',
      )}
      aria-hidden
    >
      <TypingAnimation
        words={words}
        loop
        showCursor
        blinkCursor
        cursorStyle="line"
        startOnView={false}
        typeSpeed={24}
        deleteSpeed={14}
        pauseDelay={2000}
        className={cn(
          'text-muted-foreground/45',
          compact
            ? 'text-[13px] leading-[22px] tracking-[-0.14px]'
            : 'text-[15px] leading-[25px] tracking-[-0.18px]',
        )}
      />
    </div>
  )
}
