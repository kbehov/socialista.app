'use client'

import { colorForSwatch, EYE_COLOR_OPTIONS, HAIR_COLOR_OPTIONS, SKIN_TONE_OPTIONS } from '@/lib/studio/influencers/options'
import { cn } from '@/lib/utils'
import { motion, useReducedMotion } from 'motion/react'

const COLOR_SPRING = { type: 'spring' as const, bounce: 0, duration: 0.45 }

export type InfluencerAvatarSilhouetteProps = {
  skinTone: string
  hairColor: string
  eyeColor: string
  hairStyle?: string
  facialHair?: string
  size?: 'sm' | 'preview' | 'md' | 'lg'
  className?: string
}

const SIZE = {
  sm: {
    face: 'size-10',
    eye: 'size-1.5',
    eyeGap: 'gap-1.5',
    eyeTop: 'top-[42%]',
  },
  preview: {
    face: 'size-28',
    eye: 'size-2',
    eyeGap: 'gap-2.5',
    eyeTop: 'top-[40%]',
  },
  md: {
    face: 'size-[7.5rem] sm:size-36',
    eye: 'size-2.5 sm:size-3',
    eyeGap: 'gap-[1.125rem]',
    eyeTop: 'top-[40%]',
  },
  lg: {
    face: 'size-40 sm:size-44',
    eye: 'size-3',
    eyeGap: 'gap-5',
    eyeTop: 'top-[39%]',
  },
} as const

function HairLayer({
  hairStyle,
  hair,
  reduceMotion,
}: {
  hairStyle: string
  hair: string
  reduceMotion: boolean | null
}) {
  const transition = reduceMotion ? { duration: 0 } : COLOR_SPRING
  const isLong = hairStyle === 'straight long' || hairStyle === 'wavy' || hairStyle === 'curly' || hairStyle === 'coily'
  const isShort = hairStyle === 'pixie' || hairStyle === 'straight short' || hairStyle === 'slicked back'
  const isBob = hairStyle === 'bob'
  const isBun = hairStyle === 'bun'
  const isBraids = hairStyle === 'braids'

  if (isBun) {
    return (
      <>
        <motion.div
          aria-hidden
          className={cn('absolute top-[-8%] left-1/2 -translate-x-1/2 rounded-[50%]', 'h-[44%] w-[92%]')}
          animate={{ backgroundColor: hair }}
          transition={transition}
        />
        <motion.div
          aria-hidden
          className="absolute top-[-22%] left-1/2 size-[28%] -translate-x-1/2 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
          animate={{ backgroundColor: hair }}
          transition={transition}
        />
      </>
    )
  }

  if (isBraids) {
    return (
      <>
        <motion.div
          aria-hidden
          className={cn('absolute top-[-8%] left-1/2 -translate-x-1/2 rounded-[50%]', 'h-[44%] w-[92%]')}
          animate={{ backgroundColor: hair }}
          transition={transition}
        />
        <motion.div
          aria-hidden
          className="absolute top-[18%] -left-[6%] h-[55%] w-[22%] rounded-full"
          animate={{ backgroundColor: hair }}
          transition={transition}
        />
        <motion.div
          aria-hidden
          className="absolute top-[18%] -right-[6%] h-[55%] w-[22%] rounded-full"
          animate={{ backgroundColor: hair }}
          transition={transition}
        />
      </>
    )
  }

  return (
    <>
      <motion.div
        aria-hidden
        className={cn(
          'absolute left-1/2 -translate-x-1/2 rounded-[50%]',
          isLong && 'top-[-8%] h-[52%] w-[98%]',
          isBob && 'top-[-6%] h-[48%] w-[96%]',
          isShort && 'top-[-4%] h-[38%] w-[90%]',
          !isLong && !isBob && !isShort && 'top-[-8%] h-[44%] w-[94%]',
        )}
        animate={{ backgroundColor: hair }}
        transition={transition}
      />
      {isLong ? (
        <>
          <motion.div
            aria-hidden
            className="absolute top-[28%] -left-[8%] h-[72%] w-[28%] rounded-b-[3rem] rounded-t-[2rem]"
            animate={{ backgroundColor: hair }}
            transition={transition}
          />
          <motion.div
            aria-hidden
            className="absolute top-[28%] -right-[8%] h-[72%] w-[28%] rounded-b-[3rem] rounded-t-[2rem]"
            animate={{ backgroundColor: hair }}
            transition={transition}
          />
        </>
      ) : null}
    </>
  )
}

function FacialHairLayer({
  facialHair,
  hair,
  reduceMotion,
}: {
  facialHair?: string
  hair: string
  reduceMotion: boolean | null
}) {
  if (!facialHair || facialHair === 'none') return null
  const transition = reduceMotion ? { duration: 0 } : COLOR_SPRING

  if (facialHair === 'beard') {
    return (
      <motion.div
        aria-hidden
        className="absolute top-[62%] left-1/2 h-[28%] w-[72%] -translate-x-1/2 rounded-b-[2rem] opacity-80"
        animate={{ backgroundColor: hair }}
        transition={transition}
      />
    )
  }

  if (facialHair === 'stubble') {
    return (
      <motion.div
        aria-hidden
        className="absolute top-[68%] left-1/2 h-[14%] w-[58%] -translate-x-1/2 rounded-full opacity-50 blur-[1px]"
        animate={{ backgroundColor: hair }}
        transition={transition}
      />
    )
  }

  if (facialHair === 'mustache') {
    return (
      <motion.div
        aria-hidden
        className="absolute top-[58%] left-1/2 h-[6%] w-[36%] -translate-x-1/2 rounded-full opacity-85"
        animate={{ backgroundColor: hair }}
        transition={transition}
      />
    )
  }

  if (facialHair === 'goatee') {
    return (
      <motion.div
        aria-hidden
        className="absolute top-[66%] left-1/2 h-[18%] w-[22%] -translate-x-1/2 rounded-b-full opacity-85"
        animate={{ backgroundColor: hair }}
        transition={transition}
      />
    )
  }

  return null
}

export function InfluencerAvatarSilhouette({
  skinTone,
  hairColor,
  eyeColor,
  hairStyle = 'wavy',
  facialHair,
  size = 'md',
  className,
}: InfluencerAvatarSilhouetteProps) {
  const reduceMotion = useReducedMotion()
  const skin = colorForSwatch(SKIN_TONE_OPTIONS, skinTone) ?? '#C68642'
  const hair = colorForSwatch(HAIR_COLOR_OPTIONS, hairColor) ?? '#3B2314'
  const eyes = colorForSwatch(EYE_COLOR_OPTIONS, eyeColor) ?? '#5C4033'
  const transition = reduceMotion ? { duration: 0 } : COLOR_SPRING
  const s = SIZE[size]

  return (
    <div className={cn('relative', className)}>
      <motion.div
        className={cn(
          'relative mx-auto rounded-full',
          size === 'sm' || size === 'preview'
            ? 'shadow-none ring-1 ring-black/8 dark:ring-white/12'
            : 'shadow-[0_12px_40px_rgba(0,0,0,0.14)] ring-[3px] ring-background/80',
          s.face,
        )}
        animate={{
          background: `linear-gradient(165deg, ${skin} 0%, ${skin}dd 48%, color-mix(in srgb, ${skin} 68%, ${hair}) 100%)`,
        }}
        transition={transition}
      >
        <HairLayer hairStyle={hairStyle} hair={hair} reduceMotion={reduceMotion} />

        <div className={cn('absolute left-1/2 flex w-full -translate-x-1/2 justify-center', s.eyeTop, s.eyeGap)}>
          <motion.span
            className={cn('rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.25)]', s.eye)}
            animate={{ backgroundColor: eyes }}
            transition={transition}
          />
          <motion.span
            className={cn('rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.25)]', s.eye)}
            animate={{ backgroundColor: eyes }}
            transition={transition}
          />
        </div>

        <div
          aria-hidden
          className="absolute top-[54%] left-1/2 h-[5%] w-[8%] -translate-x-1/2 rounded-full bg-black/[0.06]"
        />
        <div
          aria-hidden
          className="absolute top-[64%] left-1/2 h-[3%] w-[14%] -translate-x-1/2 rounded-full bg-black/[0.05]"
        />

        <FacialHairLayer facialHair={facialHair} hair={hair} reduceMotion={reduceMotion} />
      </motion.div>

      {size === 'sm' || size === 'preview' ? null : (
        <div
          aria-hidden
          className={cn(
            'absolute left-1/2 -translate-x-1/2 rounded-b-[3rem] bg-linear-to-b from-transparent to-background/15',
            size === 'md' ? 'top-[72%] h-16 w-28 sm:h-20 sm:w-32' : 'top-[74%] h-20 w-36',
          )}
        />
      )}
    </div>
  )
}
