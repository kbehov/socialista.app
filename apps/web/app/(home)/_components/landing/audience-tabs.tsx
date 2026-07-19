'use client'

import { AUDIENCES, type AudienceId } from '@/app/(home)/_components/landing/content'
import { FadeIn } from '@/app/(home)/_components/landing/fade-in'
import styles from '@/app/(home)/_components/landing/landing.module.css'
import { SectionHeader } from '@/app/(home)/_components/landing/section-header'
import { MockupAds } from '@/app/(home)/_components/landing/showcase-mockups/mockup-ads'
import { MockupCalendar } from '@/app/(home)/_components/landing/showcase-mockups/mockup-calendar'
import { MockupImages } from '@/app/(home)/_components/landing/showcase-mockups/mockup-images'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function AudienceVisual({ id }: { id: AudienceId }) {
  switch (id) {
    case 'agencies':
      return <MockupCalendar />
    case 'ecommerce':
      return <MockupAds />
    case 'business':
      return <MockupCalendar />
    case 'creators':
    default:
      return <MockupImages />
  }
}

export function AudienceTabs() {
  return (
    <section id="audiences" className="scroll-mt-20 border-t border-border py-16 sm:py-24">
      <div className={styles.section}>
        <FadeIn>
          <SectionHeader
            eyebrow="Who it is for"
            title="Built for the people who ship content"
            description="Whether you create solo or run brands at scale — Socialista fits how you work."
            align="center"
          />
        </FadeIn>

        <FadeIn delay={0.08} className="mt-12">
          <Tabs defaultValue="creators">
            <TabsList variant="line" className="mx-auto flex w-full max-w-xl flex-wrap justify-center">
              {AUDIENCES.map(audience => (
                <TabsTrigger key={audience.id} value={audience.id} className="text-sm">
                  {audience.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {AUDIENCES.map(audience => (
              <TabsContent key={audience.id} value={audience.id} className="mt-8">
                <div className={styles.audiencePanel}>
                  <div>
                    <h3 className="text-xl font-medium tracking-tight text-balance sm:text-2xl">
                      {audience.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-[0.9375rem]">
                      {audience.description}
                    </p>
                    <ul className={styles.audiencePoints}>
                      {audience.points.map(point => (
                        <li key={point} className={styles.audiencePoint}>
                          <span className={styles.audiencePointDot} aria-hidden="true" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="min-w-0">
                    <AudienceVisual id={audience.id} />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </FadeIn>
      </div>
    </section>
  )
}
