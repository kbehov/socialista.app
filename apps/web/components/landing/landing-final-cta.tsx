import { cn } from "@/lib/utils";

import { CtaPair } from "./cta-pair";
import { FINAL_CTA } from "./content";
import { FadeIn } from "./fade-in";
import {
  landingAccentToneForStory,
  landingCtaStack,
  landingFinalCtaGlow,
  landingSectionLead,
  landingSectionTitle,
  landingSectionTitleAccent,
  landingSectionTitleAccentSerif,
  LANDING_STORY_INDEX,
} from "./landing-classes";
import { SectionInner } from "./section";

export function LandingFinalCta() {
  const accentTone = landingAccentToneForStory(LANDING_STORY_INDEX.getStarted)
  const accentClass =
    accentTone === "serif"
      ? cn(
          landingSectionTitleAccentSerif,
          "text-[color-mix(in_srgb,var(--landing-canvas)_92%,white)]",
        )
      : cn(
          landingSectionTitleAccent,
          "text-[color-mix(in_srgb,var(--landing-canvas)_72%,transparent)]",
        )

  return (
    <section
      id="get-started"
      aria-labelledby="get-started-heading"
      className="relative overflow-hidden landing-section-divider bg-[var(--landing-charcoal)] text-[color-mix(in_srgb,var(--landing-canvas)_96%,white)]"
    >
      <div
        className={cn('pointer-events-none absolute inset-0', landingFinalCtaGlow)}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, oklch(1 0 0 / 0.08), transparent 55%)',
        }}
      />
      <SectionInner className="relative py-20 sm:py-24 lg:py-28">
        <FadeIn className="mx-auto max-w-xl text-center">
          <hgroup>
            <h2 id="get-started-heading" className={cn(landingSectionTitle, "text-inherit")}>
              {FINAL_CTA.title}{" "}
              <span className={accentClass}>{FINAL_CTA.titleAccent}</span>
            </h2>
            <p
              className={cn(
                landingSectionLead,
                "mx-auto mt-5 text-[color-mix(in_srgb,var(--landing-canvas)_68%,transparent)]",
              )}
            >
              {FINAL_CTA.description}
            </p>
          </hgroup>
          <CtaPair
            inverted
            className={cn(landingCtaStack, "mt-8 sm:mt-10")}
          />
        </FadeIn>
      </SectionInner>
    </section>
  );
}
