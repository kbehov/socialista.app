import { COMPARE } from "./content";
import { FadeIn } from "./fade-in";
import { landingBodySm, landingContentGap, landingH3 } from "./landing-classes";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

export function LandingCompare() {
  return (
    <Section border>
      <FadeIn>
        <SectionHeader
          title={COMPARE.title}
          description={COMPARE.description}
        />
      </FadeIn>
      <div
        className={`${landingContentGap} divide-y divide-border border-y border-border`}
      >
        {COMPARE.rows.map((row, index) => (
          <FadeIn
            key={row.label}
            delay={index * 0.04}
            className="grid gap-6 py-8 sm:grid-cols-3 sm:gap-8"
          >
            <h3 className={landingH3}>{row.label}</h3>
            <p className={landingBodySm}>{row.old}</p>
            <p className="text-sm leading-[1.5] text-foreground">{row.next}</p>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}
