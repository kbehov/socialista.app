'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import {
  AESTHETIC_OPTIONS,
  AGE_RANGE_OPTIONS,
  BODY_SHAPE_OPTIONS,
  DEFAULT_CREATE_FORM,
  DIRECTIONS_PLACEHOLDER,
  ETHNICITY_OPTIONS,
  EYE_COLOR_OPTIONS,
  FACIAL_HAIR_OPTIONS,
  FEATURE_SUGGESTIONS,
  GENDER_OPTIONS,
  HAIR_COLOR_OPTIONS,
  HAIR_STYLE_OPTIONS,
  HEIGHT_OPTIONS,
  labelForSwatch,
  MAKEUP_OPTIONS,
  NICHE_OPTIONS,
  PHOTO_STYLE_OPTIONS,
  SKIN_TONE_OPTIONS,
} from '@/lib/studio/influencers/options'
import { cn } from '@/lib/utils'
import { createInfluencer } from '@/services/influencer.service'
import type {
  InfluencerAgeRange,
  InfluencerFacialHair,
  InfluencerGender,
  InfluencerHeight,
  InfluencerMakeupStyle,
  InfluencerPhotoStyle,
} from '@socialista/types'
import { ArrowLeftIcon, PlusIcon, SparklesIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { InfluencerCreatePreview } from './influencer-create-preview'
import {
  ChipMultiSelect,
  ChipSingleSelect,
  ChoiceGrid,
  FieldLabel,
  FormSection,
  OptionSegmented,
  SwatchPicker,
} from './influencer-option-controls'

type InfluencerCreateWorkspaceProps = {
  workspaceId: string
}

const NICHE_MAX = 4
const AESTHETIC_MAX = 4
const BIO_MAX = 200
const DIRECTIONS_MAX = 500

export function InfluencerCreateWorkspace({ workspaceId }: InfluencerCreateWorkspaceProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [name, setName] = useState(DEFAULT_CREATE_FORM.name)
  const [bio, setBio] = useState(DEFAULT_CREATE_FORM.bio)
  const [directions, setDirections] = useState(DEFAULT_CREATE_FORM.directions)
  const [gender, setGender] = useState<InfluencerGender>(DEFAULT_CREATE_FORM.gender)
  const [ageRange, setAgeRange] = useState<InfluencerAgeRange>(DEFAULT_CREATE_FORM.ageRange)
  const [niche, setNiche] = useState<string[]>(DEFAULT_CREATE_FORM.niche)
  const [ethnicity, setEthnicity] = useState(DEFAULT_CREATE_FORM.ethnicity)
  const [appearance, setAppearance] = useState(DEFAULT_CREATE_FORM.appearance)
  const [aestheticTags, setAestheticTags] = useState<string[]>(DEFAULT_CREATE_FORM.aestheticTags)
  const [photoStyle, setPhotoStyle] = useState<InfluencerPhotoStyle>(DEFAULT_CREATE_FORM.photoStyle)
  const [featureDraft, setFeatureDraft] = useState('')

  const canSubmit = name.trim().length > 0 && niche.length > 0
  const showFacialHair = gender === 'male'
  const showMakeup = gender === 'female' || gender === 'non-binary'

  function updateAppearance<K extends keyof typeof appearance>(key: K, value: (typeof appearance)[K]) {
    setAppearance(prev => ({ ...prev, [key]: value }))
  }

  function addFeature(raw: string) {
    const tag = raw.trim().toLowerCase()
    if (!tag) return
    if (appearance.distinguishingFeatures.includes(tag)) {
      setFeatureDraft('')
      return
    }
    updateAppearance('distinguishingFeatures', [...appearance.distinguishingFeatures, tag])
    setFeatureDraft('')
  }

  function removeFeature(tag: string) {
    updateAppearance(
      'distinguishingFeatures',
      appearance.distinguishingFeatures.filter(f => f !== tag),
    )
  }

  function handleGenerate() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error('Give your influencer a name')
      return
    }
    if (niche.length === 0) {
      toast.error('Pick at least one niche')
      return
    }

    startTransition(async () => {
      const response = await createInfluencer({
        workspaceId,
        name: trimmedName,
        bio: bio.trim() || undefined,
        directions: directions.trim() || undefined,
        gender,
        ageRange,
        niche,
        ethnicity: ethnicity.trim() || undefined,
        appearance: {
          hairColor: labelForSwatch(HAIR_COLOR_OPTIONS, appearance.hairColor),
          hairStyle: appearance.hairStyle,
          eyeColor: labelForSwatch(EYE_COLOR_OPTIONS, appearance.eyeColor),
          skinTone: labelForSwatch(SKIN_TONE_OPTIONS, appearance.skinTone),
          bodyShape: appearance.bodyShape,
          height: appearance.height,
          distinguishingFeatures: appearance.distinguishingFeatures,
          facialHair: showFacialHair ? appearance.facialHair : undefined,
          makeup: showMakeup ? appearance.makeup : undefined,
        },
        aestheticTags,
        photoStyle,
      })

      if (!response.success || !response.data?.influencer) {
        toast.error(response.message ?? 'Failed to create influencer')
        return
      }

      toast.success('Generating your influencer…')
      router.push(DASHBOARD_ROUTES.STUDIO.influencer(response.data.influencer._id))
    })
  }

  return (
    <div className="image-studio relative flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-140 overflow-hidden">
        <div className="absolute left-1/2 -top-32 h-112 w-200 -translate-x-1/2 rounded-full bg-foreground/[0.022] blur-[100px]" />
        <div className="absolute right-[8%] top-20 h-48 w-56 rounded-full bg-foreground/[0.015] blur-[80px]" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none sticky top-0 z-10 h-14 bg-linear-to-b from-background via-background/85 to-transparent motion-reduce:hidden"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <header className="mb-8 sm:mb-10">
          <div className="mb-5 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              asChild
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <Link href={DASHBOARD_ROUTES.STUDIO.INFLUENCERS} aria-label="Back to influencers">
                <ArrowLeftIcon className="size-4" strokeWidth={1.75} />
              </Link>
            </Button>
            <span className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground/70 uppercase">
              AI Influencers
            </span>
          </div>

          <div className="max-w-xl space-y-2">
            <h1 className="font-serif text-balance text-[2rem] font-medium leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[2.25rem]">
              Design your character
            </h1>
            <p className="text-pretty text-[15px] leading-[1.55] tracking-[-0.01em] text-muted-foreground">
              Define a consistent identity you can reuse across image and video generations.
            </p>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] lg:items-start lg:gap-12 xl:gap-16">
          <div className="space-y-10 sm:space-y-12">
            <FormSection
              step={1}
              title="Identity"
              description="Name and positioning — what makes them recognizable in your workspace."
            >
              <div className="space-y-5">
                <div>
                  <FieldLabel htmlFor="influencer-name">Name</FieldLabel>
                  <Input
                    id="influencer-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Maya Chen"
                    autoComplete="off"
                    maxLength={80}
                    className="h-11 rounded-xl border-border/60 bg-background/80 text-base tracking-[-0.015em] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="influencer-bio" hint={`${bio.length}/${BIO_MAX}`}>
                    Bio
                  </FieldLabel>
                  <Textarea
                    id="influencer-bio"
                    value={bio}
                    onChange={e => setBio(e.target.value.slice(0, BIO_MAX))}
                    placeholder="Optional — a short note for your team"
                    rows={2}
                    className="min-h-18 resize-none rounded-xl border-border/60 bg-background/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  />
                  <p className="mt-1.5 text-[12px] tracking-[-0.005em] text-muted-foreground">
                    Also steers generation when no creative direction is set.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Gender</FieldLabel>
                    <OptionSegmented
                      aria-label="Gender"
                      value={gender}
                      options={GENDER_OPTIONS}
                      onChange={setGender}
                      layoutId="influencer-gender-indicator"
                    />
                  </div>

                  <div>
                    <FieldLabel>Age range</FieldLabel>
                    <OptionSegmented
                      aria-label="Age range"
                      value={ageRange}
                      options={AGE_RANGE_OPTIONS}
                      onChange={setAgeRange}
                      layoutId="influencer-age-indicator"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel hint={`${niche.length}/${NICHE_MAX}`}>Niche</FieldLabel>
                  <ChipMultiSelect
                    aria-label="Niche"
                    values={niche}
                    options={NICHE_OPTIONS}
                    onChange={setNiche}
                    max={NICHE_MAX}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="influencer-ethnicity">Ethnicity / background</FieldLabel>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {ETHNICITY_OPTIONS.map(option => {
                      const selected = ethnicity.trim().toLowerCase() === option.label.toLowerCase()
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setEthnicity(selected ? '' : option.label)}
                          className={cn(
                            'rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-[-0.015em] ring-1 transition-[background-color,color,box-shadow,ring-color] duration-150',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
                            selected
                              ? 'bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-foreground'
                              : 'bg-muted/25 text-muted-foreground ring-border/30 hover:bg-muted/40 hover:text-foreground hover:ring-border/45',
                          )}
                        >
                          {option.label}
                        </button>
                      )
                    })}
                  </div>
                  <Input
                    id="influencer-ethnicity"
                    value={ethnicity}
                    onChange={e => setEthnicity(e.target.value)}
                    placeholder="Or type a custom background…"
                    className="rounded-xl border-border/60 bg-background/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  />
                </div>
              </div>
            </FormSection>

            <div aria-hidden className="h-px bg-border/40" />

            <FormSection
              step={2}
              title="Appearance"
              description="Physical traits locked into every future generation of this person."
            >
              <div className="space-y-6">
                <div>
                  <FieldLabel>Hair color</FieldLabel>
                  <SwatchPicker
                    aria-label="Hair color"
                    value={appearance.hairColor}
                    options={HAIR_COLOR_OPTIONS}
                    onChange={v => updateAppearance('hairColor', v)}
                  />
                  <p className="mt-2.5 text-[12px] tracking-[-0.005em] text-muted-foreground">
                    {labelForSwatch(HAIR_COLOR_OPTIONS, appearance.hairColor)}
                  </p>
                </div>

                <div>
                  <FieldLabel>Hair style</FieldLabel>
                  <ChipSingleSelect
                    aria-label="Hair style"
                    value={appearance.hairStyle}
                    options={HAIR_STYLE_OPTIONS}
                    onChange={v => updateAppearance('hairStyle', v)}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Eye color</FieldLabel>
                    <SwatchPicker
                      aria-label="Eye color"
                      value={appearance.eyeColor}
                      options={EYE_COLOR_OPTIONS}
                      onChange={v => updateAppearance('eyeColor', v)}
                    />
                  </div>

                  <div>
                    <FieldLabel>Skin tone</FieldLabel>
                    <SwatchPicker
                      aria-label="Skin tone"
                      value={appearance.skinTone}
                      options={SKIN_TONE_OPTIONS}
                      onChange={v => updateAppearance('skinTone', v)}
                    />
                    <p className="mt-2.5 text-[12px] tracking-[-0.005em] text-muted-foreground">
                      {labelForSwatch(SKIN_TONE_OPTIONS, appearance.skinTone)}
                    </p>
                  </div>
                </div>

                <div>
                  <FieldLabel>Body shape</FieldLabel>
                  <ChoiceGrid
                    aria-label="Body shape"
                    value={appearance.bodyShape}
                    options={BODY_SHAPE_OPTIONS}
                    onChange={v => updateAppearance('bodyShape', v)}
                  />
                </div>

                <div>
                  <FieldLabel>Height</FieldLabel>
                  <OptionSegmented
                    aria-label="Height"
                    value={appearance.height}
                    options={HEIGHT_OPTIONS}
                    onChange={(v: InfluencerHeight) => updateAppearance('height', v)}
                    layoutId="influencer-height-indicator"
                  />
                </div>

                {showFacialHair ? (
                  <div>
                    <FieldLabel>Facial hair</FieldLabel>
                    <ChipSingleSelect
                      aria-label="Facial hair"
                      value={appearance.facialHair}
                      options={FACIAL_HAIR_OPTIONS}
                      onChange={v => updateAppearance('facialHair', v as InfluencerFacialHair)}
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
                      onChange={v => updateAppearance('makeup', v as InfluencerMakeupStyle)}
                    />
                  </div>
                ) : null}

                <div>
                  <FieldLabel>Distinguishing features</FieldLabel>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {FEATURE_SUGGESTIONS.map(tag => {
                      const selected = appearance.distinguishingFeatures.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => (selected ? removeFeature(tag) : addFeature(tag))}
                          className={cn(
                            'rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-[-0.015em] ring-1 transition-[background-color,color,box-shadow,ring-color] duration-150',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
                            selected
                              ? 'bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-foreground'
                              : 'bg-muted/25 text-muted-foreground ring-border/30 hover:bg-muted/40 hover:text-foreground hover:ring-border/45',
                          )}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={featureDraft}
                      onChange={e => setFeatureDraft(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addFeature(featureDraft)
                        }
                      }}
                      placeholder="Add custom feature…"
                      className="rounded-xl border-border/60 bg-background/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-10 shrink-0 rounded-xl"
                      onClick={() => addFeature(featureDraft)}
                      aria-label="Add feature"
                    >
                      <PlusIcon className="size-4" strokeWidth={1.75} />
                    </Button>
                  </div>
                  {appearance.distinguishingFeatures.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {appearance.distinguishingFeatures.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-muted/40 px-2.5 py-1 text-xs font-medium tracking-[-0.01em] ring-1 ring-border/30"
                        >
                          {tag}
                          <button
                            type="button"
                            aria-label={`Remove ${tag}`}
                            onClick={() => removeFeature(tag)}
                            className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <XIcon className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </FormSection>

            <div aria-hidden className="h-px bg-border/40" />

            <FormSection
              step={3}
              title="Style"
              description="Creative direction, photo look, and vibe — steers scenes without changing core identity."
            >
              <div className="space-y-6">
                <div>
                  <FieldLabel htmlFor="influencer-directions" hint={`${directions.length}/${DIRECTIONS_MAX}`}>
                    Creative direction
                  </FieldLabel>
                  <Textarea
                    id="influencer-directions"
                    value={directions}
                    onChange={e => setDirections(e.target.value.slice(0, DIRECTIONS_MAX))}
                    placeholder={DIRECTIONS_PLACEHOLDER}
                    rows={3}
                    className="min-h-24 resize-none rounded-xl border-border/60 bg-background/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  />
                  <p className="mt-1.5 text-[12px] tracking-[-0.005em] text-muted-foreground">
                    Describe scenes, outfits, and mood — steers every generated image.
                  </p>
                </div>

                <div>
                  <FieldLabel>Photo style</FieldLabel>
                  <OptionSegmented
                    aria-label="Photo style"
                    value={photoStyle}
                    options={PHOTO_STYLE_OPTIONS}
                    onChange={setPhotoStyle}
                    layoutId="influencer-photo-style-indicator"
                  />
                </div>

                <div>
                  <FieldLabel hint={`${aestheticTags.length}/${AESTHETIC_MAX}`}>Aesthetic</FieldLabel>
                  <ChipMultiSelect
                    aria-label="Aesthetic"
                    values={aestheticTags}
                    options={AESTHETIC_OPTIONS}
                    onChange={setAestheticTags}
                    max={AESTHETIC_MAX}
                  />
                </div>
              </div>
            </FormSection>

            <div className="hidden lg:block">
              <Button
                type="button"
                size="lg"
                disabled={pending || !canSubmit}
                onClick={handleGenerate}
                className="h-11 min-w-56 rounded-xl text-[15px] tracking-[-0.015em]"
              >
                <SparklesIcon className="size-4" strokeWidth={1.75} />
                {pending ? 'Creating…' : 'Generate influencer'}
              </Button>
              {!canSubmit ? (
                <p className="mt-2.5 text-[12px] text-muted-foreground">
                  Add a name and at least one niche to continue.
                </p>
              ) : null}
            </div>
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <InfluencerCreatePreview
              name={name}
              gender={gender}
              ageRange={ageRange}
              niche={niche}
              ethnicity={ethnicity}
              hairColor={appearance.hairColor}
              hairStyle={appearance.hairStyle}
              eyeColor={appearance.eyeColor}
              skinTone={appearance.skinTone}
              bodyShape={appearance.bodyShape}
              height={appearance.height}
              aestheticTags={aestheticTags}
              distinguishingFeatures={appearance.distinguishingFeatures}
              directions={directions}
              photoStyle={photoStyle}
              facialHair={showFacialHair ? appearance.facialHair : undefined}
              makeup={showMakeup ? appearance.makeup : undefined}
            />
          </div>
        </div>
      </div>

      <div className="video-studio-glass fixed inset-x-0 bottom-0 z-30 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex max-w-lg flex-col gap-2">
          <Button
            type="button"
            size="lg"
            disabled={pending || !canSubmit}
            onClick={handleGenerate}
            className="h-11 w-full rounded-xl text-[15px] tracking-[-0.015em]"
          >
            <SparklesIcon className="size-4" strokeWidth={1.75} />
            {pending ? 'Creating…' : 'Generate influencer'}
          </Button>
          {!canSubmit ? (
            <p className="text-center text-[12px] text-muted-foreground">
              Add a name and at least one niche to continue.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
