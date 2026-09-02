'use client'

import {
  DitherImage,
  DitherImageContent,
  DitherImageFrame,
  DitherImageOverlay,
  DitherImageReveal,
} from '@/components/dither'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

const HERO_SIZES = '(max-width: 768px) 100vw, 1024px'

export type StudioDitherHeroProps = {
  src: string
  chipLabel: string
  title: string
  titleAccent: string
  description: string
  imagePosition?: string
  actions?: ReactNode
}

export function StudioDitherHero({
  src,
  chipLabel,
  title,
  titleAccent,
  description,
  imagePosition = 'object-[50%_30%]',
  actions,
}: StudioDitherHeroProps) {
  return (
    <header className="studio-hero px-4 pt-3 sm:px-6 lg:px-8">
      <DitherImage className="mx-auto flex w-full max-w-5xl">
        <DitherImageReveal className="w-full min-h-[11rem] overflow-hidden rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22)] ring-1 ring-black/10 sm:min-h-[12.25rem] lg:min-h-[13rem] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] dark:ring-white/12">
          <div className="absolute inset-0">
            <DitherImageFrame
              invertOnDark
              size="md"
              rounded={false}
              grayscale={0.08}
              contrast={14}
              brightness={1.04}
              opacity={0.52}
              className="h-full w-full"
            >
              <DitherImageContent
                src={src}
                alt=""
                fill
                priority
                quality={88}
                sizes={HERO_SIZES}
                className={cn('select-none object-cover', imagePosition)}
              />
            </DitherImageFrame>
          </div>

          <DitherImageOverlay
            src={src}
            alt=""
            fill
            priority
            quality={88}
            sizes={HERO_SIZES}
            direction="tl-br"
            from={0}
            to={72}
            className={imagePosition}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(135deg,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.18)_38%,transparent_66%)]"
          />

          {actions ? (
            <div className="absolute top-3 right-3 z-20 sm:top-4 sm:right-4">{actions}</div>
          ) : null}

          <div className="relative z-10 flex min-h-[11rem] flex-col justify-start px-5 pt-5 pb-14 sm:min-h-[12.25rem] sm:px-7 sm:pt-6 sm:pb-16 lg:min-h-[13rem] lg:px-8">
            <p className="text-[12px] font-medium tracking-[-0.015em] text-white/64">{chipLabel}</p>
            <h1 className="mt-1.5 max-w-[16rem] text-[clamp(1.75rem,4.5vw,2.5rem)] font-medium leading-[1.05] tracking-[-0.035em] text-white sm:max-w-none">
              {title} <span className="text-white/58">{titleAccent}</span>
            </h1>
            <p className="mt-2 max-w-[18rem] text-[14px] leading-[1.5] tracking-[-0.01em] text-white/72 sm:max-w-sm">
              {description}
            </p>
          </div>
        </DitherImageReveal>
      </DitherImage>
    </header>
  )
}
