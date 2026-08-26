import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export type StudioHeroProps = {
  imageSrc?: string
  chipLabel?: string
  title?: string
  description?: string
  imagePosition?: string
  /** @deprecated Scrim strength is now unified for readability. */
  overlayVariant?: 'default' | 'strong'
  /** @deprecated Background blur is no longer applied — scrim handles legibility. */
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

function parseTitle(title: string) {
  const newlineIndex = title.indexOf('\n')
  if (newlineIndex === -1) {
    return { primary: title, secondary: null }
  }

  return {
    primary: title.slice(0, newlineIndex),
    secondary: title.slice(newlineIndex + 1),
  }
}

export function StudioHero({
  imageSrc = DEFAULT_HERO.imageSrc,
  chipLabel = DEFAULT_HERO.chipLabel,
  title = DEFAULT_HERO.title,
  description = DEFAULT_HERO.description,
  imagePosition = DEFAULT_HERO.imagePosition,
  actions,
}: StudioHeroProps = {}) {
  const { primary, secondary } = parseTitle(title)

  return (
    <header className="studio-hero px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl ring-1 ring-black/10 dark:ring-white/12">
        <div className="relative min-h-[11rem] sm:min-h-[12.5rem] lg:min-h-[13.5rem]">
          {actions ? (
            <div className="absolute top-3 right-3 z-20 sm:top-4 sm:right-4">{actions}</div>
          ) : null}

          <div aria-hidden className="pointer-events-none absolute inset-0">
            <Image
              src={imageSrc}
              alt=""
              fill
              priority
              quality={88}
              sizes="(max-width: 768px) 100vw, 1024px"
              className={cn('select-none object-cover', imagePosition)}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/78 via-black/32 to-black/8" />
            <div className="absolute inset-0 bg-linear-to-r from-black/55 via-black/15 to-transparent sm:from-black/45" />
          </div>

          <div className="relative flex min-h-[11rem] flex-col justify-end px-5 pb-5 pt-10 text-left sm:min-h-[12.5rem] sm:px-7 sm:pb-6 sm:pt-12 lg:min-h-[13.5rem] lg:px-8">
            <p className="text-[12px] font-medium tracking-[-0.015em] text-white/64">{chipLabel}</p>
            <h1 className="mt-1.5 max-w-[16rem] text-[clamp(1.75rem,4.5vw,2.5rem)] font-medium leading-[1.05] tracking-[-0.035em] text-white sm:max-w-none">
              <span>{primary}</span>
              {secondary ? <span className="text-white/58"> {secondary}</span> : null}
            </h1>
            <p className="mt-2 max-w-[18rem] text-[14px] leading-[1.5] tracking-[-0.01em] text-white/72 sm:max-w-sm">
              {description}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
