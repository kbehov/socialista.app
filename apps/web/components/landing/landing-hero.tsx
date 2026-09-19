import { CtaPair } from './cta-pair'
import { HERO, HERO_SLIDES } from './content'
import { FadeIn } from './fade-in'
import { HeroEngagementOrbs } from './hero-engagement-orbs'
import { HeroMarquee } from './hero-marquee'
import { HeroSocialProof } from './hero-social-proof'
import { cn } from '@/lib/utils'
import { SectionInner } from './section'
import {
  landingCtaStack,
  landingHeroDisplay,
  landingHeroEyebrow,
  landingHeroHeadingGlow,
  landingHeroLead,
} from './landing-classes'

const HERO_FLOAT_STATS = HERO_SLIDES[0]

export function LandingHero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="landing-canvas relative overflow-x-clip pb-12 pt-12 sm:pb-16 sm:pt-[4.75rem]"
    >
      <SectionInner className="max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <p className={landingHeroEyebrow}>{HERO.eyebrow}</p>
          <div className="relative mx-auto mt-4 w-full max-w-[min(100%,52rem)] px-1 sm:mt-5 sm:px-0">
            <div
              className={`pointer-events-none absolute inset-x-[-8%] top-[-20%] bottom-[-28%] -z-10 ${landingHeroHeadingGlow}`}
              aria-hidden="true"
            />
            <HeroEngagementOrbs
              likes={HERO_FLOAT_STATS.likes}
              views={HERO_FLOAT_STATS.views}
            />
            <h1 id="hero-heading" className={landingHeroDisplay}>
              {HERO.title}{' '}
              <span className="font-serif text-[1.02em] font-normal italic tracking-[-0.02em]">
                {HERO.titleAccent}
              </span>
            </h1>
          </div>
          <p className={cn(landingHeroLead, 'mt-6 sm:mt-7')}>{HERO.description}</p>
          <CtaPair className={cn(landingCtaStack, 'mt-8 sm:mt-9')} />
        </div>

        <FadeIn delay={0.14} immediate className="relative z-1 mt-12 w-full min-w-0 sm:mt-14 lg:mt-16">
          <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-clip">
            <HeroMarquee />
          </div>
          <FadeIn delay={0.22} immediate className="mt-8 flex justify-center sm:mt-10">
            <HeroSocialProof />
          </FadeIn>
        </FadeIn>
      </SectionInner>
    </section>
  )
}
