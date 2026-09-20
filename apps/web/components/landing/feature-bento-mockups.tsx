'use client'

import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { Brain, Captions, Sparkles, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState, type ReactNode } from 'react'

import type { FeatureBentoId } from './content'
import { landingGlass, landingGlassBadge } from './landing-classes'
import { LazyAutoplayVideo } from './lazy-autoplay-video'
import {
  FEATURE_BENTO_MOCKUP,
  FEATURE_BENTO_SLIDESHOW_STACK,
} from './media'

const MOCKUP_IMAGE_QUALITY = 90

const glassSubtle =
  'border border-white/12 bg-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-md'

const panelWash =
  'pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/[0.12] to-black/25'

const ambientTop =
  'pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_50%_0%,rgba(255,255,255,0.07),transparent_55%)]'

const ambientAccent =
  'pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_88%_12%,color-mix(in_oklch,var(--landing-orange)_22%,transparent),transparent_62%)]'

function MockupThumb({
  src,
  alt = '',
  className,
  sizes = '80px',
  objectPosition,
}: {
  src: string
  alt?: string
  className?: string
  sizes?: string
  objectPosition?: string
}) {
  return (
    <div className={cn('relative overflow-hidden bg-[#121212]', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        quality={MOCKUP_IMAGE_QUALITY}
        sizes={sizes}
        className="object-cover"
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  )
}

function MockupCanvas({
  children,
  className,
  wash = true,
  accent = false,
}: {
  children: ReactNode
  className?: string
  wash?: boolean
  accent?: boolean
}) {
  return (
    <div className={cn('relative flex size-full min-h-0 flex-col overflow-hidden', className)}>
      <div className={ambientTop} aria-hidden="true" />
      {accent ? <div className={ambientAccent} aria-hidden="true" /> : null}
      {wash ? <div className={panelWash} aria-hidden="true" /> : null}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}

function SchedulingMockup() {
  const { calendarThumbs, queue } = FEATURE_BENTO_MOCKUP.scheduling
  const days = ['M', 'T', 'W', 'T', 'F']
  const activeDay = 2
  const thumbDays = new Set([1, 2, 4])

  return (
    <MockupCanvas accent className="justify-end p-4 sm:p-5">
      <div className="flex flex-1 flex-col justify-center px-0.5">
        <p className="mb-3 text-[0.625rem] font-medium uppercase tracking-[0.08em] text-white/35">
          This week
        </p>
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
          {days.map((day, index) => {
            const active = index === activeDay
            const thumbSrc = thumbDays.has(index) ? calendarThumbs[index % calendarThumbs.length] : null
            return (
              <div key={`${day}-${index}`} className="flex flex-col items-center gap-2">
                <span
                  className={cn(
                    'text-[0.625rem] font-medium tabular-nums',
                    active ? 'text-white/70' : 'text-white/30',
                  )}
                >
                  {day}
                </span>
                <div
                  className={cn(
                    'relative flex h-[4.25rem] w-full flex-col justify-end overflow-hidden rounded-[0.85rem] border border-white/[0.07] bg-white/[0.03] p-1 sm:h-[4.75rem]',
                    active &&
                      'border-[color-mix(in_oklch,var(--landing-orange)_35%,white)] bg-white/[0.08] shadow-[0_0_0_1px_color-mix(in_oklch,var(--landing-orange)_25%,transparent),inset_0_1px_0_0_rgba(255,255,255,0.12)]',
                  )}
                >
                  {active ? (
                    <span
                      className="absolute left-1/2 top-1.5 size-1 -translate-x-1/2 rounded-full bg-[var(--landing-orange)]"
                      aria-hidden="true"
                    />
                  ) : null}
                  {thumbSrc ? (
                    <MockupThumb
                      src={thumbSrc}
                      className={cn(
                        'h-[1.85rem] w-full rounded-[0.4rem] ring-1 ring-white/10 sm:h-8',
                        !active && 'opacity-50 saturate-[0.85]',
                      )}
                      sizes="64px"
                    />
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className={cn('flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3 sm:px-4 sm:py-3.5', landingGlass)}>
        <div className="flex min-w-0 items-center gap-2.5">
          <MockupThumb
            src={queue.src}
            className="size-10 shrink-0 rounded-[0.65rem] ring-1 ring-white/15"
            sizes="80px"
            objectPosition={queue.objectPosition}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <SocialPlatformIcon provider="instagram" className="size-3.5 shrink-0 opacity-90" />
              <p className="truncate text-[0.8125rem] font-medium tracking-[-0.02em] text-white">
                Glow serum · Reel
              </p>
            </div>
            <p className="text-[0.6875rem] text-white/48">Wed · 9:00 AM</p>
          </div>
        </div>
        <span
          className={cn(
            landingGlassBadge,
            'shrink-0 rounded-full px-2.5 py-1 text-[0.625rem] text-[color-mix(in_oklch,var(--landing-orange)_75%,white)]',
          )}
        >
          Scheduled
        </span>
      </div>
    </MockupCanvas>
  )
}

function AnalyticsMockup() {
  return (
    <MockupCanvas accent className="justify-between p-4 sm:p-5">
      <div className="px-0.5 pt-0.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.6875rem] font-medium text-white/42">Reach</p>
            <p className="mt-1 text-[clamp(1.75rem,4vw,2.35rem)] font-semibold tabular-nums tracking-[-0.04em] text-white">
              284K
            </p>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.6875rem] font-medium text-white/88',
              glassSubtle,
            )}
          >
            <TrendingUp className="size-3 text-[var(--landing-orange)]" strokeWidth={2} aria-hidden="true" />
            +12.4%
          </span>
        </div>
        <p className="mt-2 text-[0.6875rem] text-white/38">vs. prior 7 days</p>
      </div>

      <div className="relative h-[5.75rem] w-full sm:h-[6.5rem]">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 top-2 flex flex-col justify-between"
          aria-hidden="true"
        >
          {[0, 1, 2].map(i => (
            <div key={i} className="h-px w-full bg-white/[0.06]" />
          ))}
        </div>
        <svg
          className="relative size-full text-[var(--landing-orange)]"
          viewBox="0 0 320 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="features-analytics-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.42" />
              <stop offset="72%" stopColor="currentColor" stopOpacity="0.08" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
            <filter id="features-analytics-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M0 58 C40 52, 80 62, 120 44 S200 28, 260 38 S300 32, 320 24 L320 80 L0 80 Z"
            fill="url(#features-analytics-fill)"
          />
          <path
            d="M0 58 C40 52, 80 62, 120 44 S200 28, 260 38 S300 32, 320 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            filter="url(#features-analytics-glow)"
            opacity="0.95"
          />
          <circle cx="320" cy="24" r="3.5" fill="var(--landing-canvas)" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    </MockupCanvas>
  )
}

function VideoEditorMockup() {
  const { video, poster, objectPosition } = FEATURE_BENTO_MOCKUP.videoEditor

  return (
    <MockupCanvas wash={false} className="bg-[#050505]">
      <LazyAutoplayVideo src={video} poster={poster} objectPosition={objectPosition} />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-black/15 to-black/30"
        aria-hidden="true"
      />
      <div className="relative z-10 mt-auto p-4 sm:p-5">
        <div className={cn('rounded-2xl p-3.5', landingGlass)}>
          <div className="relative flex gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full',
                  i === 1 ? 'bg-[var(--landing-orange)]' : 'bg-white/16',
                )}
              />
            ))}
            <span
              className="absolute left-[38%] top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#0c0c0c] bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.35)]"
              aria-hidden="true"
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[0.6875rem] font-medium text-white/55">
            <span className="flex items-center gap-1.5 text-white/82">
              <Captions className="size-3.5" strokeWidth={2} />
              Captions
            </span>
            <span className="tabular-nums text-white/45">0:04 / 0:18</span>
          </div>
        </div>
      </div>
    </MockupCanvas>
  )
}

function SlideshowBentoSlide({
  src,
  className,
  priority,
}: {
  src: string
  className?: string
  priority?: boolean
}) {
  return (
    <article
      className={cn(
        'relative aspect-[9/16] w-[6.25rem] overflow-hidden rounded-[1.1rem] bg-[#121212] shadow-[0_24px_52px_-28px_rgb(0_0_0/0.68),0_0_0_1px_rgb(255_255_255/0.11)] sm:w-[7.25rem] sm:rounded-[1.2rem]',
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        priority={priority}
        className="object-cover object-center"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent via-45% to-black/30"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10"
        aria-hidden="true"
      />
    </article>
  )
}

function SlideshowMockup() {
  const stack = FEATURE_BENTO_SLIDESHOW_STACK

  return (
    <MockupCanvas wash={false} accent className="justify-center bg-[#080808] p-4 sm:p-5">
      <div className="relative mx-auto h-[14.25rem] w-full max-w-[18.5rem] sm:h-[15.5rem] sm:max-w-[20rem]">
        <SlideshowBentoSlide
          src={stack.left}
          className="absolute left-[2%] top-[14%] z-0 origin-bottom -rotate-[8deg] scale-[0.9] opacity-72 sm:left-[4%]"
        />
        <SlideshowBentoSlide
          src={stack.right}
          className="absolute right-[2%] top-[14%] z-0 origin-bottom rotate-[8deg] scale-[0.9] opacity-72 sm:right-[4%]"
        />
        <SlideshowBentoSlide
          src={stack.center}
          priority
          className="absolute left-1/2 top-[1%] z-10 w-[7.85rem] -translate-x-1/2 shadow-[0_36px_72px_-34px_rgb(0_0_0/0.78),0_0_0_1px_rgb(255_255_255/0.18)] sm:w-[8.65rem]"
        />
      </div>

      <div className="flex justify-center pt-2.5 sm:pt-3">
        <div className={cn('inline-flex items-center gap-2 rounded-full px-3.5 py-1.5', glassSubtle)}>
          {[0, 1, 2, 3, 4].map(i => (
            <span
              key={i}
              className={cn(
                'h-1 rounded-full bg-white/22 transition-[width,background-color]',
                i === 1 ? 'w-4 bg-[var(--landing-orange)]' : 'w-1',
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </MockupCanvas>
  )
}

function ImageGenerationMockup() {
  const { autoplayMs, slides, prompt } = FEATURE_BENTO_MOCKUP.imageGeneration
  const [api, setApi] = useState<CarouselApi>()
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    if (!api) return

    const onSelect = () => setSlideIndex(api.selectedScrollSnap())
    onSelect()
    api.on('select', onSelect)

    const timer = window.setInterval(() => {
      api.scrollNext()
    }, autoplayMs)

    return () => {
      window.clearInterval(timer)
      api.off('select', onSelect)
    }
  }, [api, autoplayMs])

  return (
    <MockupCanvas wash={false} accent className="bg-[#050505]">
      <Carousel
        setApi={setApi}
        draggable={false}
        opts={{ loop: true }}
        className="absolute inset-0 z-0 size-full"
      >
        <CarouselContent className="ml-0 h-full min-h-full">
          {slides.map(src => (
            <CarouselItem key={src} className="h-full min-h-full pl-0">
              <div className="relative h-full min-h-full w-full">
                <Image
                  src={src}
                  alt=""
                  fill
                  quality={MOCKUP_IMAGE_QUALITY}
                  sizes="(max-width: 1024px) 50vw, 400px"
                  className="object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/75 via-black/20 to-black/35"
        aria-hidden="true"
      />
      <div className="relative z-10 mt-auto flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex justify-center gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1 rounded-full transition-[width,background-color] duration-200',
                i === slideIndex ? 'w-3 bg-white/90' : 'w-1 bg-white/25',
              )}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className={cn('rounded-2xl px-3.5 py-3', landingGlass)}>
          <p className="flex items-start gap-2 text-[0.75rem] leading-snug tracking-[-0.02em] text-white/78">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-[var(--landing-orange)]" strokeWidth={2} aria-hidden="true" />
            <span>{prompt}</span>
          </p>
        </div>
      </div>
    </MockupCanvas>
  )
}

function ShortVideosMockup() {
  const { video, poster, objectPosition, caption } = FEATURE_BENTO_MOCKUP.shortVideos

  return (
    <MockupCanvas wash={false} accent className="items-center justify-center bg-[#060606] p-4 sm:p-5">
      <div
        className="relative aspect-[9/16] h-full max-h-[92%] w-auto min-w-0 overflow-hidden rounded-[1.35rem] shadow-[0_32px_64px_-36px_rgb(0_0_0/0.85),0_0_0_1px_rgb(255_255_255/0.14)] ring-1 ring-white/10"
      >
        <LazyAutoplayVideo
          src={video}
          poster={poster}
          objectPosition={objectPosition}
          className="rounded-[1.35rem]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25"
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 z-10 p-3.5">
          <div className={cn('rounded-xl px-3 py-2.5', landingGlass)}>
            <p className="text-center text-[0.75rem] font-medium leading-snug tracking-[-0.02em] text-white">
              {caption}
            </p>
          </div>
        </div>
      </div>
    </MockupCanvas>
  )
}

function ContextPanelDivider({ className }: { className?: string }) {
  return <div className={cn('h-px bg-white/10', className)} aria-hidden="true" />
}

function ContextSkillsMockup() {
  const { brandThumb, brandSwatches } = FEATURE_BENTO_MOCKUP.contextSkills

  return (
    <MockupCanvas accent className="items-center justify-center p-4 sm:p-5 lg:p-6">
      <div className={cn('w-full max-w-[22rem] rounded-[1.15rem] p-4 sm:max-w-[24rem] sm:p-5 lg:max-w-none lg:p-5', landingGlass)}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.6875rem] font-medium tracking-[-0.01em] text-white/45">Workspace context</p>
          <span className={cn(landingGlassBadge, 'rounded-full px-2 py-0.5 text-[0.625rem]')}>
            Attached
          </span>
        </div>

        <div className="mt-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-start lg:gap-5">
          <div className="min-w-0">
            <p className="text-[0.625rem] font-medium uppercase tracking-[0.06em] text-white/35">Brand</p>
            <div className="mt-2.5 flex items-center gap-3">
              <MockupThumb
                src={brandThumb}
                className="size-11 shrink-0 rounded-xl ring-1 ring-white/15"
                sizes="88px"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.9375rem] font-medium tracking-[-0.02em] text-white">SoBeauty</p>
                <p className="mt-0.5 text-[0.6875rem] text-white/48">Clean, radiant, confident</p>
              </div>
              <div className="flex shrink-0 items-center gap-1" aria-hidden="true">
                {brandSwatches.map(color => (
                  <span
                    key={color}
                    className="size-3 rounded-full ring-1 ring-white/18"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <ContextPanelDivider className="my-4 lg:hidden" />

            <p className="text-[0.625rem] font-medium uppercase tracking-[0.06em] text-white/35">Product</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className={cn('rounded-xl px-2.5 py-1 text-[0.6875rem] font-medium text-white/88', glassSubtle)}>
                Vitamin C serum
              </span>
              <span
                className="rounded-xl border border-dashed border-white/14 px-2.5 py-1 text-[0.6875rem] font-medium text-white/32"
              >
                + Add
              </span>
            </div>
          </div>

          <div className="my-4 hidden w-px self-stretch bg-white/10 lg:my-0 lg:block" aria-hidden="true" />
          <ContextPanelDivider className="my-4 lg:hidden" />

          <div className="relative min-w-0">
            <p className="text-[0.625rem] font-medium uppercase tracking-[0.06em] text-white/35">Skill</p>
            <div
              className={cn(
                'relative mt-2.5 rounded-xl p-3 ring-1 ring-[color-mix(in_oklch,var(--landing-orange)_28%,white)]',
                glassSubtle,
              )}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/[0.08]"
                  aria-hidden="true"
                >
                  <Brain className="size-3.5 text-white/78" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.8125rem] font-medium tracking-[-0.02em] text-white">Clean beauty UGC</p>
                  <p className="mt-1 text-[0.6875rem] leading-relaxed text-white/52">
                    Show texture on skin; soft light, no medical claims.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ContextPanelDivider className="mt-5" />

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.625rem] font-medium text-white/36">
          <Sparkles className="size-3 shrink-0 text-[var(--landing-orange)]" strokeWidth={2} aria-hidden="true" />
          Included in every generation
        </p>
      </div>
    </MockupCanvas>
  )
}

const MOCKUPS: Record<FeatureBentoId, () => ReactNode> = {
  scheduling: SchedulingMockup,
  analytics: AnalyticsMockup,
  'video-editor': VideoEditorMockup,
  'slideshow-editor': SlideshowMockup,
  'image-generation': ImageGenerationMockup,
  'short-videos': ShortVideosMockup,
  'context-skills': ContextSkillsMockup,
}

export function FeatureBentoMockup({ id }: { id: FeatureBentoId }) {
  const Mockup = MOCKUPS[id]
  return <Mockup />
}
