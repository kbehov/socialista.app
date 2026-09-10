'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { STUDIO_TABS, type StudioTabId } from './content'
import { FadeIn } from './fade-in'
import styles from './landing.module.css'
import { MockupAds } from './mockups/mockup-ads'
import { MockupImages } from './mockups/mockup-images'
import { MockupInfluencers } from './mockups/mockup-influencers'
import { MockupSlideshows } from './mockups/mockup-slideshows'
import { MockupUgc } from './mockups/mockup-ugc'
import { MockupVideo } from './mockups/mockup-video'
import { Section } from './section'
import { SectionHeader } from './section-header'

function StudioPreview({ tabId }: { tabId: StudioTabId }) {
  switch (tabId) {
    case 'ads':
      return <MockupAds />
    case 'slideshows':
      return <MockupSlideshows />
    case 'video':
      return <MockupVideo />
    case 'influencers':
      return <MockupInfluencers />
    case 'ugc':
      return <MockupUgc />
    case 'images':
    default:
      return <MockupImages />
  }
}

export function StudioTour() {
  const [activeId, setActiveId] = useState<StudioTabId>('images')
  const active = STUDIO_TABS.find(t => t.id === activeId) ?? STUDIO_TABS[0]

  return (
    <Section id="studio" border>
      <FadeIn>
        <SectionHeader
          eyebrow="Studio"
          title="Create every format in one place"
          description="Images, ads, carousels, video, influencers, and UGC — without switching tools."
        />
      </FadeIn>

      <div className="mt-12 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
        <FadeIn>
          <div className={styles.tabList} role="tablist" aria-label="Studio areas">
            {STUDIO_TABS.map(tab => (
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
                    layoutId="studio-tab-indicator"
                    className={styles.tabIndicator}
                    style={{ left: '1rem', right: '1rem' }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                  />
                ) : null}
              </button>
            ))}
          </div>

          <div className="mt-8 lg:mt-10">
            <h3 className="text-xl font-medium tracking-tight">{active.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{active.description}</p>
          </div>
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
              <StudioPreview tabId={activeId} />
            </motion.div>
          </AnimatePresence>
        </FadeIn>
      </div>
    </Section>
  )
}
