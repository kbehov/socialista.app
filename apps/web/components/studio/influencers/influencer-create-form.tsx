'use client'

import { dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  ACCESSORY_OPTIONS,
  AESTHETIC_OPTIONS,
  AGE_RANGE_OPTIONS,
  BODY_SHAPE_OPTIONS,
  DIRECTIONS_MAX,
  DIRECTIONS_PLACEHOLDER,
  ETHNICITY_OPTIONS,
  EYE_COLOR_OPTIONS,
  FACIAL_HAIR_OPTIONS,
  FEATURE_SUGGESTIONS,
  GENDER_OPTIONS,
  HAIR_COLOR_OPTIONS,
  HAIR_STYLE_OPTIONS,
  HEIGHT_OPTIONS,
  INFLUENCER_ACCESSORIES_MAX,
  INFLUENCER_SCENES_MAX,
  INFLUENCER_VIBES_MAX,
  labelForSwatch,
  MAKEUP_OPTIONS,
  NICHE_OPTIONS,
  PHOTO_STYLE_OPTIONS,
  SCENE_OPTIONS,
  SKIN_TONE_OPTIONS,
  VIBE_OPTIONS,
} from '@/lib/studio/influencers/options'
import { FEATURE_ICONS } from '@/lib/studio/influencers/option-icons'
import type { InfluencerCreateFormState } from '@/lib/studio/influencers/presets'
import { cn } from '@/lib/utils'
import type {
  InfluencerAgeRange,
  InfluencerFacialHair,
  InfluencerGender,
  InfluencerHeight,
  InfluencerMakeupStyle,
  InfluencerPhotoStyle,
} from '@socialista/types'
import { PlusIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import {
  AdvancedCollapsible,
  ChipMultiSelect,
  ChipSingleSelect,
  chipClassName,
  FieldLabel,
  FormDisclosure,
  OptionSegmented,
  PropertyRow,
  SwatchPicker,
} from './influencer-option-controls'

const NICHE_MAX = 3
const AESTHETIC_MAX = 3
const FEATURE_MAX = 3
const BIO_MAX = 200

const INPUT_CLASS =
  'h-8 rounded-md border-border/55 bg-background shadow-none placeholder:text-muted-foreground/45 focus-visible:ring-ring/30 dark:border-border/70'

const DIRECTION_CLASS =
  'min-h-[4.25rem] resize-none rounded-none border-0 bg-transparent px-0 py-0 text-[13px] leading-relaxed shadow-none placeholder:text-muted-foreground/40 focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent'

const TEXTAREA_CLASS =
  'min-h-[4.5rem] resize-none rounded-md border-border/55 bg-background text-sm leading-relaxed shadow-none placeholder:text-muted-foreground/45 focus-visible:ring-ring/30 dark:border-border/70'

function SwatchField({
  label,
  valueLabel,
  children,
}: {
  label: string
  valueLabel: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium tracking-[-0.01em] text-foreground">{label}</span>
        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/55">{valueLabel}</span>
      </div>
      {children}
    </div>
  )
}

function EthnicityPicker({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const trimmed = value.trim()
  const presetMatch = ETHNICITY_OPTIONS.find(
    o => o.id.toLowerCase() === trimmed.toLowerCase() || o.label.toLowerCase() === trimmed.toLowerCase(),
  )
  const [customMode, setCustomMode] = useState(() => trimmed.length > 0 && !presetMatch)
  const showCustomInput = !presetMatch && (customMode || trimmed.length > 0)

  return (
    <div className="space-y-2">
      <div role="radiogroup" aria-label="Ethnicity / background" className="flex flex-wrap gap-1.5">
        {ETHNICITY_OPTIONS.map(option => {
          const selected =
            !showCustomInput &&
            (trimmed.toLowerCase() === option.id.toLowerCase() ||
              trimmed.toLowerCase() === option.label.toLowerCase())
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => {
                setCustomMode(false)
                onChange(selected ? '' : option.id)
              }}
              className={cn(chipClassName.base, selected ? chipClassName.on : chipClassName.off)}
            >
              {option.label}
            </button>
          )
        })}
        <button
          type="button"
          role="radio"
          aria-checked={showCustomInput}
          disabled={disabled}
          onClick={() => {
            setCustomMode(true)
            if (presetMatch) onChange('')
          }}
          className={cn(chipClassName.base, showCustomInput ? chipClassName.on : chipClassName.off)}
        >
          Custom
        </button>
      </div>
      {showCustomInput ? (
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. Nigerian-Irish"
          disabled={disabled}
          className={INPUT_CLASS}
        />
      ) : null}
    </div>
  )
}

export type InfluencerCreateFormProps = {
  form: InfluencerCreateFormState
  featureDraft: string
  onFeatureDraftChange: (value: string) => void
  onFormChange: (updater: (prev: InfluencerCreateFormState) => InfluencerCreateFormState) => void
  onUpdateAppearance: <K extends keyof InfluencerCreateFormState['appearance']>(
    key: K,
    value: InfluencerCreateFormState['appearance'][K],
  ) => void
  onAddFeature: (raw: string) => void
  onRemoveFeature: (tag: string) => void
  references: ReactNode
  referenceCount: number
  referenceMax: number
  disabled?: boolean
}

export function InfluencerCreateForm({
  form,
  featureDraft,
  onFeatureDraftChange,
  onFormChange,
  onUpdateAppearance,
  onAddFeature,
  onRemoveFeature,
  references,
  referenceCount,
  referenceMax,
  disabled,
}: InfluencerCreateFormProps) {
  const { bio, gender, ageRange, niche, scenes, ethnicity, appearance, aestheticTags, vibeTags, photoStyle } = form

  const showFacialHair = gender === 'male'
  const showMakeup = gender === 'female' || gender === 'non-binary'

  const photoStyleLabel = PHOTO_STYLE_OPTIONS.find(o => o.id === photoStyle)?.label ?? photoStyle
  const appearanceSummary = [
    labelForSwatch(SKIN_TONE_OPTIONS, appearance.skinTone),
    appearance.hairStyle,
    appearance.bodyShape,
  ]
    .filter(Boolean)
    .join(' · ')
  const styleSummary = [photoStyleLabel, aestheticTags[0], vibeTags[0]].filter(Boolean).join(' · ')

  return (
    <fieldset disabled={disabled} className={cn(dashboardSurface.section, 'min-w-0 p-0 disabled:opacity-60')}>
      <div className="divide-y divide-border/45 dark:divide-border/55">
        <div className="px-4 py-3">
          <PropertyRow label="References" hint={`${referenceCount}/${referenceMax}`}>
            {references}
          </PropertyRow>
        </div>

        <div className="px-4 py-3">
          <PropertyRow label="Gender" align="center">
            <OptionSegmented
              aria-label="Gender"
              value={gender}
              options={GENDER_OPTIONS}
              onChange={(v: InfluencerGender) => onFormChange(prev => ({ ...prev, gender: v }))}
            />
          </PropertyRow>
        </div>

        <div className="px-4 py-3">
          <PropertyRow label="Age" align="center">
            <OptionSegmented
              aria-label="Age range"
              value={ageRange}
              options={AGE_RANGE_OPTIONS}
              onChange={(v: InfluencerAgeRange) => onFormChange(prev => ({ ...prev, ageRange: v }))}
            />
          </PropertyRow>
        </div>

        <div className="px-4 py-3">
          <PropertyRow label="Niche" hint={`${niche.length}/${NICHE_MAX}`}>
            <ChipMultiSelect
              aria-label="Niche"
              values={niche}
              options={NICHE_OPTIONS}
              onChange={v => onFormChange(prev => ({ ...prev, niche: v }))}
              max={NICHE_MAX}
              iconGroup="niche"
            />
          </PropertyRow>
        </div>

        <div className="px-4 py-3">
          <PropertyRow label="Background">
            <EthnicityPicker
              value={ethnicity}
              onChange={v => onFormChange(prev => ({ ...prev, ethnicity: v }))}
              disabled={disabled}
            />
          </PropertyRow>
        </div>

        <FormDisclosure title="Appearance" summary={appearanceSummary}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SwatchField label="Skin" valueLabel={labelForSwatch(SKIN_TONE_OPTIONS, appearance.skinTone)}>
              <SwatchPicker
                aria-label="Skin tone"
                value={appearance.skinTone}
                options={SKIN_TONE_OPTIONS}
                onChange={v => onUpdateAppearance('skinTone', v)}
              />
            </SwatchField>
            <SwatchField label="Eyes" valueLabel={labelForSwatch(EYE_COLOR_OPTIONS, appearance.eyeColor)}>
              <SwatchPicker
                aria-label="Eye color"
                value={appearance.eyeColor}
                options={EYE_COLOR_OPTIONS}
                onChange={v => onUpdateAppearance('eyeColor', v)}
              />
            </SwatchField>
          </div>

          <SwatchField label="Hair color" valueLabel={labelForSwatch(HAIR_COLOR_OPTIONS, appearance.hairColor)}>
            <SwatchPicker
              aria-label="Hair color"
              value={appearance.hairColor}
              options={HAIR_COLOR_OPTIONS}
              onChange={v => onUpdateAppearance('hairColor', v)}
            />
          </SwatchField>

          <div>
            <FieldLabel>Hair</FieldLabel>
            <ChipSingleSelect
              aria-label="Hair style"
              value={appearance.hairStyle}
              options={HAIR_STYLE_OPTIONS}
              onChange={v => onUpdateAppearance('hairStyle', v)}
              iconGroup="hairStyle"
            />
          </div>

          {showFacialHair ? (
            <div>
              <FieldLabel>Facial hair</FieldLabel>
              <ChipSingleSelect
                aria-label="Facial hair"
                value={appearance.facialHair}
                options={FACIAL_HAIR_OPTIONS}
                onChange={v => onUpdateAppearance('facialHair', v as InfluencerFacialHair)}
                iconGroup="facialHair"
              />
            </div>
          ) : null}

          {showMakeup ? (
            <div>
              <FieldLabel>Makeup</FieldLabel>
              <ChipSingleSelect
                aria-label="Makeup"
                value={appearance.makeup}
                options={MAKEUP_OPTIONS}
                onChange={v => onUpdateAppearance('makeup', v as InfluencerMakeupStyle)}
                iconGroup="makeup"
              />
            </div>
          ) : null}

          <div>
            <FieldLabel>Body</FieldLabel>
            <ChipSingleSelect
              aria-label="Body shape"
              value={appearance.bodyShape}
              options={BODY_SHAPE_OPTIONS}
              onChange={v => onUpdateAppearance('bodyShape', v)}
              iconGroup="bodyShape"
            />
          </div>

          <div>
            <FieldLabel>Height</FieldLabel>
            <OptionSegmented
              aria-label="Height"
              value={appearance.height}
              options={HEIGHT_OPTIONS}
              onChange={(v: InfluencerHeight) => onUpdateAppearance('height', v)}
            />
          </div>

          <div>
            <FieldLabel hint={`${appearance.distinguishingFeatures.length}/${FEATURE_MAX}`}>Features</FieldLabel>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {FEATURE_SUGGESTIONS.map(tag => {
                const selected = appearance.distinguishingFeatures.includes(tag)
                const atMax = !selected && appearance.distinguishingFeatures.length >= FEATURE_MAX
                const FeatureIcon = FEATURE_ICONS[tag]
                return (
                  <button
                    key={tag}
                    type="button"
                    disabled={atMax}
                    onClick={() => (selected ? onRemoveFeature(tag) : onAddFeature(tag))}
                    className={cn(
                      chipClassName.base,
                      selected ? chipClassName.on : chipClassName.off,
                      atMax && chipClassName.disabled,
                    )}
                  >
                    {FeatureIcon ? <FeatureIcon className="size-3.5" strokeWidth={1.75} aria-hidden /> : null}
                    {tag}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-1.5">
              <Input
                value={featureDraft}
                onChange={e => onFeatureDraftChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    onAddFeature(featureDraft)
                  }
                }}
                placeholder="Custom feature"
                className={INPUT_CLASS}
              />
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="size-8 shrink-0 rounded-md border-border/55 shadow-none"
                onClick={() => onAddFeature(featureDraft)}
                aria-label="Add feature"
              >
                <PlusIcon className="size-3.5" strokeWidth={1.75} />
              </Button>
            </div>
          </div>
        </FormDisclosure>

        <FormDisclosure title="Style" summary={styleSummary}>
          <div>
            <FieldLabel>Photo</FieldLabel>
            <OptionSegmented
              aria-label="Photo style"
              value={photoStyle}
              options={PHOTO_STYLE_OPTIONS.map(o => ({ id: o.id, label: o.label }))}
              onChange={(v: InfluencerPhotoStyle) => onFormChange(prev => ({ ...prev, photoStyle: v }))}
            />
          </div>

          <div>
            <FieldLabel hint={`${aestheticTags.length}/${AESTHETIC_MAX}`}>Aesthetic</FieldLabel>
            <ChipMultiSelect
              aria-label="Aesthetic"
              values={aestheticTags}
              options={AESTHETIC_OPTIONS}
              onChange={v => onFormChange(prev => ({ ...prev, aestheticTags: v }))}
              max={AESTHETIC_MAX}
              iconGroup="aesthetic"
            />
          </div>

          <div>
            <FieldLabel hint={`${vibeTags.length}/${INFLUENCER_VIBES_MAX}`}>Vibe</FieldLabel>
            <ChipMultiSelect
              aria-label="Vibe"
              values={vibeTags}
              options={VIBE_OPTIONS}
              onChange={v => onFormChange(prev => ({ ...prev, vibeTags: v }))}
              max={INFLUENCER_VIBES_MAX}
              iconGroup="vibe"
            />
          </div>

          <div>
            <FieldLabel hint={`${scenes.length}/${INFLUENCER_SCENES_MAX}`}>Scenes</FieldLabel>
            <ChipMultiSelect
              aria-label="Scenes"
              values={scenes}
              options={SCENE_OPTIONS}
              onChange={v => onFormChange(prev => ({ ...prev, scenes: v }))}
              max={INFLUENCER_SCENES_MAX}
              iconGroup="scene"
            />
          </div>

          <div>
            <FieldLabel hint={`${appearance.accessories.length}/${INFLUENCER_ACCESSORIES_MAX}`}>Accessories</FieldLabel>
            <ChipMultiSelect
              aria-label="Accessories"
              values={appearance.accessories}
              options={ACCESSORY_OPTIONS}
              onChange={v => onUpdateAppearance('accessories', v)}
              max={INFLUENCER_ACCESSORIES_MAX}
              iconGroup="accessory"
            />
          </div>

          <AdvancedCollapsible label="Team bio" defaultOpen={bio.length > 0}>
            <FieldLabel htmlFor="influencer-bio" hint={`${bio.length}/${BIO_MAX}`}>
              Bio
            </FieldLabel>
            <Textarea
              id="influencer-bio"
              value={bio}
              onChange={e =>
                onFormChange(prev => ({
                  ...prev,
                  bio: e.target.value.slice(0, BIO_MAX),
                }))
              }
              placeholder="Internal note — not sent to the image model"
              rows={2}
              className={TEXTAREA_CLASS}
            />
          </AdvancedCollapsible>
        </FormDisclosure>

        <div className="px-4 py-3">
          <PropertyRow label="Direction" hint={`${form.directions.length}/${DIRECTIONS_MAX}`}>
            <Textarea
              id="influencer-directions"
              aria-label="Creative direction"
              value={form.directions}
              onChange={e =>
                onFormChange(prev => ({
                  ...prev,
                  directions: e.target.value.slice(0, DIRECTIONS_MAX),
                }))
              }
              placeholder={DIRECTIONS_PLACEHOLDER}
              rows={3}
              className={DIRECTION_CLASS}
            />
          </PropertyRow>
        </div>
      </div>
    </fieldset>
  )
}
