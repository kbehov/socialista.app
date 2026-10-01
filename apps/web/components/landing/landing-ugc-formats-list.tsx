'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { Hand, PackageOpen, Smartphone, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { UGC_ADS } from './content'
import { landingGlass } from './landing-classes'
import { PointerCursor } from './pointer-cursor'

const formatsItem = UGC_ADS.items[2]

const presetIcons: Record<(typeof formatsItem.presets)[number]['icon'], LucideIcon> = {
  hand: Hand,
  smartphone: Smartphone,
  unboxing: PackageOpen,
}

const presetPresentation: Record<
  (typeof formatsItem.presets)[number]['label'],
  { scale: number; rotate: number }
> = {
  'Product in hand': { scale: 0.98, rotate: -1.5 },
  'Show your app': { scale: 1.02, rotate: 0 },
  Unboxing: { scale: 0.99, rotate: 1.5 },
}

const REVEAL_DELAY_MS = 1_350

const cardSpring = { type: 'spring' as const, stiffness: 420, damping: 30, bounce: 0 }

function hoverScale(base: number) {
  return Math.min(base + 0.045, 1.07)
}

export function LandingUgcFormatsList() {
  const reduceMotion = useReducedMotion()
  const presets = formatsItem.presets
  const containerRef = useRef<HTMLDivElement>(null)
  // Start the reveal once the card is actually on screen, not on mount
  const inView = useInView(containerRef, { once: true, amount: 0.5 })
  const [index, setIndex] = useState(0)
  const revealIndex = reduceMotion ? presets.length - 1 : index

  useEffect(() => {
    if (reduceMotion || !inView) return

    if (revealIndex >= presets.length - 1) return

    const timeout = setTimeout(() => {
      setIndex(prev => prev + 1)
    }, REVEAL_DELAY_MS)

    return () => clearTimeout(timeout)
  }, [revealIndex, presets.length, reduceMotion, inView])

  const visiblePresets = useMemo(
    () => presets.slice(0, revealIndex + 1),
    [presets, revealIndex],
  )

  return (
    <div ref={containerRef} className="relative flex w-full max-w-[16rem] flex-col gap-2.5 py-1">
      <AnimatePresence initial={false}>
        {visiblePresets.map(preset => {
          const Icon = presetIcons[preset.icon]
          const active = preset.label === formatsItem.activePreset
          const presentation = presetPresentation[preset.label]

          return (
            <motion.div
              key={preset.label}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="relative w-full"
            >
              <motion.div
                className={cn(
                  landingGlass,
                  'relative z-0 flex w-full origin-center items-center gap-3 rounded-2xl px-4 py-3.5 transition-[border-color,box-shadow] duration-200 ease-out hover:z-20',
                  active ? 'ring-1 ring-white/30' : 'hover:border-white/28 hover:shadow-[0_16px_40px_-18px_rgba(0,0,0,0.65)]',
                )}
                initial={false}
                animate={{
                  scale: presentation.scale,
                  rotate: presentation.rotate,
                }}
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        scale: hoverScale(presentation.scale),
                        y: -4,
                        rotate: presentation.rotate,
                      }
                }
                transition={cardSpring}
              >
                <span
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10',
                    active ? 'size-10' : 'size-9',
                  )}
                >
                  <Icon
                    className={cn('text-white/90', active ? 'size-[1.125rem]' : 'size-4')}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </span>
                <span
                  className={cn(
                    'font-medium tracking-[-0.02em] text-white',
                    active ? 'text-[1rem]' : 'text-[0.9375rem]',
                  )}
                >
                  {preset.label}
                </span>
                {active ? <PointerCursor className="right-3 top-1/2 -translate-y-1/2" /> : null}
              </motion.div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
