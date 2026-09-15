import { CtaPair } from './cta-pair'
import { HERO } from './content'
import { FadeIn } from './fade-in'
import { HeroMarquee } from './hero-marquee'
import { HeroSocialProof } from './hero-social-proof'
import { SectionInner } from './section'

export function LandingHero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="landing-canvas relative overflow-hidden pb-10 pt-14 sm:pb-12 sm:pt-20"
    >
      <SectionInner className="max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold tracking-[-0.015em] text-[var(--landing-orange)]">
            {HERO.eyebrow}
          </p>
          <h1
            id="hero-heading"
            className="mt-5 text-balance font-semibold text-[clamp(3rem,6.8vw,6.4rem)] leading-[.94] tracking-[-0.072em] text-[var(--landing-ink)]"
          >
            {HERO.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-[1.0625rem] leading-7 text-[var(--landing-muted)] sm:text-xl sm:leading-8">
            {HERO.description}
          </p>
          <CtaPair className="mt-8 flex flex-col justify-center gap-3 sm:flex-row" />
        </div>

        <FadeIn delay={0.14} immediate className="relative z-1 mt-12 w-full min-w-0 sm:mt-14 lg:mt-16">
          <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-clip">
            <HeroMarquee />
          </div>
          <FadeIn delay={0.22} immediate className="mt-7 flex justify-center sm:mt-9">
            <HeroSocialProof />
          </FadeIn>
        </FadeIn>
      </SectionInner>
    </section>
  )
}
