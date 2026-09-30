'use client'

import { cn } from '@/lib/utils'
import { Brain, Sparkles } from 'lucide-react'
import Image from 'next/image'
import type { ReactNode } from 'react'

import type { FeatureBentoId } from './content'
import { landingGlass, landingGlassBadge } from './landing-classes'
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
  'slideshow-editor': SlideshowMockup,
  'context-skills': ContextSkillsMockup,
}

export function FeatureBentoMockup({ id }: { id: FeatureBentoId }) {
  const Mockup = MOCKUPS[id]
  return <Mockup />
}
