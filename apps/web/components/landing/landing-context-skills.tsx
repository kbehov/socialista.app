import { Package, Palette, WandSparkles, type LucideIcon } from "lucide-react";

import {
  CONTEXT_SKILLS,
  type ContextSkillsFeatureId,
} from "./content";
import { FadeIn } from "./fade-in";
import {
  landingBodySm,
  landingCard,
  landingCardHover,
  landingContentGap,
  landingH3,
} from "./landing-classes";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

const FEATURE_ICONS: Record<ContextSkillsFeatureId, LucideIcon> = {
  products: Package,
  brands: Palette,
  skills: WandSparkles,
};

function ContextSkillIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-[calc(var(--radius)+2px)] border border-border bg-surface-0 text-foreground"
      aria-hidden="true"
    >
      <Icon className="size-[1.125rem]" strokeWidth={1.75} />
    </span>
  );
}

export function LandingContextSkills() {
  return (
    <Section id="context-skills" border alt>
      <FadeIn>
        <SectionHeader
          titleId="context-skills-heading"
          eyebrow={CONTEXT_SKILLS.eyebrow}
          title={CONTEXT_SKILLS.title}
          description={CONTEXT_SKILLS.description}
        />
      </FadeIn>
      <ul
        className={`${landingContentGap} grid list-none gap-3 p-0 sm:grid-cols-3 sm:gap-4`}
      >
        {CONTEXT_SKILLS.features.map((feature, index) => {
          const Icon = FEATURE_ICONS[feature.id];

          return (
            <li key={feature.id}>
              <FadeIn delay={index * 0.04}>
                <article
                  className={`${landingCard} ${landingCardHover} flex h-full flex-col gap-4 p-5 sm:p-6`}
                >
                  <ContextSkillIcon icon={Icon} />
                  <div className="flex flex-col gap-2.5">
                    <h3 className={landingH3}>{feature.title}</h3>
                    <p className={landingBodySm}>{feature.description}</p>
                  </div>
                </article>
              </FadeIn>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
