'use client'

import { Shimmer } from '@/components/ai-elements/shimmer'
import {
  GENERATION_CONNECTING_LINES,
  GENERATION_WAITING_LINES,
  type GenerationWaitingKind,
} from '@/constants/generation-waiting.const'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'

const ROTATE_MS = 2800

const lineMotion = {
  initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)' },
  transition: { duration: 0.28, ease: [0.2, 0, 0, 1] as const },
}

type GenerationWaitingStatusProps = {
  contentKind: GenerationWaitingKind
  isConnecting: boolean
  statusLabel: string
  className?: string
}

function pickStartIndex(length: number): number {
  return Math.floor(Math.random() * length)
}

export function GenerationWaitingStatus({
  contentKind,
  isConnecting,
  statusLabel,
  className,
}: GenerationWaitingStatusProps) {
  const lines = useMemo(() => {
    const pool = isConnecting ? GENERATION_CONNECTING_LINES[contentKind] : GENERATION_WAITING_LINES[contentKind]
    return [...pool]
  }, [contentKind, isConnecting])

  const [index, setIndex] = useState(() => pickStartIndex(lines.length))
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (reduceMotion || lines.length <= 1) return

    const id = window.setInterval(() => {
      setIndex(prev => (prev + 1) % lines.length)
    }, ROTATE_MS)

    return () => window.clearInterval(id)
  }, [lines, reduceMotion])

  const line = lines[index] ?? lines[0]
  const displayLine = reduceMotion ? statusLabel : line

  return (
    <div
      className={cn(
        'mt-10 flex min-h-[2.75rem] w-full max-w-md flex-col items-center justify-center sm:mt-11',
        className,
      )}
    >
      <p className="sr-only" aria-live="polite">
        {statusLabel}
      </p>

      {reduceMotion ? (
        <p className="max-w-[28ch] text-center text-[13px] leading-[1.45] tracking-[-0.01em] text-black/50 dark:text-white/50">
          {displayLine}
        </p>
      ) : (
        <div aria-hidden className="overflow-hidden py-1">
          <AnimatePresence mode="wait">
            <motion.div key={`${contentKind}-${isConnecting}-${line}`} className="flex justify-center" {...lineMotion}>
              <Shimmer
                as="span"
                className="max-w-[28ch] text-center text-[13px] leading-[1.45] tracking-[-0.01em]"
                duration={2.4}
                spread={2.5}
              >
                {line}
              </Shimmer>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
