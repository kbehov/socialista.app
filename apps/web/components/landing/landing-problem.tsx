import { PROBLEM } from "./content";
import { FadeIn } from "./fade-in";
import { landingBodySm, landingContentGap, landingH3 } from "./landing-classes";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

export function LandingProblem() {
  return (
    <Section border>
      <FadeIn>
        <SectionHeader
          title={PROBLEM.title}
          description={PROBLEM.description}
        />
      </FadeIn>
      <div
        className={`${landingContentGap} grid gap-8 sm:grid-cols-3 sm:gap-4`}
      >
        {PROBLEM.items.map((item, index) => (
          <FadeIn key={item.title} delay={index * 0.04}>
            <div className="flex flex-col gap-2">
              <h3 className={landingH3}>{item.title}</h3>
              <p className={landingBodySm}>{item.description}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}
