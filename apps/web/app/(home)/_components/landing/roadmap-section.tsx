import { ROADMAP, WAITLIST_FORM_ID } from '@/app/(home)/_components/landing/content'
import { FadeIn, Stagger, StaggerItem } from '@/app/(home)/_components/landing/fade-in'
import styles from '@/app/(home)/_components/landing/landing.module.css'
import { SectionHeader } from '@/app/(home)/_components/landing/section-header'
import { Button } from '@/components/ui/button'

export function RoadmapSection() {
  return (
    <section id="early-access" className="scroll-mt-20 border-t border-border py-16 sm:py-24">
      <div className={styles.section}>
        <FadeIn>
          <SectionHeader
            eyebrow={ROADMAP.eyebrow}
            title={ROADMAP.title}
            description={ROADMAP.description}
            align="center"
          />
        </FadeIn>

        <Stagger className={`${styles.roadmapGrid} mt-12`}>
          {ROADMAP.items.map(item => (
            <StaggerItem key={item.title} className={styles.roadmapItem}>
              <p className="text-sm font-medium tracking-tight">{item.title}</p>
              <span className={styles.roadmapPill}>
                {item.status === 'shipping' ? 'At launch' : item.status}
              </span>
            </StaggerItem>
          ))}
        </Stagger>

        <FadeIn delay={0.1} className="mt-10 flex justify-center">
          <Button size="lg" className="h-11 px-6 font-medium" asChild>
            <a href={`#${WAITLIST_FORM_ID}`}>Join the waitlist</a>
          </Button>
        </FadeIn>
      </div>
    </section>
  )
}
