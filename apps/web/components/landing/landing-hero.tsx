import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { CtaPair } from './cta-pair'
import { HERO, HERO_SLIDES } from './content'
import { FadeIn } from './fade-in'
import { HeroEngagementOrbs } from './hero-engagement-orbs'
import { HeroMarquee } from './hero-marquee'
import { HeroSocialProof } from './hero-social-proof'
import { cn } from '@/lib/utils'
import { SectionInner } from './section'
import {
  landingFocusRing,
  landingGlassLight,
  landingHeroDisplay,
  landingHeroHeadingGlow,
  landingHeroLead,
  landingHeroTitleAccent,
} from './landing-classes'

const HERO_FLOAT_STATS = HERO_SLIDES[0]

export function LandingHero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="landing-canvas relative overflow-x-clip pb-16 pt-10 sm:pb-20 sm:pt-16"
    >
      <SectionInner className="max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn immediate y={6}>
            <Link
              href={HERO.eyebrowHref}
              className={cn(
                landingGlassLight,
                landingFocusRing,
                'group mx-auto mb-7 inline-flex min-h-8 items-center gap-2 rounded-full py-1 pr-3 pl-1 text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--landing-ink)] transition-[border-color,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:border-[color-mix(in_srgb,var(--landing-ink)_14%,transparent)] sm:mb-8',
              )}
            >
              <span className="rounded-full bg-[var(--landing-charcoal)] px-2 py-0.5 text-[0.6875rem] font-semibold text-white">
                {HERO.eyebrow}
              </span>
              {HERO.eyebrowLabel}
              <ArrowRight
                className="size-3.5 translate-y-px text-[var(--landing-muted)] transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </FadeIn>
          <FadeIn immediate delay={0.04} y={10}>
            <div className="relative mx-auto w-full max-w-[min(100%,56rem)] px-1 sm:px-0">
              <div
                className={`pointer-events-none absolute inset-x-[-8%] top-[-20%] bottom-[-28%] -z-10 ${landingHeroHeadingGlow}`}
                aria-hidden="true"
              />
              <HeroEngagementOrbs likes={HERO_FLOAT_STATS.likes} views={HERO_FLOAT_STATS.views} />
              <h1 id="hero-heading" className={landingHeroDisplay}>
                {HERO.title}
                <span className="block">
                  <span className={landingHeroTitleAccent}>{HERO.titleAccent}</span>
                </span>
              </h1>
            </div>
          </FadeIn>
          <FadeIn immediate delay={0.08} y={8}>
            <p className={cn(landingHeroLead, 'mt-6 sm:mt-7 sm:text-[1.0625rem]')}>{HERO.description}</p>
          </FadeIn>
          <FadeIn immediate delay={0.12} y={8}>
            <CtaPair className="mt-8 sm:mt-9" />
          </FadeIn>
        </div>

        <FadeIn delay={0.16} immediate className="relative z-1 mt-12 w-full min-w-0 sm:mt-14 lg:mt-16">
          <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-clip">
            <HeroMarquee />
          </div>
          <p className="mt-4 text-center text-xs text-[var(--landing-muted)]">{HERO.marqueeCaption}</p>
          <div className="mt-10 flex justify-center sm:mt-12">
            <HeroSocialProof />
          </div>
        </FadeIn>
      </SectionInner>
    </section>
  )
}
