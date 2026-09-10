'use client'

import {
  DitherImage,
  DitherImageContent,
  DitherImageFrame,
  DitherImageOverlay,
  DitherImageReveal,
} from '@/components/dither'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '@/components/ui/carousel'
import { PresetCard } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { STUDIO_PROMPT_COMPOSER_MAX_WIDTH_CLASS } from '@/components/studio/prompt/studio-composer-surface'
import { ChevronRightIcon } from 'lucide-react'
import type { ReactNode } from 'react'

const HERO_SIZES = '(max-width: 768px) 100vw, 1024px'

export type StudioHomeHeroGradient = 'image' | 'video' | 'slideshow'

export type StudioHomeFeatureCard = {
  id: string
  title: string
  description: string
  prompt: string
  image?: string
  imagePosition?: string
  /** CSS gradient classes when no image is provided */
  previewClassName?: string
}

export type StudioHomeHeroProps = {
  title: string
  gradient: StudioHomeHeroGradient
  backgroundSrc: string
  backgroundPosition?: string
  featureCards: StudioHomeFeatureCard[]
  onFeatureSelect: (card: StudioHomeFeatureCard) => void
  headerActions?: ReactNode
  children: ReactNode
}

const GRADIENT_CLASS: Record<StudioHomeHeroGradient, string> = {
  image: 'studio-home-hero-gradient-image',
  video: 'studio-home-hero-gradient-video',
  slideshow: 'studio-home-hero-gradient-slideshow',
}

function FeatureCarouselNav() {
  const { canScrollNext, scrollNext } = useCarousel()

  if (!canScrollNext) return null

  return (
    <button
      type="button"
      aria-label="Scroll templates right"
      onClick={scrollNext}
      className={cn(
        'absolute top-[calc(50%-1.75rem)] right-0 z-20 -translate-y-1/2',
        'inline-flex size-9 items-center justify-center rounded-full',
        'border border-black/[0.08] bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.12)]',
        'text-black/56 transition-[background-color,transform,box-shadow] duration-150',
        'hover:bg-white hover:text-foreground hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.16)]',
        'active:scale-[0.97] motion-reduce:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
        'dark:border-white/12 dark:bg-[var(--surface-1)] dark:text-white/56',
        'dark:hover:text-foreground',
      )}
    >
      <ChevronRightIcon className="size-4" strokeWidth={1.75} />
    </button>
  )
}

function StudioHomeHeroBackground({
  src,
  imagePosition = 'object-[50%_30%]',
}: {
  src: string
  imagePosition?: string
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <DitherImage className="h-full w-full">
        <DitherImageReveal className="h-full w-full overflow-hidden">
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
        </DitherImageReveal>
      </DitherImage>
    </div>
  )
}

export function StudioHomeHero({
  title,
  gradient,
  backgroundSrc,
  backgroundPosition = 'object-[50%_30%]',
  featureCards,
  onFeatureSelect,
  headerActions,
  children,
}: StudioHomeHeroProps) {
  return (
    <header className="studio-home-hero studio-hero px-4 pt-4 pb-6 sm:px-6 sm:pt-5 sm:pb-8 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-[26px] font-semibold leading-none tracking-[-0.03em] text-foreground sm:text-[28px]">
            {title}
          </h1>
          {headerActions ? (
            <div className="flex shrink-0 items-center gap-2">{headerActions}</div>
          ) : null}
        </div>

        <div className="studio-home-hero-banner relative min-h-[12rem] overflow-hidden rounded-[1.5rem] ring-1 ring-black/10 dark:ring-white/12 sm:min-h-[13rem]">
          <StudioHomeHeroBackground src={backgroundSrc} imagePosition={backgroundPosition} />

          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-0 z-[1]',
              GRADIENT_CLASS[gradient],
              'opacity-72 mix-blend-multiply dark:opacity-55 dark:mix-blend-soft-light',
            )}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_40%,rgba(0,0,0,0.06)_100%)]"
          />
          <div aria-hidden className="studio-home-hero-noise pointer-events-none absolute inset-0 z-[3]" />

          <div className="relative z-10 flex items-center justify-center px-4 py-7 sm:px-6 sm:py-9">
            <div className={cn('w-full', STUDIO_PROMPT_COMPOSER_MAX_WIDTH_CLASS)}>{children}</div>
          </div>
        </div>

        {featureCards.length > 0 ? (
          <div className="relative mt-6 sm:mt-7">
            <Carousel
              className="w-full min-w-0"
              opts={{
                align: 'start',
                dragFree: true,
                containScroll: 'trimSnaps',
              }}
            >
              <div className="relative w-full min-w-0 pr-10 sm:pr-12">
                <CarouselContent className="-ml-2.5 ml-0" aria-label="Presets">
                  {featureCards.map(card => (
                    <CarouselItem key={card.id} className="basis-auto pl-2.5">
                      <PresetCard
                        title={card.title}
                        description={card.description}
                        image={card.image}
                        imagePosition={card.imagePosition}
                        previewClassName={card.previewClassName}
                        onSelect={() => onFeatureSelect(card)}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <FeatureCarouselNav />
              </div>
            </Carousel>
          </div>
        ) : null}
      </div>
    </header>
  )
}
