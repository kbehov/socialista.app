'use client'

import { AttachedMediaThumb, AttachImagesDialog, type AttachedImage } from '@/components/files/attach-images-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  ACCESSORY_OPTIONS,
  AESTHETIC_OPTIONS,
  AGE_RANGE_OPTIONS,
  BODY_SHAPE_OPTIONS,
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
  INFLUENCER_MAX_USER_REFERENCE_IMAGES,
  labelForSwatch,
  MAKEUP_OPTIONS,
  NICHE_OPTIONS,
  PHOTO_STYLE_OPTIONS,
  SCENE_OPTIONS,
  SKIN_TONE_OPTIONS,
} from '@/lib/studio/influencers/options'
import { FEATURE_ICONS, FIELD_ICONS, FieldIcon } from '@/lib/studio/influencers/option-icons'
import type { InfluencerCreateFormState } from '@/lib/studio/influencers/presets'
import { cn } from '@/lib/utils'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import type {
  InfluencerAgeRange,
  InfluencerFacialHair,
  InfluencerGender,
  InfluencerHeight,
  InfluencerMakeupStyle,
  InfluencerPhotoStyle,
  Model,
} from '@socialista/types'
import { ImagePlusIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import {
  AdvancedCollapsible,
  ChipMultiSelect,
  ChipSingleSelect,
  ChoiceGrid,
  FieldLabel,
  FormFieldStack,
  FormSection,
  OptionSegmented,
  SwatchPicker,
} from './influencer-option-controls'
import { InfluencerPromptComposer } from './influencer-prompt-composer'

const NICHE_MAX = 3
const AESTHETIC_MAX = 3
const FEATURE_MAX = 3
const BIO_MAX = 200

const INPUT_CLASS =
  'h-10 rounded-[10px] border-border/50 bg-background text-sm shadow-[0_1px_2px_rgba(0,0,0,0.02)] placeholder:text-muted-foreground/45 focus-visible:ring-ring/30'

const TEXTAREA_CLASS =
  'min-h-[4.5rem] resize-none rounded-[10px] border-border/50 bg-background text-sm leading-relaxed shadow-[0_1px_2px_rgba(0,0,0,0.02)] placeholder:text-muted-foreground/45 focus-visible:ring-ring/30'

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
  referenceImages: AttachedImage[]
  onReferenceImagesChange: (images: AttachedImage[]) => void
  workspaceId: string
  models: Model[]
  selectedModelId: string
  onSelectedModelChange: (id: string) => void
  onSubmit: (message: PromptInputMessage) => void
  composerKey?: string
  initialInput?: string
  disabled?: boolean
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground/75">
      {children}
    </p>
  )
}

function SwatchField({
  label,
  icon,
  valueLabel,
  children,
}: {
  label: string
  icon?: React.ComponentProps<typeof FieldLabel>['icon']
  valueLabel: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[13px] font-medium tracking-[-0.012em] text-foreground">
          {icon ? <FieldIcon icon={icon} /> : null}
          {label}
        </span>
        <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground/70">{valueLabel}</span>
      </div>
      {children}
    </div>
  )
}

function StyleReferenceField({
  images,
  onChange,
  workspaceId,
  disabled,
}: {
  images: AttachedImage[]
  onChange: (images: AttachedImage[]) => void
  workspaceId: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const image = images[0]

  return (
    <div>
      <FieldLabel icon={FIELD_ICONS.styleReference}>Style reference</FieldLabel>
      {image ? (
        <div className="flex items-center gap-3 rounded-[10px] bg-background px-2.5 py-2 ring-1 ring-border/50">
          <AttachedMediaThumb
            file={image}
            size="sm"
            disabled={disabled}
            onRemove={id => onChange(images.filter(item => item.id !== id))}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium tracking-[-0.012em]">
              {image.name ?? 'Style reference'}
            </p>
            <p className="text-[12px] text-muted-foreground/75">Lighting and grade only</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 rounded-lg px-2.5 text-[12px] font-medium"
            disabled={disabled}
            onClick={() => setOpen(true)}
          >
            Replace
          </Button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className={cn(
            'flex w-full items-center gap-3 rounded-[10px] border border-dashed border-border/50 bg-muted/10 px-3 py-2.5 text-left',
            'transition-colors duration-150',
            'hover:border-border/70 hover:bg-muted/20',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
            'disabled:pointer-events-none',
          )}
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/40 ring-1 ring-border/30">
            <ImagePlusIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-medium tracking-[-0.012em]">Add a photo</span>
            <span className="mt-0.5 block text-[12px] leading-relaxed text-muted-foreground/75">
              Lighting, color grade, and vibe
            </span>
          </span>
        </button>
      )}
      <FieldHint>Optional. One photo — we match the photographic vibe, not the person.</FieldHint>
      <AttachImagesDialog
        open={open}
        accept="image"
        onOpenChange={setOpen}
        maxImagesSelect={INFLUENCER_MAX_USER_REFERENCE_IMAGES}
        initialSelected={images}
        workspaceId={workspaceId}
        title="Attach style reference"
        description="One photo — we match the lighting, color grade, and photographic vibe, not the person."
        onSelect={onChange}
      />
    </div>
  )
}

const ETHNICITY_CHIP = cn(
  'rounded-full px-3.5 py-2 text-[13px] font-medium tracking-[-0.015em] ring-1 transition-colors duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
)

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
    o =>
      o.id.toLowerCase() === trimmed.toLowerCase() ||
      o.label.toLowerCase() === trimmed.toLowerCase(),
  )
  const [customMode, setCustomMode] = useState(() => trimmed.length > 0 && !presetMatch)
  const showCustomInput = customMode || (trimmed.length > 0 && !presetMatch)

  return (
    <div className="space-y-2.5">
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
              className={cn(
                ETHNICITY_CHIP,
                selected
                  ? 'bg-foreground text-background ring-foreground'
                  : 'bg-muted/20 text-muted-foreground ring-border/30 hover:bg-muted/35 hover:text-foreground',
              )}
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
          className={cn(
            ETHNICITY_CHIP,
            showCustomInput
              ? 'bg-foreground text-background ring-foreground'
              : 'bg-muted/20 text-muted-foreground ring-border/30 hover:bg-muted/35 hover:text-foreground',
          )}
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

export function InfluencerCreateForm({
  form,
  featureDraft,
  onFeatureDraftChange,
  onFormChange,
  onUpdateAppearance,
  onAddFeature,
  onRemoveFeature,
  referenceImages,
  onReferenceImagesChange,
  workspaceId,
  models,
  selectedModelId,
  onSelectedModelChange,
  onSubmit,
  composerKey,
  initialInput,
  disabled,
}: InfluencerCreateFormProps) {
  const {
    name,
    bio,
    gender,
    ageRange,
    niche,
    scenes,
    ethnicity,
    appearance,
    aestheticTags,
    photoStyle,
  } = form

  const showFacialHair = gender === 'male'
  const showMakeup = gender === 'female' || gender === 'non-binary'
  const hasStyleReferences = referenceImages.length > 0

  return (
    <div className="min-w-0 space-y-10">
    <fieldset disabled={disabled} className="min-w-0 space-y-10 border-0 p-0 disabled:opacity-60">
      <FormSection
        title="Identity"
        description="Who this creator is — name, demographics, and niche."
      >
        <FormFieldStack>
          <div>
            <FieldLabel htmlFor="influencer-name" icon={FIELD_ICONS.name}>
              Display name
            </FieldLabel>
            <Input
              id="influencer-name"
              value={name}
              onChange={e => onFormChange(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Give them a name"
              autoComplete="off"
              maxLength={80}
              className={INPUT_CLASS}
            />
            <FieldHint>Shown in your library. Leave blank to auto-name from the prompt.</FieldHint>
          </div>

          <StyleReferenceField
            images={referenceImages}
            onChange={onReferenceImagesChange}
            workspaceId={workspaceId}
            disabled={disabled}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel icon={FIELD_ICONS.gender}>Gender</FieldLabel>
              <OptionSegmented
                aria-label="Gender"
                value={gender}
                options={GENDER_OPTIONS}
                onChange={(v: InfluencerGender) => onFormChange(prev => ({ ...prev, gender: v }))}
                layoutId="form-gender-indicator"
              />
            </div>
            <div>
              <FieldLabel icon={FIELD_ICONS.age}>Age</FieldLabel>
              <OptionSegmented
                aria-label="Age range"
                value={ageRange}
                options={AGE_RANGE_OPTIONS}
                onChange={(v: InfluencerAgeRange) => onFormChange(prev => ({ ...prev, ageRange: v }))}
                layoutId="form-age-indicator"
              />
            </div>
          </div>

          <div>
            <FieldLabel hint={`${niche.length}/${NICHE_MAX}`} icon={FIELD_ICONS.niche}>
              Niche
            </FieldLabel>
            <ChipMultiSelect
              aria-label="Niche"
              values={niche}
              options={NICHE_OPTIONS}
              onChange={v => onFormChange(prev => ({ ...prev, niche: v }))}
              max={NICHE_MAX}
              iconGroup="niche"
            />
            <FieldHint>Sets wardrobe and environments when scenes are empty.</FieldHint>
          </div>

          <div>
            <FieldLabel icon={FIELD_ICONS.ethnicity}>Background</FieldLabel>
            <EthnicityPicker
              value={ethnicity}
              onChange={v => onFormChange(prev => ({ ...prev, ethnicity: v }))}
              disabled={disabled}
            />
          </div>

          <AdvancedCollapsible label="Team bio" icon={FIELD_ICONS.bio} defaultOpen={bio.length > 0}>
            <FieldLabel htmlFor="influencer-bio" hint={`${bio.length}/${BIO_MAX}`}>
              Bio
            </FieldLabel>
            <Textarea
              id="influencer-bio"
              value={bio}
              onChange={e =>
                onFormChange(prev => ({ ...prev, bio: e.target.value.slice(0, BIO_MAX) }))
              }
              placeholder="Internal note — not sent to the image model"
              rows={2}
              className={TEXTAREA_CLASS}
            />
          </AdvancedCollapsible>
        </FormFieldStack>
      </FormSection>

      <FormSection
        title="Look"
        description="Physical appearance. Style references never change the person."
      >
        {hasStyleReferences ? (
          <p className="mb-5 rounded-xl bg-muted/15 px-3.5 py-2.5 text-[13px] leading-relaxed text-muted-foreground ring-1 ring-border/30">
            Style references shape lighting and grade only — the settings below still define the
            person.
          </p>
        ) : null}

        <FormFieldStack>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SwatchField
              label="Skin"
              icon={FIELD_ICONS.skinTone}
              valueLabel={labelForSwatch(SKIN_TONE_OPTIONS, appearance.skinTone)}
            >
              <SwatchPicker
                aria-label="Skin tone"
                value={appearance.skinTone}
                options={SKIN_TONE_OPTIONS}
                onChange={v => onUpdateAppearance('skinTone', v)}
              />
            </SwatchField>
            <SwatchField
              label="Eyes"
              icon={FIELD_ICONS.eyeColor}
              valueLabel={labelForSwatch(EYE_COLOR_OPTIONS, appearance.eyeColor)}
            >
              <SwatchPicker
                aria-label="Eye color"
                value={appearance.eyeColor}
                options={EYE_COLOR_OPTIONS}
                onChange={v => onUpdateAppearance('eyeColor', v)}
              />
            </SwatchField>
          </div>

          <SwatchField
            label="Hair color"
            icon={FIELD_ICONS.hairColor}
            valueLabel={labelForSwatch(HAIR_COLOR_OPTIONS, appearance.hairColor)}
          >
            <SwatchPicker
              aria-label="Hair color"
              value={appearance.hairColor}
              options={HAIR_COLOR_OPTIONS}
              onChange={v => onUpdateAppearance('hairColor', v)}
            />
          </SwatchField>

          <div>
            <FieldLabel icon={FIELD_ICONS.hairStyle}>Hair style</FieldLabel>
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
              <FieldLabel icon={FIELD_ICONS.facialHair}>Facial hair</FieldLabel>
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
              <FieldLabel icon={FIELD_ICONS.makeup}>Makeup</FieldLabel>
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
            <FieldLabel icon={FIELD_ICONS.bodyShape}>Body shape</FieldLabel>
            <ChoiceGrid
              aria-label="Body shape"
              value={appearance.bodyShape}
              options={BODY_SHAPE_OPTIONS}
              onChange={v => onUpdateAppearance('bodyShape', v)}
              iconGroup="bodyShape"
            />
          </div>

          <div>
            <FieldLabel icon={FIELD_ICONS.height}>Height</FieldLabel>
            <OptionSegmented
              aria-label="Height"
              value={appearance.height}
              options={HEIGHT_OPTIONS}
              onChange={(v: InfluencerHeight) => onUpdateAppearance('height', v)}
              layoutId="form-height-indicator"
            />
          </div>

          <AdvancedCollapsible
            label="Distinguishing features"
            icon={FIELD_ICONS.features}
            defaultOpen={appearance.distinguishingFeatures.length > 0}
          >
            <FieldLabel hint={`${appearance.distinguishingFeatures.length}/${FEATURE_MAX}`}>
              Pick up to {FEATURE_MAX}
            </FieldLabel>
            <div className="mb-3 flex flex-wrap gap-1.5">
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
                      'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium tracking-[-0.015em] ring-1 transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
                      selected
                        ? 'bg-foreground text-background ring-foreground'
                        : 'bg-muted/20 text-muted-foreground ring-border/25 hover:bg-muted/35 hover:text-foreground',
                      atMax && 'cursor-not-allowed opacity-40',
                    )}
                  >
                    {FeatureIcon ? (
                      <FeatureIcon className="size-3.5" strokeWidth={1.75} aria-hidden />
                    ) : null}
                    {tag}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <Input
                value={featureDraft}
                onChange={e => onFeatureDraftChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    onAddFeature(featureDraft)
                  }
                }}
                placeholder="Custom feature…"
                className={INPUT_CLASS}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10 shrink-0 rounded-[10px] border-border/50"
                onClick={() => onAddFeature(featureDraft)}
                aria-label="Add feature"
              >
                <PlusIcon className="size-4" strokeWidth={1.75} />
              </Button>
            </div>
          </AdvancedCollapsible>
        </FormFieldStack>
      </FormSection>

      <FormSection
        title="Style"
        description="How they are photographed — scenes, aesthetic, and wardrobe props."
      >
        <FormFieldStack>
          <div>
            <FieldLabel icon={FIELD_ICONS.photoStyle}>Photo style</FieldLabel>
            <ChoiceGrid
              aria-label="Photo style"
              value={photoStyle}
              options={PHOTO_STYLE_OPTIONS}
              onChange={v =>
                onFormChange(prev => ({ ...prev, photoStyle: v as InfluencerPhotoStyle }))
              }
              iconGroup="photoStyle"
            />
          </div>

          <div>
            <FieldLabel hint={`${aestheticTags.length}/${AESTHETIC_MAX}`} icon={FIELD_ICONS.aesthetic}>
              Aesthetic
            </FieldLabel>
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
            <FieldLabel hint={`${scenes.length}/${INFLUENCER_SCENES_MAX}`} icon={FIELD_ICONS.scenes}>
              Scenes
            </FieldLabel>
            <ChipMultiSelect
              aria-label="Scenes"
              values={scenes}
              options={SCENE_OPTIONS}
              onChange={v => onFormChange(prev => ({ ...prev, scenes: v }))}
              max={INFLUENCER_SCENES_MAX}
              iconGroup="scene"
            />
            <FieldHint>Each portrait lands in a different situation — gym, kitchen, car.</FieldHint>
          </div>

          <div>
            <FieldLabel
              hint={`${appearance.accessories.length}/${INFLUENCER_ACCESSORIES_MAX}`}
              icon={FIELD_ICONS.accessories}
            >
              Accessories
            </FieldLabel>
            <ChipMultiSelect
              aria-label="Accessories"
              values={appearance.accessories}
              options={ACCESSORY_OPTIONS}
              onChange={v => onUpdateAppearance('accessories', v)}
              max={INFLUENCER_ACCESSORIES_MAX}
              iconGroup="accessory"
            />
          </div>
        </FormFieldStack>
      </FormSection>
    </fieldset>

    <FormSection
      title="Generate"
      description="Choose the image model, add optional direction, then create three portraits."
    >
      <InfluencerPromptComposer
        key={composerKey}
        composerKey={composerKey}
        initialInput={initialInput}
        models={models}
        selectedModelId={selectedModelId}
        onSelectedModelChange={onSelectedModelChange}
        hasStyleReferences={hasStyleReferences}
        onSubmit={onSubmit}
        disabled={disabled}
        formReady={niche.length > 0}
      />
    </FormSection>
  </div>
  )
}
