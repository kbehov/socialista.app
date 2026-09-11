import { WORKFLOW } from './content'
import { FadeIn } from './fade-in'
import styles from './landing.module.css'
import { Section } from './section'
import { SectionHeader } from './section-header'

export function LandingWorkflow() {
  return (
    <Section border alt>
      <FadeIn>
        <SectionHeader
          eyebrow={WORKFLOW.eyebrow}
          title={WORKFLOW.title}
          description={WORKFLOW.description}
          align="center"
        />
      </FadeIn>
      <FadeIn delay={0.05} className={`${styles.workflowList} mt-12 sm:mt-14`}>
        {WORKFLOW.steps.map(step => (
          <div key={step.n} className={styles.workflowItem}>
            <p className={styles.workflowN}>{step.n}</p>
            <h3 className="mt-3 text-lg font-semibold tracking-[-0.025em]">{step.title}</h3>
            <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </FadeIn>
    </Section>
  )
}
