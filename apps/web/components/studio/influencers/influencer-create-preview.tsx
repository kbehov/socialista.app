'use client'

import {
  AGE_RANGE_OPTIONS,
  AESTHETIC_OPTIONS,
  BODY_SHAPE_OPTIONS,
  colorForSwatch,
  EYE_COLOR_OPTIONS,
  FACIAL_HAIR_OPTIONS,
  GENDER_OPTIONS,
  HAIR_COLOR_OPTIONS,
  HAIR_STYLE_OPTIONS,
  HEIGHT_OPTIONS,
  labelForChoice,
  labelForSwatch,
  MAKEUP_OPTIONS,
  NICHE_OPTIONS,
  PHOTO_STYLE_OPTIONS,
  SKIN_TONE_OPTIONS,
} from '@/lib/studio/influencers/options'
import { cn } from '@/lib/utils'
import type {
  InfluencerAgeRange,
  InfluencerGender,
  InfluencerHeight,
  InfluencerPhotoStyle,
} from '@socialista/types'
import { SparklesIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

export type InfluencerCreatePreviewProps = {
  name: string
  gender: InfluencerGender
  ageRange: InfluencerAgeRange
  niche: string[]
  ethnicity?: string
  hairColor: string
  hairStyle: string
  eyeColor: string
  skinTone: string
  bodyShape: string
  height?: InfluencerHeight
  aestheticTags: string[]
  distinguishingFeatures: string[]
  directions?: string
  photoStyle?: InfluencerPhotoStyle
  facialHair?: string
  makeup?: string
  className?: string
}

export function InfluencerCreatePreview({
  name,
  gender,
  ageRange,
  niche,
  ethnicity,
  hairColor,
  hairStyle,
  eyeColor,
  skinTone,
  bodyShape,
  height,
  aestheticTags,
  distinguishingFeatures,
  directions,
  photoStyle,
  facialHair,
  makeup,
  className,
}: InfluencerCreatePreviewProps) {
  const reduceMotion = useReducedMotion()
  const skin = colorForSwatch(SKIN_TONE_OPTIONS, skinTone) ?? '#C68642'
  const hair = colorForSwatch(HAIR_COLOR_OPTIONS, hairColor) ?? '#3B2314'
  const eyes = colorForSwatch(EYE_COLOR_OPTIONS, eyeColor) ?? '#5C4033'
  const displayName = name.trim() || 'Your influencer'
  const genderLabel = GENDER_OPTIONS.find(g => g.id === gender)?.label ?? gender
  const ageLabel = AGE_RANGE_OPTIONS.find(a => a.id === ageRange)?.label ?? ageRange
  const photoStyleLabel = photoStyle
    ? (PHOTO_STYLE_OPTIONS.find(o => o.id === photoStyle)?.label ?? photoStyle)
    : null
  const facialHairLabel =
    facialHair && facialHair !== 'none'
      ? (FACIAL_HAIR_OPTIONS.find(o => o.id === facialHair)?.label ?? facialHair)
      : null
  const makeupLabel = makeup
    ? (MAKEUP_OPTIONS.find(o => o.id === makeup)?.label ?? makeup)
    : null

  const colorTransition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, bounce: 0, duration: 0.45 }

  return (
    <aside
      className={cn(
        'video-studio-glass flex flex-col overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04)]',
        className,
      )}
    >
      <div className="relative aspect-4/5 overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute inset-0"
          animate={{
            background: `radial-gradient(ellipse 90% 70% at 50% 30%, ${skin}44 0%, transparent 65%), radial-gradient(ellipse 60% 50% at 50% 0%, ${hair}28 0%, transparent 55%), linear-gradient(180deg, color-mix(in oklch, var(--muted) 30%, transparent) 0%, transparent 100%)`,
          }}
          transition={colorTransition}
        />

        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-[11px] font-medium tracking-[-0.01em] text-muted-foreground ring-1 ring-border/40 backdrop-blur-sm">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/60 motion-reduce:hidden" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            Live preview
          </span>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 pt-6">
          <div className="relative">
            <motion.div
              className="mx-auto size-[7.5rem] rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.12)] ring-[3px] ring-background/70 sm:size-36"
              animate={{
                background: `linear-gradient(165deg, ${skin} 0%, ${skin}dd 50%, color-mix(in srgb, ${skin} 70%, ${hair}) 100%)`,
              }}
              transition={colorTransition}
            />
            <motion.div
              className="absolute top-[-8%] left-1/2 h-[44%] w-[94%] -translate-x-1/2 rounded-[50%]"
              animate={{ backgroundColor: hair }}
              transition={colorTransition}
            />
            <div className="absolute top-[40%] left-1/2 flex w-full -translate-x-1/2 justify-center gap-[1.125rem]">
              <motion.span
                className="size-2.5 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] sm:size-3"
                animate={{ backgroundColor: eyes }}
                transition={colorTransition}
              />
              <motion.span
                className="size-2.5 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] sm:size-3"
                animate={{ backgroundColor: eyes }}
                transition={colorTransition}
              />
            </div>
            <div
              aria-hidden
              className="absolute top-[72%] left-1/2 h-16 w-28 -translate-x-1/2 rounded-b-[3rem] bg-linear-to-b from-transparent to-background/20 sm:h-20 sm:w-32"
            />
          </div>

          <div className="mt-7 space-y-1.5 text-center sm:mt-8">
            <motion.p
              key={displayName}
              initial={reduceMotion ? false : { opacity: 0.6, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.35 }}
              className="text-balance text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-[1.375rem]"
            >
              {displayName}
            </motion.p>
            <p className="text-[13px] tracking-[-0.01em] text-muted-foreground">
              {genderLabel}
              <span aria-hidden className="mx-1.5 text-border">·</span>
              {ageLabel}
              {ethnicity?.trim() ? (
                <>
                  <span aria-hidden className="mx-1.5 text-border">·</span>
                  {ethnicity.trim()}
                </>
              ) : null}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-border/40 p-5 sm:p-6">
        <PreviewRow label="Look">
          {labelForSwatch(HAIR_COLOR_OPTIONS, hairColor)} {labelForChoice(HAIR_STYLE_OPTIONS, hairStyle)} hair
          <span aria-hidden className="mx-1 text-border">·</span>
          {labelForSwatch(EYE_COLOR_OPTIONS, eyeColor)} eyes
          <span aria-hidden className="mx-1 text-border">·</span>
          {labelForSwatch(SKIN_TONE_OPTIONS, skinTone)} skin
        </PreviewRow>

        <PreviewRow label="Build">
          {labelForChoice(BODY_SHAPE_OPTIONS, bodyShape)}
          {height ? (
            <>
              <span aria-hidden className="mx-1 text-border">·</span>
              {HEIGHT_OPTIONS.find(h => h.id === height)?.label}
            </>
          ) : null}
          {facialHairLabel ? (
            <>
              <span aria-hidden className="mx-1 text-border">·</span>
              {facialHairLabel}
            </>
          ) : null}
          {makeupLabel ? (
            <>
              <span aria-hidden className="mx-1 text-border">·</span>
              {makeupLabel}
            </>
          ) : null}
        </PreviewRow>

        {niche.length > 0 ? (
          <PreviewRow label="Niche">
            <div className="flex flex-wrap gap-1.5">
              {niche.map(n => (
                <span
                  key={n}
                  className="rounded-full bg-muted/50 px-2.5 py-0.5 text-xs font-medium tracking-[-0.01em] text-foreground/85 ring-1 ring-border/30"
                >
                  {NICHE_OPTIONS.find(o => o.id === n)?.label ?? n}
                </span>
              ))}
            </div>
          </PreviewRow>
        ) : null}

        {photoStyleLabel ? <PreviewRow label="Photo">{photoStyleLabel}</PreviewRow> : null}

        {aestheticTags.length > 0 ? (
          <PreviewRow label="Vibe">
            {aestheticTags
              .map(t => AESTHETIC_OPTIONS.find(o => o.id === t)?.label ?? t)
              .join(' · ')}
          </PreviewRow>
        ) : null}

        {directions?.trim() ? (
          <PreviewRow label="Direction">
            <span className="line-clamp-3">{directions.trim()}</span>
          </PreviewRow>
        ) : null}

        {distinguishingFeatures.length > 0 ? (
          <PreviewRow label="Details">{distinguishingFeatures.join(' · ')}</PreviewRow>
        ) : null}

        <div className="flex items-start gap-2.5 rounded-xl bg-muted/25 px-3.5 py-3 ring-1 ring-border/30">
          <SparklesIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <p className="text-[12px] leading-[1.55] tracking-[-0.005em] text-muted-foreground">
            We&apos;ll generate anchor portraits from this identity — consistent across every image and video
            generation.
          </p>
        </div>
      </div>
    </aside>
  )
}

function PreviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium tracking-[0.06em] text-muted-foreground/80 uppercase">{label}</p>
      <div className="text-[13px] leading-[1.55] tracking-[-0.01em] text-foreground/90">{children}</div>
    </div>
  )
}

export { AGE_RANGE_OPTIONS }
