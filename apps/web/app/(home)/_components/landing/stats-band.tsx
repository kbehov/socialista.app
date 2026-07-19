import { STATS } from '@/app/(home)/_components/landing/content'
import { FadeIn, Stagger, StaggerItem } from '@/app/(home)/_components/landing/fade-in'
import styles from '@/app/(home)/_components/landing/landing.module.css'

export function StatsBand() {
  return (
    <section className="py-10 sm:py-14">
      <div className={styles.section}>
        <FadeIn>
          <Stagger className={styles.statsBand}>
            {STATS.map(stat => (
              <StaggerItem key={stat.label} className={styles.statsCell}>
                <p className={`${styles.statValue} text-3xl font-semibold sm:text-4xl`}>{stat.value}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{stat.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </FadeIn>
      </div>
    </section>
  )
}
