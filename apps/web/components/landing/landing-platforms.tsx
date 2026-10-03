'use client'

import { LogoGlyph } from '@/components/common/logo'
import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { AnimatedBeam } from '@/components/ui/animated-beam'
import { cn } from '@/lib/utils'
import { useRef, type ReactNode, type Ref, type RefObject } from 'react'

import { LANDING_CHANNELS, PLATFORMS_SECTION, type PlatformId } from './content'
import { FadeIn } from './fade-in'
import { landingContentGap } from './landing-classes'
import { Section } from './section'
import { SectionCta } from './section-cta'
import { LandingSectionIntro } from './section-header'

const platformById = Object.fromEntries(LANDING_CHANNELS.map(platform => [platform.id, platform])) as Record<
  PlatformId,
  (typeof LANDING_CHANNELS)[number]
>

type BeamConfig = {
  platformId: PlatformId
  curvature?: number
  reverse?: boolean
  endYOffset?: number
  delay: number
}

const BEAMS: BeamConfig[] = [
  { platformId: 'instagram', curvature: -78, endYOffset: -8, delay: 0 },
  { platformId: 'facebook', curvature: -78, endYOffset: -8, reverse: true, delay: 0.35 },
  { platformId: 'tiktok', delay: 0.12 },
  { platformId: 'linkedin', reverse: true, delay: 0.48 },
  { platformId: 'threads', curvature: 78, endYOffset: 8, delay: 0.7 },
  { platformId: 'twitter', curvature: 78, endYOffset: 8, reverse: true, delay: 0.95 },
]

const PLATFORM_BEAM_COLORS: Record<PlatformId, { start: string; stop: string; path: string }> = {
  instagram: { start: '#f77737', stop: '#c13584', path: '#f0a8d0' },
  facebook: { start: '#4da3ff', stop: '#1877f2', path: '#a8cfff' },
  tiktok: { start: '#25f4ee', stop: '#fe2c55', path: '#9ef0ec' },
  linkedin: { start: '#4ba3f5', stop: '#0a66c2', path: '#a8d4ff' },
  threads: { start: '#6b6b6b', stop: '#000000', path: '#c4c4c4' },
  twitter: { start: '#8b8b8b', stop: '#000000', path: '#c7c7c7' },
}

const platformRow = 'grid grid-cols-3 items-center'

function BeamCircle({
  className,
  children,
  ref,
}: {
  className?: string
  children: ReactNode
  ref?: Ref<HTMLDivElement>
}) {
  return (
    <div
      ref={ref}
      className={cn(
        'z-10 flex size-9 items-center justify-center rounded-full border border-border bg-background sm:size-10',
        className,
      )}
    >
      {children}
    </div>
  )
}

function PlatformNode({ id, nodeRef }: { id: PlatformId; nodeRef: RefObject<HTMLDivElement | null> }) {
  const platform = platformById[id]

  return (
    <div className="group/platform flex min-w-[3.75rem] flex-col items-center gap-2 sm:min-w-[4.25rem]">
      <BeamCircle ref={nodeRef} className="size-auto border-none bg-transparent shadow-none">
        <SocialPlatformIcon
          provider={id}
          size={18}
          framed
          className="size-9 rounded-full ring-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)_and_(pointer:fine)]:group-hover/platform:scale-105 sm:size-10"
        />
      </BeamCircle>
      <span className="text-[0.625rem] font-medium tracking-[-0.01em] whitespace-nowrap text-[var(--landing-muted)]/90 transition-colors duration-200 group-hover/platform:text-[var(--landing-ink)] sm:text-[0.6875rem]">
        {platform.label}
      </span>
    </div>
  )
}

export function LandingPlatforms() {
  const containerRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const instagramRef = useRef<HTMLDivElement>(null)
  const facebookRef = useRef<HTMLDivElement>(null)
  const tiktokRef = useRef<HTMLDivElement>(null)
  const linkedinRef = useRef<HTMLDivElement>(null)
  const threadsRef = useRef<HTMLDivElement>(null)
  const twitterRef = useRef<HTMLDivElement>(null)

  const nodeRefs: Record<PlatformId, RefObject<HTMLDivElement | null>> = {
    instagram: instagramRef,
    facebook: facebookRef,
    tiktok: tiktokRef,
    linkedin: linkedinRef,
    threads: threadsRef,
    twitter: twitterRef,
  }

  return (
    <Section id="channels" landingDivider className="overflow-x-clip">
      <FadeIn>
        <LandingSectionIntro
          titleId="channels-heading"
          eyebrow={PLATFORMS_SECTION.eyebrow}
          title={PLATFORMS_SECTION.title}
          titleAccent={PLATFORMS_SECTION.titleAccent}
          description={PLATFORMS_SECTION.description}
        />
      </FadeIn>

      <FadeIn delay={0.08} className={landingContentGap}>
        <figure className="mx-auto w-full max-w-3xl">
          <div className="px-2 py-6 sm:px-6 sm:py-8">
            <div
              ref={containerRef}
              className="relative flex w-full items-center justify-center overflow-hidden px-1 py-2 sm:px-2 sm:py-4"
            >
              <div className="relative flex min-h-[15rem] w-full flex-col justify-between gap-7 sm:min-h-[17.5rem] sm:gap-9">
                <div className={platformRow}>
                  <div className="justify-self-start">
                    <PlatformNode id="instagram" nodeRef={instagramRef} />
                  </div>
                  <div />
                  <div className="justify-self-end">
                    <PlatformNode id="facebook" nodeRef={facebookRef} />
                  </div>
                </div>

                <div className={cn(platformRow, 'gap-3 sm:gap-4')}>
                  <div className="justify-self-start">
                    <PlatformNode id="tiktok" nodeRef={tiktokRef} />
                  </div>
                  <div
                    ref={centerRef}
                    className="z-10 justify-self-center rounded-2xl border border-white/[0.1] bg-[var(--landing-charcoal)] p-3.5 shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_20px_48px_-20px_rgba(0,0,0,0.45)] sm:p-4"
                  >
                    <LogoGlyph size="hero" priority />
                  </div>
                  <div className="justify-self-end">
                    <PlatformNode id="linkedin" nodeRef={linkedinRef} />
                  </div>
                </div>

                <div className={platformRow}>
                  <div className="justify-self-start">
                    <PlatformNode id="threads" nodeRef={threadsRef} />
                  </div>
                  <div />
                  <div className="justify-self-end">
                    <PlatformNode id="twitter" nodeRef={twitterRef} />
                  </div>
                </div>
              </div>

              {BEAMS.map(beam => {
                const colors = PLATFORM_BEAM_COLORS[beam.platformId]
                return (
                  <AnimatedBeam
                    key={beam.platformId}
                    containerRef={containerRef}
                    fromRef={nodeRefs[beam.platformId]}
                    toRef={centerRef}
                    curvature={beam.curvature}
                    reverse={beam.reverse}
                    endYOffset={beam.endYOffset}
                    delay={beam.delay}
                    duration={4.5}
                    pathColor={colors.path}
                    pathWidth={2}
                    pathOpacity={0.18}
                    gradientStartColor={colors.start}
                    gradientStopColor={colors.stop}
                  />
                )
              })}
            </div>
          </div>
          <figcaption className="sr-only">
            Socialista publishes to {LANDING_CHANNELS.map(platform => platform.label).join(', ')}.
          </figcaption>
        </figure>
      </FadeIn>

      <FadeIn className={landingContentGap}>
        <SectionCta label={PLATFORMS_SECTION.cta} />
      </FadeIn>
    </Section>
  )
}
