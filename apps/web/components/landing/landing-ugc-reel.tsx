import { UGC_REEL } from "./content";
import { FadeIn } from "./fade-in";
import { landingContentGap, landingMediaCard } from "./landing-classes";
import { UGC_CLIPS } from "./media";
import { Section } from "./section";
import { SectionHeader } from "./section-header";
import { UgcClip } from "./ugc-clip";

export function LandingUgcReel() {
  return (
    <Section id="ugc" border alt>
      <FadeIn>
        <SectionHeader
          title={UGC_REEL.title}
          description={UGC_REEL.description}
          align="center"
        />
      </FadeIn>
      <div
        className={`${landingContentGap} grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 sm:gap-4`}
      >
        {UGC_CLIPS.map((clip, index) => (
          <FadeIn key={clip.id} delay={Math.min(index, 8) * 0.03}>
            <UgcClip
              poster={clip.poster}
              video={clip.video}
              className={`${landingMediaCard} aspect-[9/16]`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 180px"
            />
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}
