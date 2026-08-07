'use client'

import { InfluencerAvatarSilhouette } from '@/components/studio/influencers/influencer-avatar-silhouette'
import { Separator } from '@/components/ui/separator'
import {
  AESTHETIC_OPTIONS,
  AGE_RANGE_OPTIONS,
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
import { ChevronDownIcon } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'

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
  defaultExpanded?: boolean
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
  defaultExpanded = false,
}: InfluencerCreatePreviewProps) {
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(defaultExpanded)
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
  const makeupLabel = makeup ? (MAKEUP_OPTIONS.find(o => o.id === makeup)?.label ?? makeup) : null

  const nicheLabels =
    niche.length > 0
      ? niche.map(n => NICHE_OPTIONS.find(o => o.id === n)?.label ?? n).join(', ')
      : null

  const lookSummary = [
    `${labelForSwatch(HAIR_COLOR_OPTIONS, hairColor)} ${labelForChoice(HAIR_STYLE_OPTIONS, hairStyle)} hair`,
    `${labelForSwatch(EYE_COLOR_OPTIONS, eyeColor)} eyes`,
    `${labelForSwatch(SKIN_TONE_OPTIONS, skinTone)} skin`,
  ].join(' · ')

  const buildParts = [
    labelForChoice(BODY_SHAPE_OPTIONS, bodyShape),
    height ? HEIGHT_OPTIONS.find(h => h.id === height)?.label : null,
    facialHairLabel,
    makeupLabel,
  ].filter(Boolean)

  const vibeLabels =
    aestheticTags.length > 0
      ? aestheticTags.map(t => AESTHETIC_OPTIONS.find(o => o.id === t)?.label ?? t).join(', ')
      : null

  const subtitle = [genderLabel, ageLabel, ethnicity?.trim()].filter(Boolean).join(' · ')

  return (
    <aside
      className={cn(
        'video-studio-glass overflow-hidden rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center gap-3 px-3.5 py-3 text-left sm:gap-3.5 sm:px-4',
          'transition-colors hover:bg-muted/15',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
      >
        <InfluencerAvatarSilhouette
          skinTone={skinTone}
          hairColor={hairColor}
          eyeColor={eyeColor}
          hairStyle={hairStyle}
          facialHair={facialHair}
          size="sm"
          className="shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[14px] font-semibold tracking-[-0.02em] text-foreground">
              {displayName}
            </p>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border/30">
              <span className="relative flex size-1">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/50 motion-reduce:hidden" />
                <span className="relative inline-flex size-1 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          </div>
          <p className="mt-0.5 truncate text-[12px] tracking-[-0.01em] text-muted-foreground">{subtitle}</p>
          {!open && nicheLabels ? (
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">{nicheLabels}</p>
          ) : null}
        </div>

        <ChevronDownIcon
          className={cn(
            'size-4 shrink-0 text-muted-foreground/70 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.32 }}
            className="overflow-hidden"
          >
            <Separator className="bg-border/35" />
            <div className="space-y-2.5 px-4 py-3 text-[12px] leading-[1.55] tracking-[-0.01em] text-foreground/85">
              <SummaryLine label="Look">
                <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <ColorDot color={colorForSwatch(HAIR_COLOR_OPTIONS, hairColor)} />
                  {lookSummary}
                </span>
              </SummaryLine>
              {buildParts.length > 0 ? (
                <SummaryLine label="Build">{buildParts.join(' · ')}</SummaryLine>
              ) : null}
              {nicheLabels ? <SummaryLine label="Niche">{nicheLabels}</SummaryLine> : null}
              {photoStyleLabel ? <SummaryLine label="Photo">{photoStyleLabel}</SummaryLine> : null}
              {vibeLabels ? <SummaryLine label="Vibe">{vibeLabels}</SummaryLine> : null}
              {directions?.trim() ? (
                <SummaryLine label="Direction">
                  <span className="line-clamp-2 text-foreground/75">{directions.trim()}</span>
                </SummaryLine>
              ) : null}
              {distinguishingFeatures.length > 0 ? (
                <SummaryLine label="Details">{distinguishingFeatures.join(' · ')}</SummaryLine>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </aside>
  )
}

function SummaryLine({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="w-14 shrink-0 text-[11px] font-medium tracking-[0.04em] text-muted-foreground/70 uppercase">
        {label}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  )
}

function ColorDot({ color }: { color?: string }) {
  if (!color) return null
  return (
    <span
      aria-hidden
      className="inline-block size-2 shrink-0 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] ring-1 ring-border/30"
      style={{ backgroundColor: color }}
    />
  )
}

export { AGE_RANGE_OPTIONS }
