'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import {
  AESTHETIC_OPTIONS,
  AGE_RANGE_OPTIONS,
  BODY_SHAPE_OPTIONS,
  DIRECTIONS_PLACEHOLDER,
  ETHNICITY_OPTIONS,
  EYE_COLOR_OPTIONS,
  FACIAL_HAIR_OPTIONS,
  FEATURE_SUGGESTIONS,
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
import {
  cloneDefaultForm,
  clonePresetForm,
  INFLUENCER_PRESETS,
  randomizeInfluencerForm,
  type InfluencerCreateFormState,
  type InfluencerPreset,
} from '@/lib/studio/influencers/presets'
import { FEATURE_ICONS, FIELD_ICONS } from '@/lib/studio/influencers/option-icons'
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
import {
  ArrowLeftIcon,
  DicesIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { InfluencerCreatePreview } from './influencer-create-preview'
import { InfluencerAvatarSilhouette } from './influencer-avatar-silhouette'
import {
  AdvancedCollapsible,
  ChipMultiSelect,
  ChipSingleSelect,
  ChoiceGrid,
  FieldLabel,
  FormFieldStack,
  OptionSegmented,
  SwatchPicker,
  WizardProgress,
} from './influencer-option-controls'

type InfluencerCreateWorkspaceProps = {
  workspaceId: string
}

const NICHE_MAX = 3
const AESTHETIC_MAX = 3
const FEATURE_MAX = 3
const BIO_MAX = 200
const DIRECTIONS_MAX = 500

type WizardStep = 0 | 1 | 2 | 3 | 4

const STEP_SPRING = { type: 'spring' as const, bounce: 0, duration: 0.35 }

export function InfluencerCreateWorkspace({ workspaceId }: InfluencerCreateWorkspaceProps) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [pending, startTransition] = useTransition()
  const [step, setStep] = useState<WizardStep>(0)
  const [direction, setDirection] = useState(1)
  const [form, setForm] = useState<InfluencerCreateFormState>(cloneDefaultForm)
  const [featureDraft, setFeatureDraft] = useState('')

  const { name, bio, directions, gender, ageRange, niche, ethnicity, appearance, aestheticTags, photoStyle } =
    form

  const canContinueIdentity = name.trim().length > 0 && niche.length > 0
  const showFacialHair = gender === 'male'
  const showMakeup = gender === 'female' || gender === 'non-binary'
  const showCompactPreview = step > 0 && step < 4

  function goTo(next: WizardStep) {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  function applyForm(next: InfluencerCreateFormState) {
    setForm(next)
  }

  function updateAppearance<K extends keyof InfluencerCreateFormState['appearance']>(
    key: K,
    value: InfluencerCreateFormState['appearance'][K],
  ) {
    setForm(prev => ({
      ...prev,
      appearance: { ...prev.appearance, [key]: value },
    }))
  }

  function addFeature(raw: string) {
    const tag = raw.trim().toLowerCase()
    if (!tag) return
    if (
      appearance.distinguishingFeatures.includes(tag) ||
      appearance.distinguishingFeatures.length >= FEATURE_MAX
    ) {
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

  function handleSelectPreset(preset: InfluencerPreset) {
    applyForm(clonePresetForm(preset))
    goTo(1)
  }

  function handleStartScratch() {
    applyForm(cloneDefaultForm())
    goTo(1)
  }

  function handleSurpriseMe() {
    applyForm(randomizeInfluencerForm())
    goTo(1)
  }

  function handleBack() {
    if (step === 0) return
    if (step === 1) {
      goTo(0)
      return
    }
    goTo((step - 1) as WizardStep)
  }

  function handleContinue() {
    if (step === 1 && !canContinueIdentity) return
    if (step >= 4) return
    goTo((step + 1) as WizardStep)
  }

  function handleGenerate() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error('Give your influencer a name')
      goTo(1)
      return
    }
    if (niche.length === 0) {
      toast.error('Pick at least one niche')
      goTo(1)
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

  function onStepKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'Enter' || step < 1 || step > 3) return
    const target = e.target as HTMLElement
    if (target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') return
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).id === 'influencer-feature-draft') {
      return
    }
    e.preventDefault()
    handleContinue()
  }

  const slideVariants = {
    enter: (dir: number) =>
      reduceMotion ? { opacity: 0 } : { x: dir > 0 ? 24 : -24, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: (dir: number) =>
      reduceMotion ? { opacity: 0 } : { x: dir > 0 ? -24 : 24, opacity: 0 },
  }

  const previewProps = {
    name,
    gender,
    ageRange,
    niche,
    ethnicity,
    hairColor: appearance.hairColor,
    hairStyle: appearance.hairStyle,
    eyeColor: appearance.eyeColor,
    skinTone: appearance.skinTone,
    bodyShape: appearance.bodyShape,
    height: appearance.height,
    aestheticTags,
    distinguishingFeatures: appearance.distinguishingFeatures,
    directions,
    photoStyle,
    facialHair: showFacialHair ? appearance.facialHair : undefined,
    makeup: showMakeup ? appearance.makeup : undefined,
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

      <div
        className={cn(
          'relative mx-auto w-full px-4 pb-28 pt-4 sm:px-6 sm:pt-6 lg:px-8',
          step === 0 ? 'max-w-3xl' : 'max-w-2xl',
        )}
      >
        <header className="mb-6 sm:mb-8">
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

          {step === 0 ? (
            <div className="max-w-xl space-y-2">
              <h1 className="font-serif text-balance text-[2rem] font-medium leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[2.25rem]">
                Create your AI influencer
              </h1>
              <p className="text-pretty text-[15px] leading-[1.55] tracking-[-0.01em] text-muted-foreground">
                Start with a ready-made persona, or design one from scratch — you can tweak everything next.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="max-w-xl space-y-2">
                <h1 className="font-serif text-balance text-[1.75rem] font-medium leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[2rem]">
                  {step === 1 && 'Who are they?'}
                  {step === 2 && 'How do they look?'}
                  {step === 3 && 'What is their vibe?'}
                  {step === 4 && 'Ready to generate'}
                </h1>
                <p className="text-pretty text-[14px] leading-[1.55] tracking-[-0.01em] text-muted-foreground sm:text-[15px]">
                  {step === 1 && 'Name, niche, and basics — the identity you will reuse across generations.'}
                  {step === 2 &&
                    'Physical traits locked into every future generation. You can regenerate looks later — nothing here is permanent.'}
                  {step === 3 && 'Photo look and creative direction — steers scenes without changing core identity.'}
                  {step === 4 && 'Review your character, then generate anchor portraits.'}
                </p>
              </div>
              <WizardProgress current={step} onJump={s => goTo(s as WizardStep)} className="max-w-lg" />
            </div>
          )}
        </header>

        {showCompactPreview ? (
          <div className="mb-6 max-w-2xl">
            <InfluencerCreatePreview {...previewProps} />
          </div>
        ) : null}

        <div className="min-w-0 max-w-2xl" onKeyDown={onStepKeyDown}>
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={reduceMotion ? { duration: 0 } : STEP_SPRING}
              >
                {step === 0 ? (
                  <StartStep
                    onSelectPreset={handleSelectPreset}
                    onScratch={handleStartScratch}
                    onSurprise={handleSurpriseMe}
                  />
                ) : null}

                {step === 1 ? (
                  <IdentityStep
                    name={name}
                    bio={bio}
                    gender={gender}
                    ageRange={ageRange}
                    niche={niche}
                    ethnicity={ethnicity}
                    onNameChange={v => setForm(prev => ({ ...prev, name: v }))}
                    onBioChange={v => setForm(prev => ({ ...prev, bio: v }))}
                    onGenderChange={v => setForm(prev => ({ ...prev, gender: v }))}
                    onAgeRangeChange={v => setForm(prev => ({ ...prev, ageRange: v }))}
                    onNicheChange={v => setForm(prev => ({ ...prev, niche: v }))}
                    onEthnicityChange={v => setForm(prev => ({ ...prev, ethnicity: v }))}
                  />
                ) : null}

                {step === 2 ? (
                  <AppearanceStep
                    appearance={appearance}
                    showFacialHair={showFacialHair}
                    showMakeup={showMakeup}
                    featureDraft={featureDraft}
                    onFeatureDraftChange={setFeatureDraft}
                    onUpdateAppearance={updateAppearance}
                    onAddFeature={addFeature}
                    onRemoveFeature={removeFeature}
                  />
                ) : null}

                {step === 3 ? (
                  <StyleStep
                    directions={directions}
                    photoStyle={photoStyle}
                    aestheticTags={aestheticTags}
                    onDirectionsChange={v => setForm(prev => ({ ...prev, directions: v }))}
                    onPhotoStyleChange={v => setForm(prev => ({ ...prev, photoStyle: v }))}
                    onAestheticChange={v => setForm(prev => ({ ...prev, aestheticTags: v }))}
                  />
                ) : null}

                {step === 4 ? (
                  <ReviewStep
                    form={form}
                    showFacialHair={showFacialHair}
                    showMakeup={showMakeup}
                    onEdit={goTo}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>

            {step > 0 && step < 4 ? (
              <div className="mt-10 hidden lg:flex lg:items-center lg:justify-between lg:gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="rounded-xl text-muted-foreground"
                >
                  Back
                </Button>
                <div className="flex flex-col items-end gap-1.5">
                  <Button
                    type="button"
                    size="lg"
                    disabled={step === 1 && !canContinueIdentity}
                    onClick={handleContinue}
                    className="h-11 min-w-40 rounded-xl text-[15px] tracking-[-0.015em]"
                  >
                    Continue
                  </Button>
                  {step === 1 && !canContinueIdentity ? (
                    <p className="text-[12px] text-muted-foreground">
                      Add a name and at least one niche to continue.
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="mt-8 hidden lg:flex lg:items-center lg:justify-between lg:gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="rounded-xl text-muted-foreground"
                >
                  Back
                </Button>
                <div className="flex flex-col items-end gap-1.5">
                  <Button
                    type="button"
                    size="lg"
                    disabled={pending || !canContinueIdentity}
                    onClick={handleGenerate}
                    className="h-11 min-w-56 rounded-xl text-[15px] tracking-[-0.015em]"
                  >
                    <SparklesIcon className="size-4" strokeWidth={1.75} />
                    {pending ? 'Creating…' : 'Generate influencer'}
                  </Button>
                  <p className="max-w-sm text-right text-[12px] leading-relaxed text-muted-foreground">
                    Takes ~1–2 minutes. We&apos;ll create anchor portraits you can reuse everywhere.
                  </p>
                </div>
              </div>
            ) : null}
        </div>
      </div>

      {step > 0 ? (
        <div className="video-studio-glass fixed inset-x-0 bottom-0 z-30 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
          <div className="mx-auto flex max-w-lg flex-col gap-2">
            {step < 4 ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  className="h-11 shrink-0 rounded-xl px-5"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  size="lg"
                  disabled={step === 1 && !canContinueIdentity}
                  onClick={handleContinue}
                  className="h-11 flex-1 rounded-xl text-[15px] tracking-[-0.015em]"
                >
                  Continue
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  className="h-11 shrink-0 rounded-xl px-5"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  size="lg"
                  disabled={pending || !canContinueIdentity}
                  onClick={handleGenerate}
                  className="h-11 flex-1 rounded-xl text-[15px] tracking-[-0.015em]"
                >
                  <SparklesIcon className="size-4" strokeWidth={1.75} />
                  {pending ? 'Creating…' : 'Generate influencer'}
                </Button>
              </div>
            )}
            {step === 1 && !canContinueIdentity ? (
              <p className="text-center text-[12px] text-muted-foreground">
                Add a name and at least one niche to continue.
              </p>
            ) : null}
            {step === 4 ? (
              <p className="text-center text-[12px] text-muted-foreground">
                Takes ~1–2 minutes. Anchor portraits you can reuse everywhere.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ─── Step 0: Start ─────────────────────────────────────────────────────── */

function StartStep({
  onSelectPreset,
  onScratch,
  onSurprise,
}: {
  onSelectPreset: (preset: InfluencerPreset) => void
  onScratch: () => void
  onSurprise: () => void
}) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-[11px] font-medium tracking-[0.08em] text-muted-foreground/80 uppercase">
          Starter personas
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {INFLUENCER_PRESETS.map(preset => (
            <motion.button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              whileTap={reduceMotion ? undefined : { scale: 0.985 }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.28 }}
              className={cn(
                'group flex flex-col gap-3.5 rounded-2xl p-4 text-left',
                'bg-muted/12 ring-1 ring-border/30 transition-[background-color,box-shadow,ring-color] duration-150',
                'hover:bg-muted/22 hover:ring-border/45 hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
              )}
            >
              <div className="flex items-start gap-3.5">
                <InfluencerAvatarSilhouette
                  skinTone={preset.form.appearance.skinTone}
                  hairColor={preset.form.appearance.hairColor}
                  eyeColor={preset.form.appearance.eyeColor}
                  hairStyle={preset.form.appearance.hairStyle}
                  facialHair={preset.form.appearance.facialHair}
                  size="sm"
                  className="shrink-0 scale-90"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
                    {preset.title}
                  </p>
                  <p className="text-[13px] leading-[1.45] tracking-[-0.01em] text-muted-foreground">
                    {preset.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <Separator className="bg-border/40" />

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onScratch}
          className="h-11 flex-1 rounded-xl text-[14px] tracking-[-0.015em]"
        >
          Start from scratch
        </Button>
        <button
          type="button"
          onClick={onSurprise}
          className={cn(
            'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4',
            'text-[13px] font-medium tracking-[-0.015em] text-muted-foreground',
            'transition-colors hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
          )}
        >
          <DicesIcon className="size-3.5" strokeWidth={1.75} />
          Surprise me
        </button>
      </div>
    </div>
  )
}

/* ─── Step 1: Identity ──────────────────────────────────────────────────── */

function IdentityStep({
  name,
  bio,
  gender,
  ageRange,
  niche,
  ethnicity,
  onNameChange,
  onBioChange,
  onGenderChange,
  onAgeRangeChange,
  onNicheChange,
  onEthnicityChange,
}: {
  name: string
  bio: string
  gender: InfluencerGender
  ageRange: InfluencerAgeRange
  niche: string[]
  ethnicity: string
  onNameChange: (v: string) => void
  onBioChange: (v: string) => void
  onGenderChange: (v: InfluencerGender) => void
  onAgeRangeChange: (v: InfluencerAgeRange) => void
  onNicheChange: (v: string[]) => void
  onEthnicityChange: (v: string) => void
}) {
  return (
    <FormFieldStack>
      <div>
        <FieldLabel htmlFor="influencer-name" icon={FIELD_ICONS.name}>
          Name
        </FieldLabel>
        <Input
          id="influencer-name"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="e.g. Maya Chen"
          autoComplete="off"
          maxLength={80}
          autoFocus
          className="h-11 rounded-xl border-border/60 bg-background/80 text-base tracking-[-0.015em] shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FieldLabel icon={FIELD_ICONS.gender}>Gender</FieldLabel>
          <OptionSegmented
            aria-label="Gender"
            value={gender}
            options={GENDER_OPTIONS}
            onChange={onGenderChange}
            layoutId="influencer-gender-indicator"
          />
        </div>
        <div>
          <FieldLabel icon={FIELD_ICONS.age}>Age range</FieldLabel>
          <OptionSegmented
            aria-label="Age range"
            value={ageRange}
            options={AGE_RANGE_OPTIONS}
            onChange={onAgeRangeChange}
            layoutId="influencer-age-indicator"
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
          onChange={onNicheChange}
          max={NICHE_MAX}
          iconGroup="niche"
        />
      </div>

      <div>
        <FieldLabel icon={FIELD_ICONS.ethnicity}>Ethnicity / background</FieldLabel>
        <EthnicityPicker value={ethnicity} onChange={onEthnicityChange} />
      </div>

      <AdvancedCollapsible label="Optional — bio" icon={FIELD_ICONS.bio}>
        <div>
          <FieldLabel htmlFor="influencer-bio" hint={`${bio.length}/${BIO_MAX}`}>
            Bio
          </FieldLabel>
          <Textarea
            id="influencer-bio"
            value={bio}
            onChange={e => onBioChange(e.target.value.slice(0, BIO_MAX))}
            placeholder="Optional — a short note for your team"
            rows={2}
            className="min-h-18 resize-none rounded-xl border-border/60 bg-background/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          />
          <p className="mt-1.5 text-[12px] tracking-[-0.005em] text-muted-foreground">
            Also steers generation when no creative direction is set.
          </p>
        </div>
      </AdvancedCollapsible>
    </FormFieldStack>
  )
}

const ETHNICITY_CHIP_CLASSES = cn(
  'rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-[-0.015em] ring-1 transition-[background-color,color,box-shadow,ring-color] duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
)

function EthnicityPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const trimmed = value.trim()
  const presetMatch = ETHNICITY_OPTIONS.find(o => o.label.toLowerCase() === trimmed.toLowerCase())
  const [customMode, setCustomMode] = useState(() => trimmed.length > 0 && !presetMatch)
  const showCustomInput = customMode || (trimmed.length > 0 && !presetMatch)

  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Ethnicity / background" className="flex flex-wrap gap-2">
        {ETHNICITY_OPTIONS.map(option => {
          const selected = !showCustomInput && trimmed.toLowerCase() === option.label.toLowerCase()
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setCustomMode(false)
                onChange(selected ? '' : option.label)
              }}
              className={cn(
                ETHNICITY_CHIP_CLASSES,
                selected
                  ? 'bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-foreground'
                  : 'bg-muted/25 text-muted-foreground ring-border/30 hover:bg-muted/40 hover:text-foreground hover:ring-border/45',
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
          onClick={() => {
            setCustomMode(true)
            if (presetMatch) onChange('')
          }}
          className={cn(
            ETHNICITY_CHIP_CLASSES,
            showCustomInput
              ? 'bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-foreground'
              : 'bg-muted/25 text-muted-foreground ring-border/30 hover:bg-muted/40 hover:text-foreground hover:ring-border/45',
          )}
        >
          Custom…
        </button>
      </div>
      {showCustomInput ? (
        <Input
          id="influencer-ethnicity"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. Nigerian-Irish, Afro-Caribbean…"
          className="rounded-xl border-border/60 bg-background/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        />
      ) : null}
    </div>
  )
}

/* ─── Step 2: Appearance ────────────────────────────────────────────────── */

function AppearanceStep({
  appearance,
  showFacialHair,
  showMakeup,
  featureDraft,
  onFeatureDraftChange,
  onUpdateAppearance,
  onAddFeature,
  onRemoveFeature,
}: {
  appearance: InfluencerCreateFormState['appearance']
  showFacialHair: boolean
  showMakeup: boolean
  featureDraft: string
  onFeatureDraftChange: (v: string) => void
  onUpdateAppearance: <K extends keyof InfluencerCreateFormState['appearance']>(
    key: K,
    value: InfluencerCreateFormState['appearance'][K],
  ) => void
  onAddFeature: (raw: string) => void
  onRemoveFeature: (tag: string) => void
}) {
  return (
    <FormFieldStack>
      <div>
        <SectionHeading>Face</SectionHeading>
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <FieldLabel icon={FIELD_ICONS.skinTone}>Skin tone</FieldLabel>
              <SwatchPicker
                aria-label="Skin tone"
                value={appearance.skinTone}
                options={SKIN_TONE_OPTIONS}
                onChange={v => onUpdateAppearance('skinTone', v)}
              />
              <p className="mt-2.5 text-[12px] tracking-[-0.005em] text-muted-foreground">
                {labelForSwatch(SKIN_TONE_OPTIONS, appearance.skinTone)}
              </p>
            </div>
            <div>
              <FieldLabel icon={FIELD_ICONS.eyeColor}>Eye color</FieldLabel>
              <SwatchPicker
                aria-label="Eye color"
                value={appearance.eyeColor}
                options={EYE_COLOR_OPTIONS}
                onChange={v => onUpdateAppearance('eyeColor', v)}
              />
              <p className="mt-2.5 text-[12px] tracking-[-0.005em] text-muted-foreground">
                {labelForSwatch(EYE_COLOR_OPTIONS, appearance.eyeColor)}
              </p>
            </div>
          </div>

          <div>
            <FieldLabel icon={FIELD_ICONS.hairColor}>Hair color</FieldLabel>
            <SwatchPicker
              aria-label="Hair color"
              value={appearance.hairColor}
              options={HAIR_COLOR_OPTIONS}
              onChange={v => onUpdateAppearance('hairColor', v)}
            />
            <p className="mt-2.5 text-[12px] tracking-[-0.005em] text-muted-foreground">
              {labelForSwatch(HAIR_COLOR_OPTIONS, appearance.hairColor)}
            </p>
          </div>

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
        </div>
      </div>

      <div>
        <SectionHeading>Body & details</SectionHeading>
        <div className="space-y-6">
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
              layoutId="influencer-height-indicator"
            />
          </div>

          <AdvancedCollapsible label="Advanced details — distinguishing features" icon={FIELD_ICONS.features}>
            <div>
              <FieldLabel
                icon={FIELD_ICONS.features}
                hint={`${appearance.distinguishingFeatures.length}/${FEATURE_MAX}`}
              >
                Distinguishing features
              </FieldLabel>
              <div className="mb-3 flex flex-wrap gap-2">
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
                        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium tracking-[-0.015em] ring-1 transition-[background-color,color,box-shadow,ring-color,opacity] duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
                        selected
                          ? 'bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-foreground'
                          : 'bg-muted/25 text-muted-foreground ring-border/30 hover:bg-muted/40 hover:text-foreground hover:ring-border/45',
                        atMax && 'cursor-not-allowed opacity-40 hover:bg-muted/25 hover:text-muted-foreground hover:ring-border/30',
                      )}
                    >
                      {FeatureIcon ? <FeatureIcon className="size-3.5 shrink-0 stroke-[1.75]" aria-hidden /> : null}
                      {tag}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  id="influencer-feature-draft"
                  value={featureDraft}
                  onChange={e => onFeatureDraftChange(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      e.stopPropagation()
                      onAddFeature(featureDraft)
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
                  onClick={() => onAddFeature(featureDraft)}
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
                        onClick={() => onRemoveFeature(tag)}
                        className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <XIcon className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </AdvancedCollapsible>
        </div>
      </div>
    </FormFieldStack>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-[11px] font-medium tracking-[0.08em] text-muted-foreground/80 uppercase">
      {children}
    </p>
  )
}

/* ─── Step 3: Style ─────────────────────────────────────────────────────── */

function StyleStep({
  directions,
  photoStyle,
  aestheticTags,
  onDirectionsChange,
  onPhotoStyleChange,
  onAestheticChange,
}: {
  directions: string
  photoStyle: InfluencerPhotoStyle
  aestheticTags: string[]
  onDirectionsChange: (v: string) => void
  onPhotoStyleChange: (v: InfluencerPhotoStyle) => void
  onAestheticChange: (v: string[]) => void
}) {
  return (
    <FormFieldStack>
      <div>
        <FieldLabel icon={FIELD_ICONS.photoStyle}>Photo style</FieldLabel>
        <ChoiceGrid
          aria-label="Photo style"
          value={photoStyle}
          options={PHOTO_STYLE_OPTIONS}
          onChange={v => onPhotoStyleChange(v as InfluencerPhotoStyle)}
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
          onChange={onAestheticChange}
          max={AESTHETIC_MAX}
          iconGroup="aesthetic"
        />
      </div>

      <div>
        <FieldLabel
          htmlFor="influencer-directions"
          hint={`${directions.length}/${DIRECTIONS_MAX}`}
          icon={FIELD_ICONS.directions}
        >
          Creative direction
        </FieldLabel>
        <Textarea
          id="influencer-directions"
          value={directions}
          onChange={e => onDirectionsChange(e.target.value.slice(0, DIRECTIONS_MAX))}
          placeholder={DIRECTIONS_PLACEHOLDER}
          rows={3}
          className="min-h-24 resize-none rounded-xl border-border/60 bg-background/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        />
        <p className="mt-1.5 text-[12px] tracking-[-0.005em] text-muted-foreground">
          Describe scenes, outfits, and mood — steers every generated image.
        </p>
      </div>
    </FormFieldStack>
  )
}

/* ─── Step 4: Review ────────────────────────────────────────────────────── */

function ReviewStep({
  form,
  showFacialHair,
  showMakeup,
  onEdit,
}: {
  form: InfluencerCreateFormState
  showFacialHair: boolean
  showMakeup: boolean
  onEdit: (step: WizardStep) => void
}) {
  const genderLabel = GENDER_OPTIONS.find(g => g.id === form.gender)?.label ?? form.gender
  const ageLabel = AGE_RANGE_OPTIONS.find(a => a.id === form.ageRange)?.label ?? form.ageRange
  const photoLabel =
    PHOTO_STYLE_OPTIONS.find(o => o.id === form.photoStyle)?.label ?? form.photoStyle
  const facialHairLabel =
    showFacialHair && form.appearance.facialHair !== 'none'
      ? (FACIAL_HAIR_OPTIONS.find(o => o.id === form.appearance.facialHair)?.label ??
        form.appearance.facialHair)
      : null
  const makeupLabel = showMakeup
    ? (MAKEUP_OPTIONS.find(o => o.id === form.appearance.makeup)?.label ?? form.appearance.makeup)
    : null

  return (
    <div className="space-y-0">
      <div className="mb-5 flex items-center gap-4 rounded-2xl bg-muted/15 p-4 ring-1 ring-border/35 sm:p-5">
        <InfluencerAvatarSilhouette
          skinTone={form.appearance.skinTone}
          hairColor={form.appearance.hairColor}
          eyeColor={form.appearance.eyeColor}
          hairStyle={form.appearance.hairStyle}
          facialHair={showFacialHair ? form.appearance.facialHair : undefined}
          size="sm"
          className="shrink-0"
        />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground">
            {form.name.trim() || 'Unnamed influencer'}
          </p>
          <p className="text-[13px] tracking-[-0.01em] text-muted-foreground">
            {genderLabel}
            <span aria-hidden className="mx-1.5 text-border">
              ·
            </span>
            {ageLabel}
            {form.ethnicity.trim() ? (
              <>
                <span aria-hidden className="mx-1.5 text-border">
                  ·
                </span>
                {form.ethnicity.trim()}
              </>
            ) : null}
          </p>
        </div>
      </div>

      <ReviewGroup title="Identity" onEdit={() => onEdit(1)}>
        <ReviewLine label="Niche">
          {form.niche.length > 0
            ? form.niche.map(n => NICHE_OPTIONS.find(o => o.id === n)?.label ?? n).join(' · ')
            : '—'}
        </ReviewLine>
        {form.bio.trim() ? <ReviewLine label="Bio">{form.bio.trim()}</ReviewLine> : null}
      </ReviewGroup>

      <Separator className="my-5 bg-border/40" />

      <ReviewGroup title="Appearance" onEdit={() => onEdit(2)}>
        <ReviewLine label="Look">
          {labelForSwatch(HAIR_COLOR_OPTIONS, form.appearance.hairColor)}{' '}
          {labelForChoice(HAIR_STYLE_OPTIONS, form.appearance.hairStyle)} hair
          <span aria-hidden className="mx-1 text-border">
            ·
          </span>
          {labelForSwatch(EYE_COLOR_OPTIONS, form.appearance.eyeColor)} eyes
          <span aria-hidden className="mx-1 text-border">
            ·
          </span>
          {labelForSwatch(SKIN_TONE_OPTIONS, form.appearance.skinTone)} skin
        </ReviewLine>
        <ReviewLine label="Build">
          {labelForChoice(BODY_SHAPE_OPTIONS, form.appearance.bodyShape)}
          <span aria-hidden className="mx-1 text-border">
            ·
          </span>
          {HEIGHT_OPTIONS.find(h => h.id === form.appearance.height)?.label}
          {facialHairLabel ? (
            <>
              <span aria-hidden className="mx-1 text-border">
                ·
              </span>
              {facialHairLabel}
            </>
          ) : null}
          {makeupLabel ? (
            <>
              <span aria-hidden className="mx-1 text-border">
                ·
              </span>
              {makeupLabel}
            </>
          ) : null}
        </ReviewLine>
        {form.appearance.distinguishingFeatures.length > 0 ? (
          <ReviewLine label="Details">
            {form.appearance.distinguishingFeatures.join(' · ')}
          </ReviewLine>
        ) : null}
      </ReviewGroup>

      <Separator className="my-5 bg-border/40" />

      <ReviewGroup title="Style" onEdit={() => onEdit(3)}>
        <ReviewLine label="Photo">{photoLabel}</ReviewLine>
        {form.aestheticTags.length > 0 ? (
          <ReviewLine label="Vibe">
            {form.aestheticTags
              .map(t => AESTHETIC_OPTIONS.find(o => o.id === t)?.label ?? t)
              .join(' · ')}
          </ReviewLine>
        ) : null}
        {form.directions.trim() ? (
          <ReviewLine label="Direction">
            <span className="line-clamp-4">{form.directions.trim()}</span>
          </ReviewLine>
        ) : null}
      </ReviewGroup>

      <Separator className="my-5 bg-border/40" />

      <div className="flex items-start gap-2.5 rounded-xl bg-muted/25 px-3.5 py-3 ring-1 ring-border/30">
        <SparklesIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        <p className="text-[12px] leading-[1.55] tracking-[-0.005em] text-muted-foreground">
          Takes ~1–2 minutes. We&apos;ll create anchor portraits from this identity — consistent across
          every image and video generation.
        </p>
      </div>
    </div>
  )
}

function ReviewGroup({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-muted/15 p-4 ring-1 ring-border/35 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-semibold tracking-[-0.02em] text-foreground">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
            'text-[12px] font-medium tracking-[-0.01em] text-muted-foreground',
            'ring-1 ring-border/35 transition-colors hover:bg-muted/40 hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
          )}
        >
          <PencilIcon className="size-3" strokeWidth={1.75} />
          Edit
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function ReviewLine({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-medium tracking-[0.06em] text-muted-foreground/80 uppercase">
        {label}
      </p>
      <div className="text-[13px] leading-[1.55] tracking-[-0.01em] text-foreground/90">{children}</div>
    </div>
  )
}
