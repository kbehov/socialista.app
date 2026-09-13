import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { FINAL_CTA } from "./content";
import { FadeIn } from "./fade-in";
import { landingBody, landingCtaPrimary, landingH2 } from "./landing-classes";
import { SectionInner } from "./section";

export function LandingFinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-[color-mix(in_oklch,var(--foreground)_97%,var(--background))] text-background dark:bg-surface-2 dark:text-foreground">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_15%_50%,color-mix(in_oklch,var(--background)_8%,transparent),transparent_55%),radial-gradient(ellipse_40%_60%_at_85%_20%,color-mix(in_oklch,var(--guest-accent)_12%,transparent),transparent_50%)]"
        aria-hidden="true"
      />
      <SectionInner className="relative py-20 sm:py-24 lg:py-28">
        <FadeIn className="mx-auto max-w-xl text-center">
          <h2 className={cn(landingH2, "text-inherit")}>{FINAL_CTA.title}</h2>
          <p
            className={cn(
              landingBody,
              "mx-auto mt-5 text-[color-mix(in_oklch,var(--background)_70%,transparent)] dark:text-muted-foreground",
            )}
          >
            {FINAL_CTA.description}
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className={cn(
                landingCtaPrimary,
                "bg-background text-foreground hover:bg-background/90 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90",
              )}
            >
              <Link href="/auth/signup" className="group">
                {FINAL_CTA.cta}
                <ArrowRight className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </FadeIn>
      </SectionInner>
    </section>
  );
}
