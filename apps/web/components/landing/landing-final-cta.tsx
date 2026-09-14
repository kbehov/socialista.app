import { cn } from "@/lib/utils";

import { CtaPair } from "./cta-pair";
import { FINAL_CTA } from "./content";
import { FadeIn } from "./fade-in";
import { landingBody, landingH2 } from "./landing-classes";
import { SectionInner } from "./section";

export function LandingFinalCta() {
  return (
    <section
      id="get-started"
      aria-labelledby="get-started-heading"
      className="relative overflow-hidden border-t border-border bg-[color-mix(in_oklch,var(--foreground)_97%,var(--background))] text-background dark:bg-surface-2 dark:text-foreground"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_15%_50%,color-mix(in_oklch,var(--background)_8%,transparent),transparent_55%),radial-gradient(ellipse_40%_60%_at_85%_20%,color-mix(in_oklch,var(--guest-accent)_12%,transparent),transparent_50%)]"
        aria-hidden="true"
      />
      <SectionInner className="relative py-20 sm:py-24 lg:py-28">
        <FadeIn className="mx-auto max-w-xl text-center">
          <hgroup>
            <h2 id="get-started-heading" className={cn(landingH2, "text-inherit")}>
              {FINAL_CTA.title}
            </h2>
            <p
              className={cn(
                landingBody,
                "mx-auto mt-4 sm:mt-5 text-[color-mix(in_oklch,var(--background)_70%,transparent)] dark:text-muted-foreground",
              )}
            >
              {FINAL_CTA.description}
            </p>
          </hgroup>
          <CtaPair
            inverted
            className="mt-8 flex w-full flex-col items-stretch justify-center gap-2.5 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
          />
        </FadeIn>
      </SectionInner>
    </section>
  );
}
