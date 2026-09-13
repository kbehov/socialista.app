import { CtaPair } from "./cta-pair";
import { HERO } from "./content";
import { FadeIn, Stagger, StaggerItem } from "./fade-in";
import { HeroCarousel } from "./hero-carousel";
import { HeroSocialProof } from "./hero-social-proof";
import { HeroDoodles } from "./hero-doodles";
import { HeroEyebrow } from "./hero-eyebrow";
import { HeroHeading } from "./hero-heading";
import { landingBody } from "./landing-classes";
import { SectionInner } from "./section";

export function LandingHero() {
  return (
    <section className="relative pt-5 pb-0 sm:pt-6 lg:pt-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 left-1/2 h-[min(28rem,60vh)] w-full max-w-[48rem] -translate-x-1/2 bg-[radial-gradient(ellipse_68%_58%_at_50%_42%,color-mix(in_oklch,var(--foreground)_4%,transparent),transparent_74%)]"
        aria-hidden="true"
      />

      <HeroDoodles />

      <SectionInner className="max-w-7xl">
        <div className="relative z-1 grid justify-items-center gap-12 sm:gap-16">
          <Stagger
            className="mx-auto w-full max-w-5xl text-center"
            delay={0.02}
            immediate
          >
            <StaggerItem>
              <HeroEyebrow />
            </StaggerItem>
            <StaggerItem>
              <HeroHeading />
            </StaggerItem>
            <StaggerItem>
              <p className={`mx-auto mt-5 ${landingBody}`}>
                {HERO.description}
              </p>
            </StaggerItem>
            <StaggerItem>
              <CtaPair className="mt-8 flex flex-wrap items-center justify-center gap-3" />
            </StaggerItem>
          </Stagger>
        </div>
      </SectionInner>

      <FadeIn
        delay={0.14}
        immediate
        className="relative z-1 mt-12 w-full min-w-0 sm:mt-16"
      >
        <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-clip">
          <HeroCarousel />
        </div>
        <FadeIn delay={0.22} immediate className="mt-6 flex justify-center sm:mt-8">
          <HeroSocialProof />
        </FadeIn>
      </FadeIn>
    </section>
  );
}
