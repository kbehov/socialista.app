import { cn } from '@/lib/utils'

import { FEATURES_BENTO, type FeatureBentoId } from './content'
import { FeatureBentoMockup } from './feature-bento-mockups'
import { FadeIn } from './fade-in'
import {
  landingContentGap,
  landingFeatureCaptionBody,
  landingFeatureCaptionTitle,
  landingMediaCardHover,
  landingMediaPanel,
} from './landing-classes'
import { Section } from './section'
import { LandingSectionIntro } from './section-header'

/** 12-col rows: publish → video → carousels, stills, and context */
const BENTO_ROWS: FeatureBentoId[][] = [
  ['scheduling', 'analytics'],
  ['short-videos', 'video-editor'],
  ['slideshow-editor', 'image-generation', 'context-skills'],
]

const GRID_SPAN: Record<FeatureBentoId, string> = {
  scheduling: 'sm:col-span-2 lg:col-span-7',
  analytics: 'sm:col-span-2 lg:col-span-5',
  'short-videos': 'sm:col-span-2 lg:col-span-6',
  'video-editor': 'sm:col-span-2 lg:col-span-6',
  'slideshow-editor': 'lg:col-span-4',
  'image-generation': 'lg:col-span-4',
  'context-skills': 'sm:col-span-2 lg:col-span-4',
}

const PANEL_MIN_H: Record<FeatureBentoId, string> = {
  scheduling: 'min-h-[18rem] sm:min-h-[20rem] lg:min-h-[21rem]',
  analytics: 'min-h-[18rem] sm:min-h-[20rem] lg:min-h-[21rem]',
  'short-videos': 'min-h-[17rem] sm:min-h-[19rem] lg:min-h-[20rem]',
  'video-editor': 'min-h-[17rem] sm:min-h-[19rem] lg:min-h-[20rem]',
  'slideshow-editor': 'min-h-[16rem] sm:min-h-[18rem] lg:min-h-[19rem]',
  'image-generation': 'min-h-[16rem] sm:min-h-[18rem] lg:min-h-[19rem]',
  'context-skills': 'min-h-[16rem] sm:min-h-[18rem] lg:min-h-[19rem]',
}

const featurePanel = cn(
  landingMediaPanel,
  landingMediaCardHover,
  'isolate flex w-full flex-col',
  'shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_28px_56px_-32px_rgba(0,0,0,0.72)]',
  'before:pointer-events-none before:absolute before:inset-0 before:z-[2] before:rounded-[inherit]',
  'before:bg-[radial-gradient(ellipse_85%_55%_at_50%_-8%,rgba(255,255,255,0.09),transparent_58%)]',
  'after:pointer-events-none after:absolute after:inset-0 after:z-[2] after:rounded-[inherit]',
  'after:ring-1 after:ring-inset after:ring-white/[0.06]',
)

const itemsById = Object.fromEntries(FEATURES_BENTO.items.map(item => [item.id, item])) as Record<
  FeatureBentoId,
  (typeof FEATURES_BENTO.items)[number]
>

function FeatureCaption({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-0.5 transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover/panel:translate-y-[-1px]">
      <h3
        className={cn(
          landingFeatureCaptionTitle,
          'transition-colors duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover/panel:text-[color-mix(in_oklch,var(--landing-ink)_92%,var(--landing-orange))]',
        )}
      >
        {title}
      </h3>
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
      <div className="group/panel flex h-full flex-col gap-5 sm:gap-6">
        <article
          className={cn(featurePanel, PANEL_MIN_H[id], 'flex-1')}
          aria-hidden="true"
        >
          <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
            <FeatureBentoMockup id={id} />
          </div>
        </article>
        <FeatureCaption title={title} description={description} />
      </div>
    </FadeIn>
  )
}

const BENTO_STAGGER_ORDER = BENTO_ROWS.flat()

export function LandingFeatures() {
  return (
    <Section id="features" landingDivider>
      <FadeIn>
        <LandingSectionIntro
          titleId="features-heading"
          eyebrow={FEATURES_BENTO.eyebrow}
          title={FEATURES_BENTO.title}
          titleAccent={FEATURES_BENTO.titleAccent}
          description={FEATURES_BENTO.description}
        />
      </FadeIn>

      <div className={cn(landingContentGap, 'flex flex-col gap-12 sm:gap-14 lg:gap-16')}>
        {BENTO_ROWS.map(rowIds => (
          <div
            key={rowIds.join('-')}
            className="grid grid-cols-1 gap-x-6 gap-y-11 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-0"
          >
            {rowIds.map(id => {
              const item = itemsById[id]
              const index = BENTO_STAGGER_ORDER.indexOf(id)
              return (
                <FeatureBentoItem
                  key={id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  index={index}
                />
              )
            })}
          </div>
        ))}
      </div>
    </Section>
  )
}
