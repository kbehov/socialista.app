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
    <Section id="loop" border alt>
      <FadeIn>
        <SectionHeader
          titleId="loop-heading"
          title={LOOP.title}
          description={LOOP.description}
        />
      </FadeIn>
      <ol
        className={`${landingContentGap} grid list-none gap-3 p-0 sm:grid-cols-3 sm:gap-4`}
      >
        {LOOP.steps.map((step, index) => (
          <li key={step.id}>
            <FadeIn delay={index * 0.04}>
              <article
                className={`${landingCard} flex h-full flex-col gap-2.5 p-5 sm:p-6`}
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
          </li>
        ))}
      </ol>
    </Section>
  );
}
