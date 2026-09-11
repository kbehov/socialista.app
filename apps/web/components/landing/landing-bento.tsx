import { BENTO } from './content'
import { FadeIn } from './fade-in'
import styles from './landing.module.css'
import { IMG, VIDEO } from './media'
import { MediaFrame } from './media-frame'
import { MockupAnalytics } from './mockups/mockup-analytics'
import { MockupComposer } from './mockups/mockup-composer'
import { Section } from './section'
import { SectionHeader } from './section-header'

function CreateVisual() {
  return (
    <div className={styles.bentoMasonry} aria-hidden="true">
      <MediaFrame src={IMG.fashion2} className={`${styles.mediaCard} ${styles.bentoMasonryA}`} sizes="280px" />
      <MediaFrame src={IMG.watch} className={`${styles.mediaCard} ${styles.bentoMasonryB}`} sizes="200px" />
      <MediaFrame
        src={IMG.p5}
        video={VIDEO.beach}
        className={`${styles.mediaCard} ${styles.bentoMasonryC}`}
        sizes="200px"
      />
      <MediaFrame src={IMG.skincare} className={`${styles.mediaCard} ${styles.bentoMasonryD}`} sizes="200px" />
    </div>
  )
}

export function LandingBento() {
  const cells = BENTO.cells

  return (
    <Section id="platform" border>
      <FadeIn>
        <SectionHeader
          eyebrow={BENTO.eyebrow}
          title={BENTO.title}
          description={BENTO.description}
          align="center"
        />
      </FadeIn>

      <div className={`${styles.bentoGrid} mt-12 sm:mt-14`}>
        <FadeIn className={styles.bentoCellLarge}>
          <article className={styles.bentoCard}>
            <div className={styles.bentoCardCopy}>
              <p className={styles.eyebrow}>{cells[0].label}</p>
              <h3 className={styles.bentoTitle}>{cells[0].title}</h3>
              <p className={styles.bentoDescription}>{cells[0].description}</p>
            </div>
            <div className={styles.bentoCardVisual}>
              <CreateVisual />
            </div>
          </article>
        </FadeIn>

        <FadeIn delay={0.04} className={styles.bentoCellMedium}>
          <article className={styles.bentoCard}>
            <div className={styles.bentoCardCopy}>
              <p className={styles.eyebrow}>{cells[1].label}</p>
              <h3 className={styles.bentoTitle}>{cells[1].title}</h3>
              <p className={styles.bentoDescription}>{cells[1].description}</p>
            </div>
            <div className={styles.bentoCardVisualCompact}>
              <MockupComposer />
            </div>
          </article>
        </FadeIn>

        <FadeIn delay={0.06} className={styles.bentoCellMedium}>
          <article className={styles.bentoCard}>
            <div className={styles.bentoCardCopy}>
              <p className={styles.eyebrow}>{cells[2].label}</p>
              <h3 className={styles.bentoTitle}>{cells[2].title}</h3>
              <p className={styles.bentoDescription}>{cells[2].description}</p>
            </div>
            <div className={styles.bentoCardVisualCompact}>
              <MockupAnalytics />
            </div>
          </article>
        </FadeIn>

        <FadeIn delay={0.08} className={styles.bentoCellSmall}>
          <article className={`${styles.bentoCard} ${styles.bentoCardCompact}`}>
            <p className={styles.eyebrow}>{cells[3].label}</p>
            <h3 className={styles.bentoTitle}>{cells[3].title}</h3>
            <p className={styles.bentoDescription}>{cells[3].description}</p>
          </article>
        </FadeIn>

        <FadeIn delay={0.1} className={styles.bentoCellSmall}>
          <article className={`${styles.bentoCard} ${styles.bentoCardCompact}`}>
            <p className={styles.eyebrow}>{cells[4].label}</p>
            <h3 className={styles.bentoTitle}>{cells[4].title}</h3>
            <p className={styles.bentoDescription}>{cells[4].description}</p>
          </article>
        </FadeIn>
      </div>
    </Section>
  )
}
