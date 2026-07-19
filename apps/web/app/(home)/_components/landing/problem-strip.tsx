import { PROBLEM } from '@/app/(home)/_components/landing/content'
import { FadeIn } from '@/app/(home)/_components/landing/fade-in'
import styles from '@/app/(home)/_components/landing/landing.module.css'
import { SectionHeader } from '@/app/(home)/_components/landing/section-header'
import { ArrowDown, Sparkles } from 'lucide-react'

export function ProblemStrip() {
  return (
    <section className={`${styles.sectionAlt} border-t border-border py-16 sm:py-20`}>
      <div className={styles.section}>
        <FadeIn>
          <SectionHeader
            eyebrow={PROBLEM.eyebrow}
            title={PROBLEM.title}
            description={PROBLEM.description}
            align="center"
          />
        </FadeIn>

        <FadeIn delay={0.08} className="mt-10">
          <div className={`${styles.problemTools} justify-center`}>
            {PROBLEM.tools.map(tool => (
              <span key={tool} className={styles.problemTool}>
                {tool}
              </span>
            ))}
          </div>

          <div className={styles.problemArrow} aria-hidden="true">
            <ArrowDown className="size-4 opacity-40" strokeWidth={1.5} />
          </div>

          <p className="text-center">
            <span className={styles.problemSolution}>
              <Sparkles className="size-3.5" strokeWidth={1.75} />
              {PROBLEM.solution}
            </span>
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
