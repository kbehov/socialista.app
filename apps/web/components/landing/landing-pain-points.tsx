import { ArrowRight } from 'lucide-react'

import { PAIN_POINTS } from './content'
import { FadeIn } from './fade-in'
import styles from './landing.module.css'
import { Section } from './section'
import { SectionHeader } from './section-header'

export function LandingPainPoints() {
  return (
    <Section border className={styles.painSection}>
      <FadeIn>
        <SectionHeader
          eyebrow={PAIN_POINTS.eyebrow}
          title={PAIN_POINTS.title}
          description={PAIN_POINTS.description}
          align="center"
        />
      </FadeIn>

      <div className={`${styles.painGrid} mt-12 sm:mt-14`}>
        {PAIN_POINTS.items.map((item, index) => (
          <FadeIn key={item.pain} delay={index * 0.05}>
            <article className={styles.painCard}>
              <p className={styles.painLabel}>Before</p>
              <p className={styles.painText}>{item.pain}</p>
              <div className={styles.painDivider} aria-hidden="true">
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </div>
              <p className={styles.solutionLabel}>With Socialista</p>
              <p className={styles.solutionText}>{item.solution}</p>
            </article>
          </FadeIn>
        ))}
      </div>
    </Section>
  )
}
