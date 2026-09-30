import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

import { FadeIn } from './fade-in'
import {
  landingSectionDark,
  landingWorkflowPanel,
  landingWorkflowPanelDark,
  type LandingStoryIndex,
} from './landing-classes'
import { Section } from './section'
import { LandingSectionIntro } from './section-header'

type WorkflowSectionContent = {
  eyebrow: string
  title: string
  titleAccent: string
  description: string
}

type LandingWorkflowSectionProps = {
  id: string
  storyIndex: LandingStoryIndex
  content: WorkflowSectionContent
  mockup: ReactNode
  /** Swap mockup column on large screens for visual rhythm */
  reverse?: boolean
  alt?: boolean
  panelTone?: 'light' | 'dark'
  /** Full-bleed dark band with light typography */
  sectionTone?: 'light' | 'dark'
}

export function LandingWorkflowSection({
  id,
  storyIndex,
  content,
  mockup,
  reverse = false,
  alt = false,
  panelTone = 'light',
  sectionTone = 'light',
}: LandingWorkflowSectionProps) {
  const isDarkSection = sectionTone === 'dark'
  const panelClass = isDarkSection
    ? 'rounded-[var(--landing-media-radius)] border border-white/[0.08]'
    : panelTone === 'dark'
      ? landingWorkflowPanelDark
      : landingWorkflowPanel
  return (
    <Section
      id={id}
      landingDivider
      alt={alt && !isDarkSection}
      className={cn(
        isDarkSection && landingSectionDark,
      )}
    >
      <div
        className={cn(
          'grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-0 xl:gap-x-14',
        )}
      >
        <FadeIn
          className={cn('lg:col-span-5', reverse && 'lg:col-start-8 lg:row-start-1')}
        >
          <LandingSectionIntro
            titleId={`${id}-heading`}
            storyIndex={storyIndex}
            eyebrow={content.eyebrow}
            eyebrowTone="accent"
            title={content.title}
            titleAccent={content.titleAccent}
            description={content.description}
            align="left"
            tone={sectionTone}
            className="mx-0 max-w-none text-left lg:max-w-[26rem]"
          />
        </FadeIn>

        <FadeIn
          delay={0.06}
          className={cn('min-w-0 lg:col-span-7', reverse && 'lg:col-start-1 lg:row-start-1')}
        >
          <div className={panelClass}>{mockup}</div>
        </FadeIn>
      </div>
    </Section>
  )
}
