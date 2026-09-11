import { STUDIO_CARDS, STUDIO_INDEX } from './content'
import { FadeIn } from './fade-in'
import { landingEyebrow } from './landing-classes'
import { IMG, VIDEO } from './media'
import { MediaFrame } from './media-frame'
import { Section } from './section'
import { SectionHeader } from './section-header'

const CARD_MEDIA: Record<(typeof STUDIO_CARDS)[number]['id'], { src: string; video?: string }> = {
  images: { src: IMG.fashion2 },
  videos: { src: IMG.p5, video: VIDEO.beach },
  slideshows: { src: IMG.lifestyle },
  ads: { src: IMG.watch },
  influencers: { src: IMG.p1 },
  ugc: { src: IMG.p8, video: VIDEO.tea },
}

export function StudioIndex() {
  return (
    <Section id="studio" border alt>
      <FadeIn>
        <SectionHeader
          eyebrow={STUDIO_INDEX.eyebrow}
          title={STUDIO_INDEX.title}
          description={STUDIO_INDEX.description}
        />
      </FadeIn>

      <div className="mt-10 grid gap-[0.85rem] sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {STUDIO_CARDS.map((card, index) => {
          const media = CARD_MEDIA[card.id]
          return (
            <FadeIn key={card.id} delay={index * 0.04}>
              <a
                href={card.href}
                className="flex flex-col overflow-hidden rounded-[calc(var(--radius)+8px)] border border-border bg-background text-inherit no-underline transition-[transform,border-color,box-shadow] duration-[180ms] ease-out hover:-translate-y-0.5 hover:border-[color-mix(in_oklch,var(--foreground)_16%,var(--border))] hover:shadow-[0_18px_40px_-28px_color-mix(in_oklch,var(--foreground)_22%,transparent)] active:scale-[0.985] motion-reduce:transform-none motion-reduce:hover:transform-none"
              >
                <MediaFrame
                  src={media.src}
                  video={media.video}
                  className="relative aspect-[16/11]"
                  sizes="(max-width: 768px) 100vw, 360px"
                />
                <div className="flex flex-col gap-[0.35rem] px-[1.1rem] pt-4 pb-[1.15rem]">
                  <p className={landingEyebrow}>{card.label}</p>
                  <p className="text-[0.975rem] font-medium tracking-tight">{card.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{card.description}</p>
                </div>
              </a>
            </FadeIn>
          )
        })}
      </div>
    </Section>
  )
}
