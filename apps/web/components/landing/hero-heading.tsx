'use client'

import { SparklesText } from '@/components/ui/sparkles-text'

import { HERO } from './content'

const HERO_SPARKLE_COLORS = {
  first: 'oklch(0.68 0.16 285)',
  second: 'oklch(0.72 0.14 330)',
} as const

const LINE_1_CLASS =
  'text-[clamp(2rem,4.5vw,2.875rem)] font-normal leading-[1.12] tracking-[-0.028em]'
const LINE_2_CLASS =
  'text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.044em]'

export function HeroHeading() {
  const { line1, line2 } = HERO.title

  return (
    <h1 className="mx-auto max-w-[40rem] text-balance text-center">
      <span className={`block text-muted-foreground ${LINE_1_CLASS}`}>
        {line1.prefix}{' '}
        <span className={`font-medium text-foreground ${LINE_1_CLASS} tracking-[-0.03em]`}>
          {line1.emphasis}
        </span>{' '}
        {line1.suffix}
      </span>

      <span className={`mt-3 block text-foreground sm:mt-4 ${LINE_2_CLASS}`}>
        {line2.prefix}{' '}
        <SparklesText
          className={`align-baseline ${LINE_2_CLASS}`}
          sparklesCount={6}
          colors={HERO_SPARKLE_COLORS}
        >
          {line2.sparkles}
        </SparklesText>
        .
      </span>
    </h1>
  )
}
