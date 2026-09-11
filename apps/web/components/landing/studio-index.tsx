import { STUDIO_CARDS, STUDIO_INDEX } from './content'
import { FadeIn } from './fade-in'
import styles from './landing.module.css'
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

      <div className={`${styles.studioGrid} mt-10 sm:mt-12`}>
        {STUDIO_CARDS.map((card, index) => {
          const media = CARD_MEDIA[card.id]
          return (
            <FadeIn key={card.id} delay={index * 0.04}>
              <a href={card.href} className={styles.studioCard}>
                <MediaFrame
                  src={media.src}
                  video={media.video}
                  className={styles.studioCardMedia}
                  sizes="(max-width: 768px) 100vw, 360px"
                />
                <div className={styles.studioCardBody}>
                  <p className={styles.eyebrow}>{card.label}</p>
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
