import { MEASURE } from "./content";
import { FadeIn } from "./fade-in";
import { landingContentGap } from "./landing-classes";
import { MockupAnalytics } from "./mockups/mockup-analytics";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

export function LandingMeasure() {
  return (
    <Section id="measure" border alt>
      <FadeIn>
        <SectionHeader
          title={MEASURE.title}
          description={MEASURE.description}
        />
      </FadeIn>
      <FadeIn delay={0.06} className={landingContentGap}>
        <MockupAnalytics />
      </FadeIn>
    </Section>
  );
}
