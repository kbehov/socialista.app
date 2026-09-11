'use client'

import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { AnimatedBeam } from '@/components/ui/animated-beam'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { forwardRef, useRef, type RefObject } from 'react'

import { PLATFORMS, PLATFORMS_BEAM, type PlatformId } from './content'
import { FadeIn } from './fade-in'
import { Section } from './section'
import { SectionHeader } from './section-header'

const platformById = Object.fromEntries(PLATFORMS.map(platform => [platform.id, platform])) as Record<
  PlatformId,
  (typeof PLATFORMS)[number]
>

type BeamSlot =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'mid-left'
  | 'mid-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

const PLATFORM_BEAM_COLORS: Record<PlatformId, { start: string; stop: string; path: string }> = {
  instagram: { start: '#f77737', stop: '#c13584', path: '#f0a8d0' },
  youtube: { start: '#ff4e45', stop: '#cc0000', path: '#ffb3b0' },
  facebook: { start: '#4da3ff', stop: '#1877f2', path: '#a8cfff' },
  tiktok: { start: '#25f4ee', stop: '#fe2c55', path: '#9ef0ec' },
  linkedin: { start: '#4ba3f5', stop: '#0a66c2', path: '#a8d4ff' },
  threads: { start: '#6b6b6b', stop: '#000000', path: '#c4c4c4' },
  pinterest: { start: '#ff6b6b', stop: '#e60023', path: '#ffb3b3' },
  twitter: { start: '#8b8b8b', stop: '#000000', path: '#c7c7c7' },
}

const BEAM_NODES: Record<
  BeamSlot,
  {
    platformId: PlatformId
    curvature?: number
    reverse?: boolean
    endYOffset?: number
    delay?: number
  }
> = {
  'top-left': { platformId: 'instagram', curvature: -110, endYOffset: -12, delay: 0 },
  'top-center': { platformId: 'youtube', curvature: -65, delay: 0.3 },
  'top-right': { platformId: 'facebook', curvature: -110, endYOffset: -12, reverse: true, delay: 0.6 },
  'mid-left': { platformId: 'tiktok', delay: 0.15 },
  'mid-right': { platformId: 'linkedin', reverse: true, delay: 0.45 },
  'bottom-left': { platformId: 'threads', curvature: 110, endYOffset: 12, delay: 0.9 },
  'bottom-center': { platformId: 'pinterest', curvature: 65, delay: 1.2 },
  'bottom-right': { platformId: 'twitter', curvature: 110, endYOffset: 12, reverse: true, delay: 1.5 },
}

const beamCircleClass =
  'z-10 flex size-11 items-center justify-center rounded-full border border-border bg-background shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground)_5%,transparent),0_12px_28px_-16px_color-mix(in_oklch,var(--foreground)_16%,transparent)] sm:size-12'

const BeamCircle = forwardRef<HTMLDivElement, { className?: string; children: React.ReactNode }>(
  ({ className, children }, ref) => (
    <div ref={ref} className={cn(beamCircleClass, className)}>
      {children}
    </div>
  ),
)
BeamCircle.displayName = 'BeamCircle'

function PlatformNode({
  id,
  nodeRef,
}: {
  id: PlatformId
  nodeRef: RefObject<HTMLDivElement | null>
}) {
  const platform = platformById[id]

  return (
    <div className="flex min-w-[4.5rem] flex-col items-center gap-2.5">
      <BeamCircle ref={nodeRef} className="size-auto border-none bg-transparent shadow-none">
        <SocialPlatformIcon
          provider={id}
          size={24}
          framed
          className="size-12 rounded-full ring-0 sm:size-14"
        />
      </BeamCircle>
      <span className="text-[0.6875rem] font-medium tracking-[-0.01em] whitespace-nowrap text-muted-foreground sm:text-[0.8125rem]">
        {platform.label}
      </span>
    </div>
  )
}

export function LandingPlatformsBeam() {
  const containerRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)

  const topLeftRef = useRef<HTMLDivElement>(null)
  const topCenterRef = useRef<HTMLDivElement>(null)
  const topRightRef = useRef<HTMLDivElement>(null)
  const midLeftRef = useRef<HTMLDivElement>(null)
  const midRightRef = useRef<HTMLDivElement>(null)
  const bottomLeftRef = useRef<HTMLDivElement>(null)
  const bottomCenterRef = useRef<HTMLDivElement>(null)
  const bottomRightRef = useRef<HTMLDivElement>(null)

  const nodeRefs: Record<BeamSlot, RefObject<HTMLDivElement | null>> = {
    'top-left': topLeftRef,
    'top-center': topCenterRef,
    'top-right': topRightRef,
    'mid-left': midLeftRef,
    'mid-right': midRightRef,
    'bottom-left': bottomLeftRef,
    'bottom-center': bottomCenterRef,
    'bottom-right': bottomRightRef,
  }

  const beamPairs = (Object.keys(BEAM_NODES) as BeamSlot[]).map(slot => ({
    slot,
    fromRef: nodeRefs[slot],
    colors: PLATFORM_BEAM_COLORS[BEAM_NODES[slot].platformId],
    ...BEAM_NODES[slot],
  }))

  return (
    <Section id="channels" border className="py-14 sm:py-20">
      <FadeIn>
        <SectionHeader
          eyebrow={PLATFORMS_BEAM.eyebrow}
          title={PLATFORMS_BEAM.title}
          description={PLATFORMS_BEAM.description}
          align="center"
        />
      </FadeIn>

      <FadeIn delay={0.08}>
        <div
          ref={containerRef}
          className="relative mt-11 flex min-h-96 w-full items-center justify-center overflow-hidden px-3 pt-8 pb-2 sm:mt-[3.25rem] sm:min-h-[30rem] sm:px-5 sm:pt-10 sm:pb-3"
        >
          <div className="flex min-h-[19rem] w-full max-w-[30rem] flex-col justify-between gap-10 sm:max-w-[42rem] sm:min-h-[22rem] sm:gap-14">
            <div className="flex items-center justify-between">
              <PlatformNode id={PLATFORMS_BEAM.layout.top[0]} nodeRef={topLeftRef} />
              <PlatformNode id={PLATFORMS_BEAM.layout.top[1]} nodeRef={topCenterRef} />
              <PlatformNode id={PLATFORMS_BEAM.layout.top[2]} nodeRef={topRightRef} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <PlatformNode id={PLATFORMS_BEAM.layout.middle[0]} nodeRef={midLeftRef} />
              <BeamCircle
                ref={centerRef}
                className="size-20 rounded-[calc(var(--radius)+6px)] border-[color-mix(in_oklch,var(--foreground)_10%,var(--border))] bg-foreground shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground)_8%,transparent),0_24px_48px_-18px_color-mix(in_oklch,var(--foreground)_28%,transparent)] sm:size-[5.75rem]"
              >
                <div className="relative size-9 sm:size-10">
                  <Image
                    src="/socialista-logo.webp"
                    alt=""
                    fill
                    sizes="32px"
                    className="object-contain invert dark:invert-0"
                  />
                </div>
              </BeamCircle>
              <PlatformNode id={PLATFORMS_BEAM.layout.middle[1]} nodeRef={midRightRef} />
            </div>

            <div className="flex items-center justify-between">
              <PlatformNode id={PLATFORMS_BEAM.layout.bottom[0]} nodeRef={bottomLeftRef} />
              <PlatformNode id={PLATFORMS_BEAM.layout.bottom[1]} nodeRef={bottomCenterRef} />
              <PlatformNode id={PLATFORMS_BEAM.layout.bottom[2]} nodeRef={bottomRightRef} />
            </div>
          </div>

          {beamPairs.map(({ slot, fromRef, colors, curvature, reverse, endYOffset, delay }) => (
            <AnimatedBeam
              key={slot}
              containerRef={containerRef}
              fromRef={fromRef}
              toRef={centerRef}
              curvature={curvature}
              reverse={reverse}
              endYOffset={endYOffset}
              delay={delay}
              duration={4}
              pathColor={colors.path}
              pathWidth={3}
              pathOpacity={0.45}
              gradientStartColor={colors.start}
              gradientStopColor={colors.stop}
            />
          ))}
        </div>
      </FadeIn>

      <p className="sr-only">
        Supported channels: {PLATFORMS.map(platform => platform.label).join(', ')}
      </p>
    </Section>
  )
}
