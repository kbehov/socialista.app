import { OUTCOMES } from './content'
import { FadeIn } from './fade-in'
import styles from './landing.module.css'
import { Section } from './section'
import { SectionHeader } from './section-header'

export function LandingOutcomes() {
  return (
    <Section id="outcomes" border alt>
      <FadeIn>
        <SectionHeader
          eyebrow={OUTCOMES.eyebrow}
          title={OUTCOMES.title}
          description={OUTCOMES.description}
          align="center"
        />
      </FadeIn>

      <div className={`${styles.outcomesGrid} mt-12 sm:mt-14`}>
        {OUTCOMES.stats.map((stat, index) => (
          <FadeIn key={stat.label} delay={index * 0.05}>
            <div className={styles.outcomeCard}>
              <div className={styles.outcomeValue}>
                <span className={styles.outcomeNumber}>{stat.value}</span>
                {stat.unit ? <span className={styles.outcomeUnit}>{stat.unit}</span> : null}
              </div>
              <p className={styles.outcomeLabel}>{stat.label}</p>
              <p className={styles.outcomeDescription}>{stat.description}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  )
}
