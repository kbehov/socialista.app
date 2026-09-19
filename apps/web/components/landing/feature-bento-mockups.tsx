'use client'

import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { Brain, Captions, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState, type ReactNode } from 'react'

import type { FeatureBentoId } from './content'
import {
  FEATURE_BENTO_MOCKUP,
  FEATURE_BENTO_SLIDESHOW_STACK,
} from './media'

const MOCKUP_IMAGE_QUALITY = 90

const glass =
  'border border-white/18 bg-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_12px_40px_-16px_rgba(0,0,0,0.55)] backdrop-blur-xl'

const glassSubtle =
  'border border-white/12 bg-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-md'

const panelWash =
  'pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/20'

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
}: {
  children: ReactNode
  className?: string
  wash?: boolean
}) {
  return (
    <div className={cn('relative flex size-full min-h-0 flex-col overflow-hidden', className)}>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_20%,rgba(255,255,255,0.06),transparent_55%)]"
        aria-hidden="true"
      />
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
    <MockupCanvas className="justify-end p-4 sm:p-5">
      <div className="flex flex-1 flex-col justify-center px-1">
        <div className="grid grid-cols-5 gap-2">
          {days.map((day, index) => {
            const active = index === activeDay
            const thumbSrc = thumbDays.has(index) ? calendarThumbs[index % calendarThumbs.length] : null
            return (
              <div key={`${day}-${index}`} className="flex flex-col items-center gap-2">
                <span className="text-[0.625rem] font-medium text-white/35">{day}</span>
                <div
                  className={cn(
                    'flex h-16 w-full flex-col justify-end overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 sm:h-[4.5rem]',
                    active && 'border-white/22 bg-white/[0.07] ring-1 ring-white/10',
                  )}
                >
                  {thumbSrc ? (
                    <MockupThumb
                      src={thumbSrc}
                      className={cn(
                        'h-7 w-full rounded-[0.45rem] ring-1 ring-white/10',
                        !active && 'opacity-55',
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

      <div className={`flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3 sm:px-4 sm:py-3.5 ${glass}`}>
        <div className="flex min-w-0 items-center gap-2.5">
          <MockupThumb
            src={queue.src}
            className="size-9 shrink-0 rounded-lg ring-1 ring-white/15"
            sizes="72px"
            objectPosition={queue.objectPosition}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <SocialPlatformIcon provider="instagram" className="size-3.5 shrink-0" />
              <p className="truncate text-[0.8125rem] font-medium tracking-[-0.02em] text-white">
                Glow serum · Reel
              </p>
            </div>
            <p className="text-[0.6875rem] text-white/50">Wed · 9:00 AM</p>
          </div>
        </div>
        <span className="shrink-0 text-[0.6875rem] font-medium text-white/55">Scheduled</span>
      </div>
    </MockupCanvas>
  )
}

function AnalyticsMockup() {
  return (
    <MockupCanvas className="justify-between p-4 sm:p-5">
      <div className="px-0.5 pt-1">
        <p className="text-[0.6875rem] font-medium text-white/45">Reach</p>
        <p className="mt-1 text-[clamp(1.75rem,4vw,2.25rem)] font-semibold tabular-nums tracking-[-0.04em] text-white">
          284K
        </p>
        <span
          className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[0.6875rem] font-medium text-white/85 ${glassSubtle}`}
        >
          +12.4% this week
        </span>
      </div>

      <div className="relative h-[5.5rem] w-full sm:h-[6.25rem]">
        <svg
          className="size-full text-[var(--landing-orange)]"
          viewBox="0 0 320 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="features-analytics-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 58 C40 52, 80 62, 120 44 S200 28, 260 38 S300 32, 320 24 L320 80 L0 80 Z"
            fill="url(#features-analytics-fill)"
          />
          <path
            d="M0 58 C40 52, 80 62, 120 44 S200 28, 260 38 S300 32, 320 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>
      </div>
    </MockupCanvas>
  )
}

function VideoEditorMockup() {
  const { video, poster, objectPosition } = FEATURE_BENTO_MOCKUP.videoEditor

  return (
    <MockupCanvas wash={false} className="bg-black">
      <video
        src={video}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
        style={{ objectPosition }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/25"
        aria-hidden="true"
      />
      <div className="relative z-10 mt-auto p-4 sm:p-5">
        <div className={`rounded-2xl p-3 ${glass}`}>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full',
                  i === 1 ? 'bg-[var(--landing-orange)]' : 'bg-white/18',
                )}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-[0.6875rem] font-medium text-white/55">
            <span className="flex items-center gap-1.5 text-white/75">
              <Captions className="size-3.5" strokeWidth={2} />
              Captions
            </span>
            <span className="tabular-nums">0:04</span>
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
        'relative aspect-[9/16] w-[6.25rem] overflow-hidden rounded-[1.05rem] bg-[#121212] shadow-[0_22px_48px_-26px_rgb(0_0_0/0.62),0_0_0_1px_rgb(255_255_255/0.12)] sm:w-[7.25rem] sm:rounded-[1.15rem]',
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
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent via-50% to-black/25"
        aria-hidden="true"
      />
    </article>
  )
}

function SlideshowMockup() {
  const stack = FEATURE_BENTO_SLIDESHOW_STACK

  return (
    <MockupCanvas wash={false} className="justify-center bg-[#0a0a0a] p-4 sm:p-5">
      <div className="relative mx-auto h-[14rem] w-full max-w-[18.5rem] sm:h-[15.25rem] sm:max-w-[20rem]">
        <SlideshowBentoSlide
          src={stack.left}
          className="absolute left-[3%] top-[12%] z-0 origin-bottom -rotate-[7deg] scale-[0.92] opacity-80 sm:left-[5%]"
        />
        <SlideshowBentoSlide
          src={stack.right}
          className="absolute right-[3%] top-[12%] z-0 origin-bottom rotate-[7deg] scale-[0.92] opacity-80 sm:right-[5%]"
        />
        <SlideshowBentoSlide
          src={stack.center}
          priority
          className="absolute left-1/2 top-[2%] z-10 w-[7.75rem] -translate-x-1/2 shadow-[0_32px_64px_-30px_rgb(0_0_0/0.72),0_0_0_1px_rgb(255_255_255/0.16)] sm:w-[8.5rem]"
        />
      </div>

      <div className="flex justify-center pt-2 sm:pt-2.5">
        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${glassSubtle}`}>
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className={cn(
                'h-1 rounded-full bg-white/25 transition-[width]',
                i === 1 ? 'w-3.5 bg-white/90' : 'w-1',
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

  useEffect(() => {
    if (!api) return

    const timer = window.setInterval(() => {
      api.scrollNext()
    }, autoplayMs)

    return () => window.clearInterval(timer)
  }, [api])

  return (
    <MockupCanvas wash={false} className="bg-black">
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
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-black/15 to-black/25"
        aria-hidden="true"
      />
      <div className="relative z-10 mt-auto p-4 sm:p-5">
        <div className={`rounded-2xl px-3.5 py-3 ${glass}`}>
          <p className="text-[0.75rem] leading-snug tracking-[-0.02em] text-white/75">{prompt}</p>
        </div>
      </div>
    </MockupCanvas>
  )
}

function ShortVideosMockup() {
  const { video, poster, objectPosition, caption } = FEATURE_BENTO_MOCKUP.shortVideos

  return (
    <MockupCanvas wash={false} className="bg-black">
      <video
        src={video}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
        style={{ objectPosition }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"
        aria-hidden="true"
      />
      <div className="relative z-10 mt-auto p-4 sm:p-5">
        <div className={`rounded-xl px-3 py-2.5 ${glass}`}>
          <p className="text-[0.75rem] font-medium tracking-[-0.02em] text-white">{caption}</p>
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
    <MockupCanvas className="items-center justify-center p-4 sm:p-5 lg:p-6">
      <div className={`w-full max-w-[22rem] rounded-2xl p-4 sm:max-w-[24rem] sm:p-5 lg:max-w-none lg:p-5 ${glass}`}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.6875rem] font-medium tracking-[-0.01em] text-white/45">Workspace context</p>
          <span
            className={`rounded-full px-2 py-0.5 text-[0.625rem] font-medium text-white/80 ${glassSubtle}`}
          >
            Attached
          </span>
        </div>

        <div className="mt-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-start lg:gap-5">
          <div className="min-w-0">
            <p className="text-[0.625rem] font-medium uppercase tracking-[0.06em] text-white/35">Brand</p>
            <div className="mt-2.5 flex items-center gap-3">
              <MockupThumb
                src={brandThumb}
                className="size-10 shrink-0 rounded-xl ring-1 ring-white/15"
                sizes="80px"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.9375rem] font-medium tracking-[-0.02em] text-white">SoBeauty</p>
                <p className="mt-0.5 text-[0.6875rem] text-white/50">Clean, radiant, confident</p>
              </div>
              <div className="flex shrink-0 items-center gap-1" aria-hidden="true">
                {brandSwatches.map(color => (
                  <span
                    key={color}
                    className="size-3 rounded-full ring-1 ring-white/15"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <ContextPanelDivider className="my-4 lg:hidden" />

            <p className="text-[0.625rem] font-medium uppercase tracking-[0.06em] text-white/35">Product</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className={`rounded-xl px-2.5 py-1 text-[0.6875rem] font-medium text-white/85 ${glassSubtle}`}>
                Vitamin C serum
              </span>
              <span
                className="rounded-xl border border-dashed border-white/12 px-2.5 py-1 text-[0.6875rem] font-medium text-white/30"
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
              className={`relative mt-2.5 rounded-xl p-3 ring-1 ring-white/28 ${glassSubtle}`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/[0.08]"
                  aria-hidden="true"
                >
                  <Brain className="size-3.5 text-white/75" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.8125rem] font-medium tracking-[-0.02em] text-white">Clean beauty UGC</p>
                  <p className="mt-1 text-[0.6875rem] leading-relaxed text-white/55">
                    Show texture on skin; soft light, no medical claims.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ContextPanelDivider className="mt-5" />

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.625rem] font-medium text-white/38">
          <Sparkles className="size-3 shrink-0 text-white/45" strokeWidth={2} aria-hidden="true" />
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
