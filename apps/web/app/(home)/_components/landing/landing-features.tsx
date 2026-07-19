import { FEATURES } from '@/app/(home)/_components/landing/content'
import { FadeIn, Stagger, StaggerItem } from '@/app/(home)/_components/landing/fade-in'
import styles from '@/app/(home)/_components/landing/landing.module.css'
import { SectionHeader } from '@/app/(home)/_components/landing/section-header'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Clapperboard,
  Layers,
  Megaphone,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<(typeof FEATURES)[number]['icon'], LucideIcon> = {
  sparkles: Sparkles,
  megaphone: Megaphone,
  layers: Layers,
  clapperboard: Clapperboard,
  calendar: Calendar,
  users: Users,
}

export function LandingFeatures() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-border py-16 sm:py-24">
      <div className={styles.section}>
        <FadeIn>
          <SectionHeader
            eyebrow="Features"
            title="Everything to create and ship"
            description="AI generation, editors, and scheduling — designed to feel like one product, not a pile of plugins."
          />
        </FadeIn>

        <Stagger className={`${styles.featureGrid} mt-12`}>
          {FEATURES.map(feature => {
            const Icon = ICONS[feature.icon]
            return (
              <StaggerItem
                key={feature.id}
                className={cn(styles.featureCell, feature.span === 'lg' && styles.bentoLg)}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={styles.featureIcon}>
                    <Icon className="size-3.5" strokeWidth={1.75} />
                  </span>
                  <span className={styles.eyebrow}>{feature.tag}</span>
                </div>
                <h3 className="mt-5 text-lg font-medium tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{feature.description}</p>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>
    </section>
  )
}
