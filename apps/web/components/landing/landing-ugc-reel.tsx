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
          titleId="ugc-heading"
          title={UGC_REEL.title}
          description={UGC_REEL.description}
          align="center"
        />
      </FadeIn>
      <ul
        className={`${landingContentGap} grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6`}
      >
        {UGC_CLIPS.map((clip, index) => (
          <li key={clip.id}>
            <FadeIn delay={Math.min(index, 8) * 0.03}>
              <UgcClip
                poster={clip.poster}
                video={clip.video}
                alt={`UGC talking clip example ${index + 1}`}
                className={`${landingMediaCard} aspect-[9/16]`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 180px"
              />
            </FadeIn>
          </li>
        ))}
      </ul>
    </Section>
  );
}
