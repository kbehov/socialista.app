'use client'

import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { cn } from '@/lib/utils'
import { Check, Send, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import type { ReactNode } from 'react'

import {
  landingWorkflowInsetCard,
} from './landing-classes'
import { LANDING_WORKFLOW_MOCKUP } from './media'

const MOCKUP_IMAGE_QUALITY = 80

function MockupFrame({
  children,
  className,
  minHeight = 'min-h-[17rem] sm:min-h-[19rem] lg:min-h-[20rem]',
}: {
  children: ReactNode
  className?: string
  minHeight?: string
}) {
  return (
    <div className={cn('flex size-full flex-col', minHeight, className)}>{children}</div>
  )
}

function MockupThumb({
  src,
  className,
  sizes = '80px',
  objectPosition,
  dark = false,
}: {
  src: string
  className?: string
  sizes?: string
  objectPosition?: string
  dark?: boolean
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden outline outline-1',
        dark
          ? 'bg-[#141414] outline-[oklch(1_0_0/0.1)]'
          : 'bg-[color-mix(in_srgb,var(--landing-stone)_35%,white)] outline-[oklch(0_0_0/0.08)]',
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        fill
        quality={MOCKUP_IMAGE_QUALITY}
        sizes={sizes}
        className="object-cover"
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  )
}

const PUBLISH_CHANNELS = [
  { provider: 'instagram' as const, label: 'Instagram', on: true },
  { provider: 'tiktok' as const, label: 'TikTok', on: true },
  { provider: 'linkedin' as const, label: 'LinkedIn', on: true },
  { provider: 'threads' as const, label: 'Threads', on: false },
]

export function WorkflowPublishMockup() {
  const { queue } = LANDING_WORKFLOW_MOCKUP.scheduling

  return (
    <MockupFrame className="justify-between p-5 sm:p-6">
      <div className={cn(landingWorkflowInsetCard, 'p-3.5 sm:p-4')}>
        <div className="flex gap-3.5">
          <MockupThumb
            src={queue.src}
            className="size-[4.25rem] shrink-0 rounded-[0.75rem] sm:size-[4.75rem]"
            sizes="96px"
            objectPosition={queue.objectPosition}
          />
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-[var(--landing-muted)]">
              Ready to publish
            </p>
            <p className="mt-1.5 text-[0.9375rem] font-semibold leading-snug tracking-[-0.025em] text-[var(--landing-ink)]">
              Glow serum launch · Reel
            </p>
            <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-5 text-[var(--landing-muted)]">
              Morning routine, real skin—no filters. Tap to shop the drop.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 sm:mt-5">
        {PUBLISH_CHANNELS.map(channel => (
          <div
            key={channel.provider}
            className={cn(
              landingWorkflowInsetCard,
              'flex items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3',
              channel.on && 'border-[color-mix(in_srgb,var(--landing-ink)_14%,transparent)]',
            )}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <SocialPlatformIcon provider={channel.provider} className="size-4 shrink-0" />
              <span className="truncate text-[0.8125rem] font-medium tracking-[-0.02em] text-[var(--landing-ink)]">
                {channel.label}
              </span>
            </div>
            <span
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-full border',
                channel.on
                  ? 'border-[var(--landing-ink)] bg-[var(--landing-ink)] text-white'
                  : 'border-[color-mix(in_srgb,var(--landing-ink)_12%,transparent)] bg-transparent text-transparent',
              )}
              aria-hidden="true"
            >
              {channel.on ? <Check className="size-3" strokeWidth={2.5} /> : null}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 sm:mt-5">
        <p className="text-[0.75rem] text-[var(--landing-muted)]">
          <span className="font-medium tabular-nums text-[var(--landing-ink)]">3</span> channels selected
        </p>
        <span className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium tracking-[-0.01em] text-[var(--landing-ink)]">
          <Send className="size-3.5 opacity-70" strokeWidth={2} aria-hidden="true" />
          Posts in one click
        </span>
      </div>
    </MockupFrame>
  )
}

export function WorkflowAnalyticsMockup() {
  return (
    <MockupFrame className="justify-between p-5 sm:p-6">
      <div className="px-0.5 pt-0.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.6875rem] font-medium text-[var(--landing-muted)]">Reach</p>
            <p className="mt-1 text-[clamp(1.75rem,4vw,2.35rem)] font-semibold tabular-nums tracking-[-0.04em] text-[var(--landing-ink)]">
              284K
            </p>
          </div>
          <span
            className={cn(
              landingWorkflowInsetCard,
              'inline-flex items-center gap-1 px-2.5 py-1 text-[0.6875rem] font-medium text-[var(--landing-ink)]',
            )}
          >
            <TrendingUp className="size-3 text-[var(--accent-orange)]" strokeWidth={2} aria-hidden="true" />
            +12.4%
          </span>
        </div>
        <p className="mt-2 text-[0.6875rem] text-[var(--landing-muted)]">vs. prior 7 days · Sample data</p>
      </div>

      <div className="relative h-[5.75rem] w-full sm:h-[6.5rem]">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 top-2 flex flex-col justify-between"
          aria-hidden="true"
        >
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="h-px w-full bg-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)]"
            />
          ))}
        </div>
        <svg
          className="relative size-full text-[var(--accent-orange)]"
          viewBox="0 0 320 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 58 C40 52, 80 62, 120 44 S200 28, 260 38 S300 32, 320 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
          />
          <circle cx="320" cy="24" r="3" fill="white" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {[
          { label: 'Engagement', value: '4.8%' },
          { label: 'Saves', value: '12.1K' },
          { label: 'Top post', value: 'Reel' },
        ].map(stat => (
          <div key={stat.label} className={cn(landingWorkflowInsetCard, 'px-2.5 py-2.5 sm:px-3 sm:py-3')}>
            <p className="text-[0.625rem] font-medium text-[var(--landing-muted)]">{stat.label}</p>
            <p className="mt-1 text-[0.8125rem] font-semibold tabular-nums tracking-[-0.02em] text-[var(--landing-ink)]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </MockupFrame>
  )
}
