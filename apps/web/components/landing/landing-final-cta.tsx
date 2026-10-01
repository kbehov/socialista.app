import { cn } from "@/lib/utils";
import Image from "next/image";

import { CtaPair } from "./cta-pair";
import { FINAL_CTA } from "./content";
import { FadeIn } from "./fade-in";
import {
  landingFinalCtaGlow,
  landingSectionLead,
  landingSectionTitle,
  landingSectionTitleAccentSerif,
} from "./landing-classes";
import { HERO_MARQUEE_POSTERS } from "./media";
import { SectionInner } from "./section";

const FINAL_CTA_POSTERS = [
  { src: HERO_MARQUEE_POSTERS[0], rotate: "-6deg" },
  { src: HERO_MARQUEE_POSTERS[3], rotate: "0deg" },
  { src: HERO_MARQUEE_POSTERS[5], rotate: "6deg" },
] as const;

export function LandingFinalCta() {
  return (
    <section
      id="get-started"
      aria-labelledby="get-started-heading"
      className="relative overflow-hidden landing-section-divider bg-[#0c0c0c] text-[color-mix(in_srgb,var(--landing-canvas)_96%,white)]"
    >
      <div
        className={cn('pointer-events-none absolute inset-0', landingFinalCtaGlow)}
        aria-hidden="true"
      />
      <SectionInner className="relative py-24 sm:py-28 lg:py-32">
        <FadeIn className="mx-auto max-w-xl text-center">
          <div className="mb-10 flex items-end justify-center -space-x-4" aria-hidden="true">
            {FINAL_CTA_POSTERS.map((poster, index) => (
              <div
                key={poster.src}
                className={cn(
                  "relative aspect-9/16 w-[4.5rem] overflow-hidden rounded-2xl bg-[#141414] shadow-[0_18px_40px_-18px_rgb(0_0_0/0.8),0_0_0_1px_rgb(255_255_255/0.1)] sm:w-[5.25rem]",
                  index === 1 && "z-10 w-[5.25rem] sm:w-[6.25rem]",
                )}
                style={{ rotate: poster.rotate }}
              >
                <Image src={poster.src} alt="" fill quality={75} sizes="100px" className="object-cover" />
              </div>
            ))}
          </div>
          <hgroup>
            <h2 id="get-started-heading" className={cn(landingSectionTitle, "text-inherit")}>
              {FINAL_CTA.title}{" "}
              <span
                className={cn(
                  landingSectionTitleAccentSerif,
                  "text-[color-mix(in_srgb,var(--landing-canvas)_92%,white)]",
                )}
              >
                {FINAL_CTA.titleAccent}
              </span>
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
          <CtaPair inverted className="mt-8 sm:mt-10" />
        </FadeIn>
      </SectionInner>
    </section>
  );
}
