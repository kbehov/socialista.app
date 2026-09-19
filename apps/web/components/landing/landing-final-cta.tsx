import { cn } from "@/lib/utils";

import { CtaPair } from "./cta-pair";
import { FINAL_CTA } from "./content";
import { FadeIn } from "./fade-in";
import {
  landingCtaStack,
  landingFinalCtaGlow,
  landingSectionLead,
  landingSectionTitle,
} from "./landing-classes";
import { SectionInner } from "./section";

export function LandingFinalCta() {
  return (
    <section
      id="get-started"
      aria-labelledby="get-started-heading"
      className="relative overflow-hidden landing-section-divider bg-[var(--landing-charcoal)] text-[color-mix(in_srgb,var(--landing-canvas)_96%,white)]"
    >
      <div
        className={cn("pointer-events-none absolute inset-0", landingFinalCtaGlow)}
        aria-hidden="true"
      />
      <SectionInner className="relative py-20 sm:py-24 lg:py-28">
        <FadeIn className="mx-auto max-w-xl text-center">
          <hgroup>
            <h2 id="get-started-heading" className={cn(landingSectionTitle, "text-inherit")}>
              {FINAL_CTA.title}
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
