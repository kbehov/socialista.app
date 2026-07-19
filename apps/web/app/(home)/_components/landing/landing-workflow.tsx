import { WORKFLOW_STEPS } from '@/app/(home)/_components/landing/content'
import { FadeIn, Stagger, StaggerItem } from '@/app/(home)/_components/landing/fade-in'
import styles from '@/app/(home)/_components/landing/landing.module.css'
import { SectionHeader } from '@/app/(home)/_components/landing/section-header'

export function LandingWorkflow() {
  return (
    <section className={`${styles.sectionAlt} border-t border-border py-16 sm:py-24`}>
      <div className={styles.section}>
        <FadeIn>
          <SectionHeader
            eyebrow="Workflow"
            title="From idea to scheduled post"
            description="A clear path from spark to publish — without switching tools mid-flow."
          />
        </FadeIn>

        <Stagger className={`${styles.workflowList} mt-12`}>
          {WORKFLOW_STEPS.map(step => (
            <StaggerItem key={step.step} className={styles.workflowItem}>
              <span className={styles.workflowStep}>{step.step}</span>
              <h3 className="mt-4 text-lg font-medium tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.description}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
