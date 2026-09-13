import { PROBLEM } from "./content";
import { FadeIn } from "./fade-in";
import { landingBodySm, landingContentGap, landingH3 } from "./landing-classes";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

export function LandingProblem() {
  return (
    <Section id="problem" border>
      <FadeIn>
        <SectionHeader
          titleId="problem-heading"
          title={PROBLEM.title}
          description={PROBLEM.description}
        />
      </FadeIn>
      <ul
        className={`${landingContentGap} grid list-none gap-10 p-0 sm:grid-cols-3 sm:gap-8`}
      >
        {PROBLEM.items.map((item, index) => (
          <li key={item.title}>
            <FadeIn delay={index * 0.04}>
              <article className="flex flex-col gap-2.5">
                <h3 className={landingH3}>{item.title}</h3>
                <p className={landingBodySm}>{item.description}</p>
              </article>
            </FadeIn>
          </li>
        ))}
      </ul>
    </Section>
  );
}
