import {
  Captions,
  ChevronDown,
  Maximize2,
  Pencil,
  Shuffle,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import { UGC_ADS } from './content'
import { FadeIn } from './fade-in'
import { LandingUgcFormatsList } from './landing-ugc-formats-list'
import {
  landingFeatureCaptionBody,
  landingFeatureCaptionTitle,
  landingMediaPanel,
} from './landing-classes'
import { IMG, VIDEO } from './media'
import { Section } from './section'
import { LandingSectionIntro } from './section-header'

const glass =
  'border border-white/18 bg-white/[0.12] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_12px_40px_-16px_rgba(0,0,0,0.55)] backdrop-blur-xl'

const glassBadge =
  `${glass} h-auto rounded-xl px-2 py-0.5 text-[0.6875rem] font-medium leading-4 tracking-[-0.01em] text-white/90 shadow-none hover:bg-white/[0.12] hover:text-white`

const featureCard = cn(landingMediaPanel, 'flex min-h-[22rem] flex-col sm:min-h-[26rem] lg:min-h-[27.5rem]')

const shapeVideoCard = cn(landingMediaPanel, 'flex min-h-[22rem] flex-col bg-black sm:min-h-[26rem] lg:min-h-[27.5rem]')

export function LandingUgcAds() {
  return (
    <Section id="ugc-ads" landingDivider>
      <FadeIn>
        <LandingSectionIntro
          titleId="ugc-ads-heading"
          title={UGC_ADS.title}
          titleAccent={UGC_ADS.titleAccent}
          description={UGC_ADS.description}
        />
      </FadeIn>

      <div className="mt-10 grid gap-8 sm:mt-12 lg:grid-cols-3 lg:gap-6 xl:gap-8">
        <FadeIn delay={0.04}>
          <FeatureColumn>
            <CreatorCard />
          </FeatureColumn>
        </FadeIn>
        <FadeIn delay={0.08}>
          <FeatureColumn>
            <ShapeCard />
          </FeatureColumn>
        </FadeIn>
        <FadeIn delay={0.12}>
          <FeatureColumn>
            <FormatsCard />
          </FeatureColumn>
        </FadeIn>
      </div>
    </Section>
  )
}

function FeatureColumn({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-5">{children}</div>
}

function FeatureCaption({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-0.5">
      <h3 className={cn(landingFeatureCaptionTitle, 'sm:text-2xl')}>{title}</h3>
      <p className={landingFeatureCaptionBody}>{description}</p>
    </div>
  )
}

function CreatorCard() {
  const item = UGC_ADS.items[0]

  return (
    <>
      <article className={featureCard} aria-hidden="true">
        <video
          src={VIDEO.creatorPicker}
          poster={IMG.creatorPickerBg}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-[50%_28%]"
        />
        <div className="pointer-events-none absolute inset-0 bg-black/5" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <div className="absolute left-4 top-4 z-10 flex max-w-[calc(100%-2rem)] flex-wrap gap-1.5 sm:left-5 sm:top-5">
          {item.niches.map(niche => (
            <Badge key={niche} variant="ghost" className={glassBadge}>
              {niche}
            </Badge>
          ))}
        </div>
        <div className="absolute inset-x-4 bottom-4 z-10 sm:inset-x-5 sm:bottom-5">
          <div className="relative w-full">
            <div className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 ${glass}`}>
              <span className="text-[0.8125rem] font-medium text-white/55">{item.modelLabel}</span>
              <span className="flex items-center gap-1.5 text-[0.9375rem] font-medium tracking-[-0.02em] text-white">
                {item.modelValue}
                <ChevronDown className="size-4 text-white/70" strokeWidth={2} aria-hidden="true" />
              </span>
            </div>
            <PointerCursor className="right-2 top-[calc(100%-0.25rem)]" />
          </div>
        </div>
      </article>
      <FeatureCaption title={item.title} description={item.description} />
    </>
  )
}

const shapeToolIcons = {
  Edit: Pencil,
  Captions,
  Upscale: Maximize2,
  Remix: Shuffle,
} as const

function ShapeCard() {
  const item = UGC_ADS.items[1]

  return (
    <>
      <article className={shapeVideoCard} aria-hidden="true">
        <video
          src={VIDEO.shapeAdPreview}
          poster={IMG.shapeAdPreview}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-[50%_18%]"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
          aria-hidden="true"
        />
        <div className="absolute inset-x-4 bottom-4 z-10 grid grid-cols-2 gap-1.5 sm:inset-x-5 sm:bottom-5">
          {item.tools.map(tool => {
            const Icon = shapeToolIcons[tool]
            const active = tool === item.activeTool
            return (
              <div
                key={tool}
                className={`relative flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-[0.6875rem] font-medium tracking-[-0.01em] text-white ${glass} ${
                  active ? 'ring-1 ring-white/35' : ''
                }`}
              >
                <Icon className="size-3.5 shrink-0 opacity-90" strokeWidth={2} aria-hidden="true" />
                {tool}
                {active ? <PointerCursor className="-right-1 -top-2 scale-90" /> : null}
              </div>
            )
          })}
        </div>
      </article>
      <FeatureCaption title={item.title} description={item.description} />
    </>
  )
}

function FormatsCard() {
  const item = UGC_ADS.items[2]

  return (
    <>
      <article className={shapeVideoCard} aria-hidden="true">
        <video
          src={VIDEO.formatsPreview}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div className="relative z-10 flex min-h-[14.5rem] flex-1 flex-col items-center justify-center px-5 py-8 sm:min-h-[15.5rem] sm:px-6 sm:py-9">
          <LandingUgcFormatsList />
        </div>
      </article>
      <FeatureCaption title={item.title} description={item.description} />
    </>
  )
}

function PointerCursor({ className }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute z-10 size-7 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] ${className ?? ''}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.5 3.5 18 11.2c.9.55.35 1.95-.7 1.75l-4.35-.7-1.5 4.8c-.35 1.1-1.95 1.05-2.2-.1L5.5 3.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
