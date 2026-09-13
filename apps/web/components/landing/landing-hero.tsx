import { CtaPair } from "./cta-pair";
import { HERO } from "./content";
import { FadeIn, Stagger, StaggerItem } from "./fade-in";
import { HeroCarousel } from "./hero-carousel";
import { HeroSocialProof } from "./hero-social-proof";
import { HeroDoodles } from "./hero-doodles";
import { HeroEyebrow } from "./hero-eyebrow";
import { HeroHeading } from "./hero-heading";
import { SectionInner } from "./section";

export function LandingHero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative pt-8 pb-0 sm:pt-10 lg:pt-12"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 left-1/2 h-[min(28rem,60vh)] w-full max-w-[48rem] -translate-x-1/2 bg-[radial-gradient(ellipse_68%_58%_at_50%_42%,color-mix(in_oklch,var(--foreground)_4%,transparent),transparent_74%)]"
        aria-hidden="true"
      />

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
              <p className="mx-auto mt-5 max-w-[20.5rem] text-[0.9375rem] leading-[1.55] text-pretty text-muted-foreground sm:mt-6 sm:max-w-[32rem] sm:text-[1.0625rem] sm:leading-[1.65] lg:text-[1.125rem] lg:leading-[1.6]">
                {HERO.description}
              </p>
            </StaggerItem>
          </hgroup>
          <StaggerItem className="flex w-full justify-center">
            <CtaPair className="mt-8 flex w-full max-w-72 flex-col items-stretch gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3" />
          </StaggerItem>
        </Stagger>
      </SectionInner>

      <FadeIn
        delay={0.14}
        immediate
        className="relative z-1 mt-12 w-full min-w-0 sm:mt-14 lg:mt-16"
      >
        <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-clip">
          <HeroCarousel />
        </div>
        <FadeIn
          delay={0.22}
          immediate
          className="mt-7 flex justify-center sm:mt-8"
        >
          <HeroSocialProof />
        </FadeIn>
      </FadeIn>
    </section>
  );
}
