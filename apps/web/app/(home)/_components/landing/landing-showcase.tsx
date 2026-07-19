'use client'

import { SHOWCASE_TABS, type ShowcaseTabId } from '@/app/(home)/_components/landing/content'
import { FadeIn } from '@/app/(home)/_components/landing/fade-in'
import styles from '@/app/(home)/_components/landing/landing.module.css'
import { SectionHeader } from '@/app/(home)/_components/landing/section-header'
import { MockupAds } from '@/app/(home)/_components/landing/showcase-mockups/mockup-ads'
import { MockupCalendar } from '@/app/(home)/_components/landing/showcase-mockups/mockup-calendar'
import { MockupCarousels } from '@/app/(home)/_components/landing/showcase-mockups/mockup-carousels'
import { MockupImages } from '@/app/(home)/_components/landing/showcase-mockups/mockup-images'
import { MockupVideo } from '@/app/(home)/_components/landing/showcase-mockups/mockup-video'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'

function ShowcasePreview({ tabId }: { tabId: ShowcaseTabId }) {
  switch (tabId) {
    case 'ads':
      return <MockupAds />
    case 'carousels':
      return <MockupCarousels />
    case 'video':
      return <MockupVideo />
    case 'schedule':
      return <MockupCalendar />
    case 'images':
    default:
      return <MockupImages />
  }
}

export function LandingShowcase() {
  const [activeId, setActiveId] = useState<ShowcaseTabId>('images')
  const tabListRef = useRef<HTMLDivElement>(null)
  const active = SHOWCASE_TABS.find(t => t.id === activeId) ?? SHOWCASE_TABS[0]

  return (
    <section id="product" className="scroll-mt-20 border-t border-border py-16 sm:py-24">
      <div className={styles.section}>
        <FadeIn>
          <SectionHeader
            eyebrow="Product"
            title="One workspace for creation and publishing"
            description="Move from concept to scheduled post without leaving the studio."
          />
        </FadeIn>

        <div className="mt-12 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
          <FadeIn>
            <div ref={tabListRef} className={styles.tabList} role="tablist" aria-label="Product areas">
              {SHOWCASE_TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeId === tab.id}
                  onClick={() => setActiveId(tab.id)}
                  className={cn(styles.tab, activeId === tab.id && styles.tabActive)}
                >
                  {tab.label}
                  {activeId === tab.id ? (
                    <motion.span
                      layoutId="showcase-tab-indicator"
                      className={styles.tabIndicator}
                      style={{ left: '1rem', right: '1rem' }}
                      transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                    />
                  ) : null}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 lg:mt-10"
              >
                <h3 className="text-xl font-medium tracking-tight">{active.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{active.description}</p>
              </motion.div>
            </AnimatePresence>
          </FadeIn>

          <FadeIn delay={0.08} className="mt-10 lg:mt-0" role="tabpanel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <ShowcasePreview tabId={activeId} />
              </motion.div>
            </AnimatePresence>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
