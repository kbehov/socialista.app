import { PUBLISH } from "./content";
import { FadeIn } from "./fade-in";
import { landingContentGap } from "./landing-classes";
import { MockupComposer } from "./mockups/mockup-composer";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

export function LandingPublish() {
  return (
    <Section id="publish" border alt>
      <FadeIn>
        <SectionHeader
          title={PUBLISH.title}
          description={PUBLISH.description}
        />
      </FadeIn>
      <FadeIn delay={0.06} className={landingContentGap}>
        <MockupComposer />
      </FadeIn>
    </Section>
  );
}
