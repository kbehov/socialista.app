import { HERO } from './content'
import { CtaPair } from './cta-pair'
import { FadeIn, Stagger, StaggerItem } from './fade-in'
import { HeroCarousel } from './hero-carousel'
import { HeroDoodles } from './hero-doodles'
import { HeroEyebrow } from './hero-eyebrow'
import { HeroHeading } from './hero-heading'
import { HeroSocialProof } from './hero-social-proof'
import { SectionInner } from './section'

export function LandingHero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-x-clip pt-8 pb-0 sm:pt-10 lg:pt-12"
    >
      <HeroDoodles />

      <SectionInner className="max-w-6xl">
        <Stagger
          className="relative z-1 mx-auto flex w-full max-w-4xl flex-col items-center text-center"
          delay={0.02}
          immediate
        >
          <StaggerItem>
            <HeroEyebrow />
          </StaggerItem>
          <hgroup className="mt-6 flex w-full flex-col items-center">
            <StaggerItem className="w-full">
              <HeroHeading />
            </StaggerItem>
            <StaggerItem>
              <p className="mx-auto mt-5 max-w-md text-[0.9375rem] leading-[1.55] text-pretty text-muted-foreground sm:mt-6 sm:max-w-lg sm:text-[0.975rem] sm:leading-[1.65]">
                {HERO.description}
              </p>
            </StaggerItem>
          </hgroup>
          <StaggerItem className="flex w-full justify-center">
            <CtaPair className="mt-8 flex w-full max-w-70 flex-col items-stretch gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3" />
          </StaggerItem>
        </Stagger>
      </SectionInner>

      <FadeIn delay={0.14} immediate className="relative z-1 mt-12 w-full min-w-0 sm:mt-14 lg:mt-16">
        <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-clip">
          <HeroCarousel />
        </div>
        <FadeIn delay={0.22} immediate className="my-7 flex justify-center sm:my-8 ">
          <HeroSocialProof />
        </FadeIn>
      </FadeIn>
    </section>
  )
}
