import { Marquee } from '@/components/ui/marquee'
import { cn } from '@/lib/utils'
import { getStaticAdTemplates } from '@/services/static-ad-templates.service'
import Image from 'next/image'
import type { ReactNode } from 'react'

import { STUDIO_BENTO } from './content'
import { FadeIn } from './fade-in'
import { landingBody, landingContentGap, landingEyebrow, landingH2, landingMediaCard } from './landing-classes'
import { GALLERY_FALLBACK, IMG, VIDEO } from './media'
import { Section } from './section'
import { StudioTitleFire } from './studio-title-fire'
import { UgcClip } from './ugc-clip'

const bentoCard =
  'flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[color-mix(in_oklch,var(--foreground)_6%,var(--border))] bg-background shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground)_4%,transparent),0_12px_32px_-12px_color-mix(in_oklch,var(--foreground)_10%,transparent)]'

const bentoVisual =
  'relative mx-5 mt-5 h-[18.75rem] overflow-hidden rounded-[1.25rem] bg-[color-mix(in_oklch,var(--muted)_55%,var(--background))] sm:mx-6 sm:mt-6 sm:h-[20rem]'

const bentoVisualFade = 'from-[color-mix(in_oklch,var(--muted)_55%,var(--background))]'

const SLIDESHOW_MOCK_IMAGES = [
  IMG.slideshow,
  IMG.studioImages,
  IMG.canvasLifestyle,
  IMG.adStillAlt,
  IMG.canvasFashion,
  IMG.canvasSkincare,
] as const

const AD_TEMPLATE_LIMIT = 10

type AdItem = { id: string; imageUrl: string }

function BentoCard({
  title,
  description,
  children,
  delay = 0,
}: {
  title: string
  description: string
  children: ReactNode
  delay?: number
}) {
  return (
    <FadeIn delay={delay} className="h-full">
      <article className={bentoCard}>
        <div className={bentoVisual}>{children}</div>
        <div className="flex flex-1 flex-col p-6 pt-5 sm:p-7 sm:pt-6">
          <h3 className="text-lg font-semibold leading-[1.3] tracking-[-0.02em] sm:text-xl">{title}</h3>
          <p className="mt-2.5 text-[0.9375rem] leading-[1.6] text-pretty text-muted-foreground">{description}</p>
        </div>
      </article>
    </FadeIn>
  )
}

function UgcCardVisual() {
  return (
    <UgcClip
      poster={IMG.influencer}
      video={VIDEO.influencerDemo}
      alt="UGC talking clip generated in Socialista"
      className="relative h-full w-full border-0 bg-transparent shadow-none"
      sizes="(max-width: 768px) 33vw, 360px"
      priority
    />
  )
}

function SlideshowCardVisual() {
  return (
    <div className="flex h-full items-center p-4 sm:p-5">
      <div className="grid h-full w-full grid-cols-3 grid-rows-2 gap-2 sm:gap-2.5">
        {SLIDESHOW_MOCK_IMAGES.map((src, index) => (
          <div
            key={`slide-${index}`}
            className={cn(
              landingMediaCard,
              'min-h-0 border-0 shadow-[0_2px_8px_-2px_color-mix(in_oklch,var(--foreground)_12%,transparent)]',
            )}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 768px) 80px, 100px"
              className="object-cover"
              priority={index < 3}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function AdMarqueeItem({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="relative w-full shrink-0">
      <div
        className={cn(
          landingMediaCard,
          'aspect-[4/5] w-full border-0 shadow-[0_2px_8px_-2px_color-mix(in_oklch,var(--foreground)_12%,transparent)]',
        )}
      >
        <Image src={imageUrl} alt="" fill sizes="(max-width: 768px) 140px, 160px" className="object-cover" />
      </div>
    </div>
  )
}

function StaticAdsCardVisual({ items }: { items: AdItem[] }) {
  const columnA = items.filter((_, index) => index % 2 === 0)
  const columnB = items.filter((_, index) => index % 2 === 1)

  return (
    <div className="relative h-full">
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b to-transparent',
          bentoVisualFade,
        )}
      />
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t to-transparent',
          bentoVisualFade,
        )}
      />

      <div className="flex h-full gap-2 px-3 py-3 sm:gap-2.5 sm:px-4 sm:py-4">
        <Marquee
          vertical
          pauseOnHover
          repeat={3}
          className="h-full min-w-0 flex-1 [--duration:28s] [--gap:0.625rem] p-0"
        >
          {columnA.map(item => (
            <AdMarqueeItem key={item.id} imageUrl={item.imageUrl} />
          ))}
        </Marquee>
        <Marquee
          vertical
          reverse
          pauseOnHover
          repeat={3}
          className="h-full min-w-0 flex-1 [--duration:32s] [--gap:0.625rem] p-0"
        >
          {columnB.map(item => (
            <AdMarqueeItem key={`${item.id}-b`} imageUrl={item.imageUrl} />
          ))}
        </Marquee>
      </div>
    </div>
  )
}

async function loadAdItems(): Promise<AdItem[]> {
  const fallback = GALLERY_FALLBACK.map((imageUrl, index) => ({
    id: `fallback-${index}`,
    imageUrl,
  }))

  try {
    const response = await getStaticAdTemplates({
      limit: AD_TEMPLATE_LIMIT,
      sort: '-createdAt',
    })
    const templates = response.data?.templates
    if (response.success && templates && templates.length > 0) {
      return templates.map(template => ({
        id: template._id,
        imageUrl: template.imageUrl,
      }))
    }
  } catch {
    // Keep Unsplash fallback.
  }

  return fallback
}

export async function LandingStudio() {
  const adItems = await loadAdItems()
  const [ugcCard, slideshowCard, adsCard] = STUDIO_BENTO.cards

  return (
    <Section id="studio" border>
      <FadeIn>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <hgroup className="max-w-2xl">
            <p className={landingEyebrow}>{STUDIO_BENTO.eyebrow}</p>
            <h2 id="studio-heading" className={cn(landingH2, 'mt-3')}>
              <StudioTitleFire emoji={STUDIO_BENTO.titleEmoji} className="mr-2 sm:mr-2.5" />
              {STUDIO_BENTO.title}
            </h2>
            <p className={cn(landingBody, 'mt-4 sm:mt-5')}>{STUDIO_BENTO.description}</p>
          </hgroup>

          <aside className="lg:max-w-md lg:shrink-0 lg:pb-1" aria-label={STUDIO_BENTO.usedByLabel}>
            <p className="text-sm font-medium text-muted-foreground">{STUDIO_BENTO.usedByLabel}</p>
            <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
              {STUDIO_BENTO.usedBy.map(({ emoji, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklch,var(--foreground)_8%,var(--border))] bg-background px-3 py-1.5 text-[0.6875rem] font-medium tracking-[-0.01em] text-muted-foreground"
                >
                  <span aria-hidden="true" className="text-[0.8125rem] leading-none">
                    {emoji}
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </FadeIn>

      <ul className={cn(landingContentGap, 'grid list-none items-stretch gap-4 p-0 sm:gap-5 lg:grid-cols-3 lg:gap-6')}>
        <li className="h-full min-h-0">
          <BentoCard title={ugcCard.title} description={ugcCard.description} delay={0.04}>
            <UgcCardVisual />
          </BentoCard>
        </li>
        <li className="h-full min-h-0">
          <BentoCard title={slideshowCard.title} description={slideshowCard.description} delay={0.08}>
            <SlideshowCardVisual />
          </BentoCard>
        </li>
        <li className="h-full min-h-0">
          <BentoCard title={adsCard.title} description={adsCard.description} delay={0.12}>
            <StaticAdsCardVisual items={adItems} />
          </BentoCard>
        </li>
      </ul>
    </Section>
  )
}
