import { AUDIENCE } from "./content";
import { FadeIn } from "./fade-in";
import {
  landingBodySm,
  landingCard,
  landingContentGap,
  landingH3,
  landingMediaCard,
} from "./landing-classes";
import { IMG } from "./media";
import { MediaFrame } from "./media-frame";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

const PERSONA_MEDIA = {
  creators: IMG.personaCreators,
  agencies: IMG.personaAgencies,
  growth: IMG.personaGrowth,
} as const;

export function LandingAudience() {
  return (
    <Section border>
      <FadeIn>
        <SectionHeader
          title={AUDIENCE.title}
          description={AUDIENCE.description}
          align="center"
        />
      </FadeIn>
      <div
        className={`${landingContentGap} grid gap-3 sm:grid-cols-3 sm:gap-4`}
      >
        {AUDIENCE.personas.map((persona, index) => (
          <FadeIn key={persona.id} delay={index * 0.04}>
            <article className={`${landingCard} overflow-hidden`}>
              <MediaFrame
                src={PERSONA_MEDIA[persona.id]}
                className={`${landingMediaCard} rounded-none border-0 shadow-none aspect-[16/10]`}
                sizes="(max-width: 768px) 100vw, 360px"
                objectPosition="50% 30%"
              />
              <div className="flex flex-col gap-2 p-5 sm:p-6">
                <h3 className={landingH3}>{persona.title}</h3>
                <p className={landingBodySm}>{persona.description}</p>
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}
