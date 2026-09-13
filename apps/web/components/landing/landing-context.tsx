import { CONTEXT } from "./content";
import { FadeIn } from "./fade-in";
import { landingContentGap } from "./landing-classes";
import { MockupContext } from "./mockups/mockup-context";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

export function LandingContext() {
  return (
    <Section id="context" border>
      <FadeIn>
        <SectionHeader
          titleId="context-heading"
          title={CONTEXT.title}
          description={CONTEXT.description}
        />
      </FadeIn>
      <FadeIn delay={0.06} className={landingContentGap}>
        <figure>
          <MockupContext />
          <figcaption className="sr-only">
            Brand voice, product catalog, and reusable skills applied to every studio generation.
          </figcaption>
        </figure>
      </FadeIn>
    </Section>
  );
}
