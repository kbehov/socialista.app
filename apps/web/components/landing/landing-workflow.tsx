import { cn } from "@/lib/utils";

import { WORKFLOW } from "./content";
import { FadeIn } from "./fade-in";
import { landingBodySm, landingContentGap, landingH3 } from "./landing-classes";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

export function LandingWorkflow() {
  return (
    <Section border alt>
      <FadeIn>
        <SectionHeader
          title={WORKFLOW.title}
          description={WORKFLOW.description}
          align="center"
        />
      </FadeIn>
      <FadeIn
        delay={0.05}
        className={`${landingContentGap} grid gap-8 lg:grid-cols-3 lg:gap-10`}
      >
        {WORKFLOW.steps.map((step) => (
          <div
            key={step.n}
            className="relative border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10 first:lg:border-l-0 first:lg:pl-0"
          >
            <span
              className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-muted/30 text-xs font-medium tabular-nums text-muted-foreground"
              aria-hidden="true"
            >
              {step.n}
            </span>
            <h3 className={cn(landingH3, "mt-4")}>{step.title}</h3>
            <p className={cn(landingBodySm, "mt-2")}>{step.description}</p>
          </div>
        ))}
      </FadeIn>
    </Section>
  );
}
