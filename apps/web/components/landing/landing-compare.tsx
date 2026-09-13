import { COMPARE } from "./content";
import { FadeIn } from "./fade-in";
import { landingBodySm, landingContentGap, landingH3 } from "./landing-classes";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

export function LandingCompare() {
  return (
    <Section id="compare" border>
      <FadeIn>
        <SectionHeader
          titleId="compare-heading"
          title={COMPARE.title}
          description={COMPARE.description}
        />
      </FadeIn>
      <dl
        className={`${landingContentGap} divide-y divide-border border-y border-border`}
      >
        {COMPARE.rows.map((row, index) => (
          <FadeIn
            key={row.label}
            delay={index * 0.04}
            className="grid gap-6 py-8 sm:grid-cols-3 sm:gap-8"
          >
            <dt className={landingH3}>{row.label}</dt>
            <dd className={`${landingBodySm} m-0`}>
              <span className="mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-muted-foreground/80">
                {COMPARE.beforeLabel}
              </span>
              {row.old}
            </dd>
            <dd className="m-0 text-[0.9375rem] leading-[1.65] text-pretty text-foreground">
              <span className="mb-1.5 block text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-muted-foreground/80">
                {COMPARE.afterLabel}
              </span>
              {row.next}
            </dd>
          </FadeIn>
        ))}
      </dl>
    </Section>
  );
}
