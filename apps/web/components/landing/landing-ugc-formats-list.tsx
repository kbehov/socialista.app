'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Hand, PackageOpen, Smartphone, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { UGC_ADS } from './content'
import { landingGlass } from './landing-classes'

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
  const [index, setIndex] = useState(0)
  const revealIndex = reduceMotion ? presets.length - 1 : index

  useEffect(() => {
    if (reduceMotion) return

    if (revealIndex >= presets.length - 1) return

    const timeout = setTimeout(() => {
      setIndex(prev => prev + 1)
    }, REVEAL_DELAY_MS)

    return () => clearTimeout(timeout)
  }, [revealIndex, presets.length, reduceMotion])

  const visiblePresets = useMemo(
    () => presets.slice(0, revealIndex + 1),
    [presets, revealIndex],
  )

  return (
    <div className="relative flex w-full max-w-[16rem] flex-col gap-2.5 py-1">
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
                  'relative z-0 flex w-full origin-center cursor-pointer items-center gap-3 rounded-2xl px-4 py-3.5 transition-[border-color,box-shadow] duration-200 ease-out hover:z-20',
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
                whileTap={reduceMotion ? undefined : { scale: presentation.scale * 0.97 }}
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
                {active ? <FormatsPointerCursor className="right-3 top-1/2 -translate-y-1/2" /> : null}
              </motion.div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

function FormatsPointerCursor({ className }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute z-10 size-7 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] ${className ?? ''}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.5 3.5 18 11.2c.9.55.35 1.95-.7 1.75l-4.35-.7-1.5 4.8c-.35 1.1-1.95 1.05-2.2-.1L5.5 3.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
