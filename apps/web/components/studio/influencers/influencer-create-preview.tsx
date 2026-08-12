'use client'

import { InfluencerAvatarSilhouette } from '@/components/studio/influencers/influencer-avatar-silhouette'
import {
  ACCESSORY_OPTIONS,
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
  SCENE_OPTIONS,
  SKIN_TONE_OPTIONS,
  INFLUENCER_GENERATION_SHOT_COUNT,
} from '@/lib/studio/influencers/options'
import { cn } from '@/lib/utils'
import type {
  InfluencerAgeRange,
  InfluencerGender,
  InfluencerHeight,
  InfluencerPhotoStyle,
} from '@socialista/types'
import type { ReactNode } from 'react'

export type InfluencerCreatePreviewProps = {
  name: string
  gender: InfluencerGender
  ageRange: InfluencerAgeRange
  niche: string[]
  scenes?: string[]
  ethnicity?: string
  hairColor: string
  hairStyle: string
  eyeColor: string
  skinTone: string
  bodyShape: string
  height?: InfluencerHeight
  aestheticTags: string[]
  accessories?: string[]
  distinguishingFeatures: string[]
  directions?: string
  photoStyle?: InfluencerPhotoStyle
  facialHair?: string
  makeup?: string
  className?: string
  /** Desktop sticky hero vs mobile sticky strip */
  variant?: 'panel' | 'compact'
  /** Optional CTA / footer (e.g. Generate button) — panel only */
  footer?: ReactNode
}

export function InfluencerCreatePreview({
  name,
  gender,
  ageRange,
  niche,
  scenes = [],
  ethnicity,
  hairColor,
  hairStyle,
  eyeColor,
  skinTone,
  bodyShape,
  height,
  aestheticTags,
  accessories = [],
  distinguishingFeatures,
  directions,
  photoStyle,
  facialHair,
  makeup,
  className,
  variant = 'panel',
  footer,
}: InfluencerCreatePreviewProps) {
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

  const nicheLabels = niche.map(n => NICHE_OPTIONS.find(o => o.id === n)?.label ?? n)
  const vibeLabels = aestheticTags.map(t => AESTHETIC_OPTIONS.find(o => o.id === t)?.label ?? t)
  const sceneLabels = scenes.map(s => SCENE_OPTIONS.find(o => o.id === s)?.label ?? s)
  const accessoryLabels = accessories.map(a => ACCESSORY_OPTIONS.find(o => o.id === a)?.label ?? a)

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

  const subtitle = [genderLabel, ageLabel, ethnicity?.trim()].filter(Boolean).join(' · ')

  if (variant === 'compact') {
    return (
      <aside
        className={cn(
          'overflow-hidden rounded-xl bg-muted/15 ring-1 ring-border/40',
          className,
        )}
      >
        <div className="flex items-center gap-3 px-3.5 py-3 sm:gap-3.5 sm:px-4">
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
            <p className="truncate text-[14px] font-semibold tracking-[-0.02em] text-foreground">
              {displayName}
            </p>
            <p className="mt-0.5 truncate text-[12px] tracking-[-0.01em] text-muted-foreground">
              {subtitle}
            </p>
            {nicheLabels.length > 0 ? (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">
                {nicheLabels.join(' · ')}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
            <ColorDot color={colorForSwatch(SKIN_TONE_OPTIONS, skinTone)} />
            <ColorDot color={colorForSwatch(HAIR_COLOR_OPTIONS, hairColor)} />
            <ColorDot color={colorForSwatch(EYE_COLOR_OPTIONS, eyeColor)} />
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl bg-muted/10 ring-1 ring-border/40',
        className,
      )}
    >
      <div className="flex flex-col items-center px-6 pb-5 pt-8 text-center">
        <InfluencerAvatarSilhouette
          skinTone={skinTone}
          hairColor={hairColor}
          eyeColor={eyeColor}
          hairStyle={hairStyle}
          facialHair={facialHair}
          size="md"
          className="mb-5"
        />

        <h2 className="max-w-full truncate text-[17px] font-semibold tracking-[-0.025em] text-foreground">
          {displayName}
        </h2>
        <p className="mt-1 text-[13px] tracking-[-0.01em] text-muted-foreground">{subtitle}</p>

        <div className="mt-3.5 flex items-center justify-center gap-2" aria-hidden>
          <ColorDot color={colorForSwatch(SKIN_TONE_OPTIONS, skinTone)} size="md" />
          <ColorDot color={colorForSwatch(HAIR_COLOR_OPTIONS, hairColor)} size="md" />
          <ColorDot color={colorForSwatch(EYE_COLOR_OPTIONS, eyeColor)} size="md" />
        </div>
      </div>

      <div className="space-y-4 border-t border-border/35 px-5 py-4 text-left">
        {nicheLabels.length > 0 ? (
          <ChipRow label="Niche" items={nicheLabels} />
        ) : null}
        {sceneLabels.length > 0 ? (
          <ChipRow label="Scenes" items={sceneLabels} />
        ) : null}
        {vibeLabels.length > 0 ? (
          <ChipRow label="Vibe" items={vibeLabels} />
        ) : null}
        {accessoryLabels.length > 0 ? (
          <ChipRow label="Accessories" items={accessoryLabels} />
        ) : null}

        <SummaryBlock label="Look">{lookSummary}</SummaryBlock>
        {buildParts.length > 0 ? (
          <SummaryBlock label="Build">{buildParts.join(' · ')}</SummaryBlock>
        ) : null}
        {photoStyleLabel ? <SummaryBlock label="Photo">{photoStyleLabel}</SummaryBlock> : null}
        <SummaryBlock label="Gallery">{INFLUENCER_GENERATION_SHOT_COUNT} shots</SummaryBlock>
        {directions?.trim() ? (
          <SummaryBlock label="Direction">
            <span className="line-clamp-3 text-foreground/75">{directions.trim()}</span>
          </SummaryBlock>
        ) : null}
        {distinguishingFeatures.length > 0 ? (
          <SummaryBlock label="Details">{distinguishingFeatures.join(' · ')}</SummaryBlock>
        ) : null}
      </div>

      {footer ? (
        <div className="mt-auto border-t border-border/35 px-5 py-4">{footer}</div>
      ) : null}
    </aside>
  )
}

function ChipRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium tracking-[0.06em] text-muted-foreground/70 uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map(item => (
          <span
            key={item}
            className="rounded-md bg-muted/40 px-2 py-0.5 text-[12px] font-medium tracking-[-0.01em] text-foreground/85 ring-1 ring-border/30"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function SummaryBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-0.5 text-[11px] font-medium tracking-[0.06em] text-muted-foreground/70 uppercase">
        {label}
      </p>
      <div className="text-[13px] leading-[1.5] tracking-[-0.01em] text-foreground/85">{children}</div>
    </div>
  )
}

function ColorDot({ color, size = 'sm' }: { color?: string; size?: 'sm' | 'md' }) {
  if (!color) return null
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block shrink-0 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] ring-1 ring-border/35',
        size === 'md' ? 'size-2.5' : 'size-2',
      )}
      style={{ backgroundColor: color }}
    />
  )
}
