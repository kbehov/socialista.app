import { LOOP } from "./content";
import { FadeIn } from "./fade-in";
import {
  landingBodySm,
  landingCard,
  landingContentGap,
  landingH3,
} from "./landing-classes";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

export function LandingLoop() {
  return (
    <Section border alt>
      <FadeIn>
        <SectionHeader title={LOOP.title} description={LOOP.description} />
      </FadeIn>
      <div
        className={`${landingContentGap} grid gap-3 sm:grid-cols-3 sm:gap-4`}
      >
        {LOOP.steps.map((step, index) => (
          <FadeIn key={step.id} delay={index * 0.04}>
            <article
              className={`${landingCard} flex h-full flex-col gap-2 p-5 sm:p-6`}
            >
              <p
                className="text-sm font-medium tabular-nums text-muted-foreground"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className={landingH3}>{step.title}</h3>
              <p className={landingBodySm}>{step.description}</p>
            </article>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}
