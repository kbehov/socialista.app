import { cn } from '@/lib/utils'

import { FEATURES_BENTO, type FeatureBentoId } from './content'
import { FeatureBentoMockup } from './feature-bento-mockups'
import { FadeIn } from './fade-in'
import {
  landingContentGap,
  landingFeatureCaptionBody,
  landingFeatureCaptionTitle,
  landingMediaPanel,
} from './landing-classes'
import { Section } from './section'
import { LandingSectionIntro } from './section-header'

const GRID_SPAN: Record<FeatureBentoId, string> = {
  scheduling: 'sm:col-span-2 lg:col-span-7',
  analytics: 'sm:col-span-2 lg:col-span-5',
  'video-editor': 'lg:col-span-4',
  'slideshow-editor': 'lg:col-span-4',
  'image-generation': 'lg:col-span-4',
  'short-videos': 'sm:col-span-2 lg:col-span-5',
  'context-skills': 'sm:col-span-2 lg:col-span-7',
}

const PANEL_MIN_H: Record<FeatureBentoId, string> = {
  scheduling: 'min-h-[17rem] sm:min-h-[19rem]',
  analytics: 'min-h-[15rem] sm:min-h-[17rem]',
  'video-editor': 'min-h-[16rem] sm:min-h-[18rem]',
  'slideshow-editor': 'min-h-[16rem] sm:min-h-[18rem]',
  'image-generation': 'min-h-[16rem] sm:min-h-[18rem]',
  'short-videos': 'min-h-[16rem] sm:min-h-[18rem]',
  'context-skills': 'min-h-[15rem] sm:min-h-[17rem]',
}

const featurePanel = cn(landingMediaPanel, 'flex w-full flex-col')

function FeatureCaption({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-0.5">
      <h3 className={landingFeatureCaptionTitle}>{title}</h3>
      <p className={landingFeatureCaptionBody}>{description}</p>
    </div>
  )
}

function FeatureBentoItem({
  id,
  title,
  description,
  index,
}: {
  id: FeatureBentoId
  title: string
  description: string
  index: number
}) {
  return (
    <FadeIn delay={index * 0.04} className={cn('min-w-0', GRID_SPAN[id])}>
      <div className="flex h-full flex-col gap-5">
        <article
          className={cn(featurePanel, PANEL_MIN_H[id])}
          aria-hidden="true"
        >
          <FeatureBentoMockup id={id} />
        </article>
        <FeatureCaption title={title} description={description} />
      </div>
    </FadeIn>
  )
}

export function LandingFeatures() {
  return (
    <Section id="features" landingDivider>
      <FadeIn>
        <LandingSectionIntro
          titleId="features-heading"
          eyebrow={FEATURES_BENTO.eyebrow}
          title={FEATURES_BENTO.title}
          description={FEATURES_BENTO.description}
        />
      </FadeIn>

      <div
        className={cn(
          landingContentGap,
          'grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-12',
        )}
      >
        {FEATURES_BENTO.items.map((item, index) => (
          <FeatureBentoItem
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            index={index}
          />
        ))}
      </div>
    </Section>
  )
}
