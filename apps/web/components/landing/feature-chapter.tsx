import type { ReactNode } from 'react'

import { FadeIn } from './fade-in'
import styles from './landing.module.css'
import { Section } from './section'
import { SectionHeader } from './section-header'

type FeaturePoint = {
  title: string
  description: string
}

type FeatureChapterProps = {
  id: string
  eyebrow: string
  title: string
  description: string
  points: readonly FeaturePoint[]
  visual: ReactNode
  reverse?: boolean
  alt?: boolean
}

export function FeatureChapter({
  id,
  eyebrow,
  title,
  description,
  points,
  visual,
  reverse = false,
  alt = false,
}: FeatureChapterProps) {
  return (
    <Section id={id} border alt={alt}>
      <div className={reverse ? `${styles.featureChapter} ${styles.featureChapterReverse}` : styles.featureChapter}>
        <FadeIn className={styles.featureChapterCopy}>
          <SectionHeader eyebrow={eyebrow} title={title} description={description} />
          <ul className="mt-8 space-y-5">
            {points.map(point => (
              <li key={point.title} className={styles.featurePoint}>
                <span className={styles.featurePointIcon} aria-hidden="true">
                  <span className="size-1 rounded-full bg-foreground" />
                </span>
                <div>
                  <p className="font-medium">{point.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{point.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn delay={0.06} className={styles.featureChapterVisual}>
          {visual}
        </FadeIn>
      </div>
    </Section>
  )
}
