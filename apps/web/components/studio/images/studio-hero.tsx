import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export type StudioHeroProps = {
  imageSrc?: string
  chipLabel?: string
  title?: string
  description?: string
  imagePosition?: string
  /** Stronger scrim + text shadow when the hero photo is bright or busy. */
  overlayVariant?: 'default' | 'strong'
  /** Soft-focus the photo so type stays readable over busy imagery. */
  blurBackground?: boolean
  actions?: ReactNode
}

const DEFAULT_HERO = {
  imageSrc: '/socialista-image.webp',
  chipLabel: 'Image studio',
  title: 'Creatives\nin seconds.',
  description: 'Prompt the scene. Generate a set. Scale the ones that work.',
  imagePosition: 'object-[52%_38%]',
} as const

export function StudioHero({
  imageSrc = DEFAULT_HERO.imageSrc,
  chipLabel = DEFAULT_HERO.chipLabel,
  title = DEFAULT_HERO.title,
  description = DEFAULT_HERO.description,
  imagePosition = DEFAULT_HERO.imagePosition,
  overlayVariant = 'default',
  blurBackground = false,
  actions,
}: StudioHeroProps = {}) {
  const isStrong = overlayVariant === 'strong'

  return (
    <header className="studio-hero px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8">
      <div className="relative isolate min-h-[24rem] overflow-hidden rounded-[1.25rem] sm:min-h-[26rem] sm:rounded-[1.5rem] lg:min-h-[28rem]">
        {actions ? (
          <div className="absolute top-3 right-3 z-20 sm:top-4 sm:right-4">{actions}</div>
        ) : null}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Image
            src={imageSrc}
            alt=""
            fill
            priority
            quality={90}
            sizes="(max-width: 768px) 100vw, calc(100vw - 16rem)"
            className={cn(
              'select-none object-cover',
              imagePosition,
              blurBackground && 'scale-[1.08] blur-[8px]',
            )}
          />
          <div
            className={cn(
              'absolute inset-0 bg-linear-to-b to-transparent to-64%',
              isStrong ? 'from-black/68 via-black/38' : 'from-black/52 via-black/22',
            )}
          />
          <div
            className={cn(
              'absolute inset-0',
              isStrong
                ? 'bg-[radial-gradient(ellipse_at_50%_26%,transparent_8%,rgba(0,0,0,0.48)_100%)]'
                : 'bg-[radial-gradient(ellipse_at_50%_30%,transparent_18%,rgba(0,0,0,0.3)_100%)]',
            )}
          />
          <div className="absolute inset-x-0 bottom-0 h-[52%] bg-linear-to-b from-transparent via-background/32 to-background" />
        </div>

        <div className="relative flex min-h-[24rem] flex-col items-center justify-center px-5 pb-24 pt-12 text-center sm:min-h-[26rem] sm:px-8 sm:pb-28 sm:pt-14 lg:min-h-[28rem] lg:pb-28 lg:pt-16">
          <div className="mx-auto flex max-w-[22.5rem] flex-col items-center sm:max-w-lg">
            <div className="studio-hero-chip inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/28 px-2.5 py-1 backdrop-blur-md backdrop-saturate-150">
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-white/85 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              />
              <span
                className={cn(
                  'text-[12px] font-medium tracking-[-0.012em]',
                  isStrong
                    ? 'text-white/92 [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]'
                    : 'text-white/84',
                )}
              >
                {chipLabel}
              </span>
            </div>

            <h1
              className={cn(
                'mt-5 whitespace-pre-line font-sans text-[clamp(2.6rem,6.4vw,3.85rem)] font-semibold leading-[0.96] tracking-[-0.048em] text-white sm:mt-6',
                isStrong
                  ? '[text-shadow:0_1px_2px_rgba(0,0,0,0.52),0_12px_40px_rgba(0,0,0,0.42),0_28px_64px_rgba(0,0,0,0.28)]'
                  : '[text-shadow:0_1px_2px_rgba(0,0,0,0.34),0_16px_48px_rgba(0,0,0,0.24)]',
              )}
            >
              {title}
            </h1>

            <p
              className={cn(
                'mt-4 max-w-[21rem] text-[15px] font-normal leading-[1.5] tracking-[0.008em] sm:mt-5 sm:max-w-[23rem]',
                isStrong
                  ? 'text-white/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.48),0_10px_28px_rgba(0,0,0,0.34)]'
                  : 'text-white/76 [text-shadow:0_1px_14px_rgba(0,0,0,0.3)]',
              )}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
