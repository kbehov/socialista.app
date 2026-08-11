'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import {
  ACCESSORY_OPTIONS,
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
  INFLUENCER_ACCESSORIES_MAX,
  INFLUENCER_SCENES_MAX,
  labelForChoice,
  labelForSwatch,
  MAKEUP_OPTIONS,
  NICHE_OPTIONS,
  PHOTO_STYLE_OPTIONS,
  SCENE_OPTIONS,
  SHOT_PACK_OPTIONS,
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
import {
  AttachedMediaThumb,
  AttachImagesDialog,
  type AttachedImage,
} from '@/components/files/attach-images-dialog'
import { cn } from '@/lib/utils'
import { createInfluencer } from '@/services/influencer.service'
import { formatModelCost } from '@/utils/format'
import type {
  InfluencerAgeRange,
  InfluencerFacialHair,
  InfluencerGender,
  InfluencerHeight,
  InfluencerMakeupStyle,
  InfluencerPhotoStyle,
  InfluencerShotPack,
  Model,
} from '@socialista/types'
import { INFLUENCER_DEFAULT_MODEL, INFLUENCER_SHOT_PACK_SPEC } from '@socialista/types'
import {
  ArrowLeftIcon,
  DicesIcon,
  ImagePlusIcon,
  PlusIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { InfluencerCreatePreview } from './influencer-create-preview'
import { InfluencerAvatarSilhouette } from './influencer-avatar-silhouette'
import { InfluencerModelPicker } from './influencer-model-picker'
import {
  AdvancedCollapsible,
  ChipMultiSelect,
  ChipSingleSelect,
  ChoiceGrid,
  FieldLabel,
  OptionSegmented,
  SwatchPicker,
} from './influencer-option-controls'

type InfluencerCreateWorkspaceProps = {
  workspaceId: string
  models: Model[]
}

const NICHE_MAX = 3
const AESTHETIC_MAX = 3
const FEATURE_MAX = 3
const BIO_MAX = 200
const DIRECTIONS_MAX = 500
const MAX_USER_REFERENCE_IMAGES = 3

type Phase = 'start' | 'design'

const PHASE_SPRING = { type: 'spring' as const, bounce: 0, duration: 0.35 }

export function InfluencerCreateWorkspace({ workspaceId, models }: InfluencerCreateWorkspaceProps) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [pending, startTransition] = useTransition()
  const [phase, setPhase] = useState<Phase>('start')
  const [attachDialogOpen, setAttachDialogOpen] = useState(false)
  const [referenceImages, setReferenceImages] = useState<AttachedImage[]>([])
  const [form, setForm] = useState<InfluencerCreateFormState>(cloneDefaultForm)
  const [featureDraft, setFeatureDraft] = useState('')
  const [selectedModelId, setSelectedModelId] = useState(() => {
    const preferred = models.find(m => m.value === INFLUENCER_DEFAULT_MODEL)
    return preferred?._id ?? models[0]?._id ?? ''
  })

  const {
    name,
    bio,
    directions,
    gender,
    ageRange,
    niche,
    scenes,
    ethnicity,
    appearance,
    aestheticTags,
    photoStyle,
    shotPack,
  } = form

  const selectedModel = useMemo(
    () => models.find(m => m._id === selectedModelId) ?? models[0],
    [models, selectedModelId],
  )
  const packSpec = INFLUENCER_SHOT_PACK_SPEC[shotPack]
  const generationCost = selectedModel ? selectedModel.cost * packSpec.billed : 0
  const hasReferenceImages = referenceImages.length > 0
  const canGenerate =
    name.trim().length > 0 &&
    !!selectedModel &&
    (hasReferenceImages || niche.length > 0)
  const showFacialHair = gender === 'male'
  const showMakeup = gender === 'female' || gender === 'non-binary'

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

  function enterDesign(next: InfluencerCreateFormState) {
    applyForm(next)
    setPhase('design')
  }

  function handleSelectPreset(preset: InfluencerPreset) {
    enterDesign(clonePresetForm(preset))
  }

  function handleStartScratch() {
    enterDesign(cloneDefaultForm())
  }

  function handleSurpriseMe() {
    enterDesign(randomizeInfluencerForm())
  }

  function handleBack() {
    if (phase === 'design') {
      setPhase('start')
    }
  }

  function focusMissingField() {
    if (!name.trim()) {
      document.getElementById('influencer-name')?.focus()
      document.getElementById('section-identity')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (!hasReferenceImages && niche.length === 0) {
      document.getElementById('section-identity')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (!hasReferenceImages) {
      document.getElementById('section-references')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function handleGenerate() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error('Give your influencer a name')
      focusMissingField()
      return
    }
    if (!hasReferenceImages && niche.length === 0) {
      toast.error('Attach reference photos or pick at least one niche')
      focusMissingField()
      return
    }
    if (!selectedModel) {
      toast.error('Select a generation model')
      document.getElementById('section-style')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    startTransition(async () => {
      const response = await createInfluencer({
        workspaceId,
        model: selectedModel.value,
        name: trimmedName,
        bio: bio.trim() || undefined,
        directions: directions.trim() || undefined,
        gender,
        ageRange,
        niche,
        scenes: scenes.length > 0 ? scenes : undefined,
        ethnicity: ethnicity.trim()
          ? (ETHNICITY_OPTIONS.find(o => o.id === ethnicity.trim())?.label ?? ethnicity.trim())
          : undefined,
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
          accessories:
            appearance.accessories.length > 0 ? appearance.accessories : undefined,
        },
        aestheticTags,
        photoStyle,
        shotPack,
        ...(hasReferenceImages
          ? { userReferenceImageUrls: referenceImages.map(image => image.url) }
          : {}),
      })

      if (!response.success || !response.data?.influencer) {
        toast.error(response.message ?? 'Failed to create influencer')
        return
      }

      toast.success('Generating your influencer…')
      router.push(DASHBOARD_ROUTES.STUDIO.influencer(response.data.influencer._id))
    })
  }

  const previewProps = {
    name,
    gender,
    ageRange,
    niche,
    scenes,
    ethnicity,
    hairColor: appearance.hairColor,
    hairStyle: appearance.hairStyle,
    eyeColor: appearance.eyeColor,
    skinTone: appearance.skinTone,
    bodyShape: appearance.bodyShape,
    height: appearance.height,
    aestheticTags,
    accessories: appearance.accessories,
    distinguishingFeatures: appearance.distinguishingFeatures,
    directions,
    photoStyle,
    shotPack,
    facialHair: showFacialHair ? appearance.facialHair : undefined,
    makeup: showMakeup ? appearance.makeup : undefined,
  }

  const generateFooter = (
    <div className="space-y-3">
      <InfluencerModelPicker
        models={models}
        value={selectedModelId}
        onChange={setSelectedModelId}
        shotCount={packSpec.billed}
        disabled={pending}
        size="compact"
        showBreakdown={false}
      />
      <Button
        type="button"
        size="lg"
        disabled={pending || !canGenerate}
        onClick={handleGenerate}
        className="h-11 w-full rounded-xl text-[15px] tracking-[-0.015em]"
      >
        <SparklesIcon className="size-4" strokeWidth={1.75} />
        {pending
          ? 'Creating…'
          : selectedModel
            ? `Generate · ${formatModelCost(generationCost, selectedModel.costUnit)}`
            : 'Generate influencer'}
      </Button>
      <p className="text-center text-[12px] leading-relaxed text-muted-foreground">
        ~1–2 min · {packSpec.shots} identity shots
      </p>
      {!canGenerate && selectedModel ? (
        <p className="text-center text-[12px] text-muted-foreground/80">
          {hasReferenceImages
            ? 'Add a name to generate'
            : 'Add a name and reference photos or a niche'}
        </p>
      ) : null}
    </div>
  )

  return (
    <div className="image-studio relative flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-140 overflow-hidden">
        <div className="absolute left-1/2 -top-32 h-112 w-200 -translate-x-1/2 rounded-full bg-foreground/[0.022] blur-[100px]" />
        <div className="absolute right-[8%] top-20 h-48 w-56 rounded-full bg-foreground/[0.015] blur-[80px]" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none sticky top-0 z-10 h-12 bg-linear-to-b from-background via-background/85 to-transparent motion-reduce:hidden"
      />

      <div
        className={cn(
          'relative mx-auto w-full px-4 pb-28 pt-4 sm:px-6 sm:pt-6 lg:px-8',
          phase === 'start' ? 'max-w-3xl' : 'max-w-6xl lg:pb-10',
        )}
      >
        <header className="mb-6 sm:mb-8">
          <div className="mb-5 flex items-center gap-2">
            {phase === 'start' ? (
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
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleBack}
                className="rounded-full text-muted-foreground hover:text-foreground"
                aria-label="Back to start"
              >
                <ArrowLeftIcon className="size-4" strokeWidth={1.75} />
              </Button>
            )}
            <span className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground/70 uppercase">
              AI Influencers
            </span>
          </div>

          {phase === 'start' ? (
            <div className="max-w-xl space-y-2">
              <h1 className="text-balance text-[1.875rem] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-[2.125rem]">
                Create influencer
              </h1>
              <p className="text-pretty text-[15px] leading-[1.55] tracking-[-0.01em] text-muted-foreground">
                Start from a persona, or build your own.
              </p>
            </div>
          ) : (
            <div className="max-w-xl space-y-1.5">
              <h1 className="text-balance text-[1.625rem] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-[1.875rem]">
                Design your influencer
              </h1>
              <p className="text-pretty text-[14px] leading-[1.5] tracking-[-0.01em] text-muted-foreground">
                Tune identity and look — generate when you&apos;re ready.
              </p>
            </div>
          )}
        </header>

        <AnimatePresence mode="wait" initial={false}>
          {phase === 'start' ? (
            <motion.div
              key="start"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={reduceMotion ? { duration: 0 } : PHASE_SPRING}
            >
              <StartStep
                onSelectPreset={handleSelectPreset}
                onScratch={handleStartScratch}
                onSurprise={handleSurpriseMe}
              />
            </motion.div>
          ) : (
            <motion.div
              key="design"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={reduceMotion ? { duration: 0 } : PHASE_SPRING}
            >
              <div className="mb-5 lg:hidden">
                <InfluencerCreatePreview {...previewProps} variant="compact" />
              </div>

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10 xl:gap-12">
                <div className="min-w-0">
                  <DesignForm
                    form={form}
                    featureDraft={featureDraft}
                    showFacialHair={showFacialHair}
                    showMakeup={showMakeup}
                    models={models}
                    selectedModelId={selectedModelId}
                    onSelectedModelChange={setSelectedModelId}
                    modelPickerDisabled={pending}
                    onNameChange={v => setForm(prev => ({ ...prev, name: v }))}
                    onBioChange={v => setForm(prev => ({ ...prev, bio: v }))}
                    onGenderChange={v => setForm(prev => ({ ...prev, gender: v }))}
                    onAgeRangeChange={v => setForm(prev => ({ ...prev, ageRange: v }))}
                    onNicheChange={v => setForm(prev => ({ ...prev, niche: v }))}
                    onScenesChange={v => setForm(prev => ({ ...prev, scenes: v }))}
                    onEthnicityChange={v => setForm(prev => ({ ...prev, ethnicity: v }))}
                    onDirectionsChange={v => setForm(prev => ({ ...prev, directions: v }))}
                    onPhotoStyleChange={v => setForm(prev => ({ ...prev, photoStyle: v }))}
                    onShotPackChange={v => setForm(prev => ({ ...prev, shotPack: v }))}
                    onAestheticChange={v => setForm(prev => ({ ...prev, aestheticTags: v }))}
                    onFeatureDraftChange={setFeatureDraft}
                    onUpdateAppearance={updateAppearance}
                    onAddFeature={addFeature}
                    onRemoveFeature={removeFeature}
                    referenceImages={referenceImages}
                    onReferenceImagesChange={setReferenceImages}
                    onOpenAttachDialog={() => setAttachDialogOpen(true)}
                    referencesDisabled={pending}
                  />

                  <div className="mt-10 hidden lg:block">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleBack}
                      className="rounded-xl text-muted-foreground"
                    >
                      Back
                    </Button>
                  </div>
                </div>

                <div className="hidden lg:block">
                  <div className="sticky top-6">
                    <InfluencerCreatePreview
                      {...previewProps}
                      variant="panel"
                      footer={generateFooter}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === 'design' ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/40 bg-background/90 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-lg flex-col gap-2.5">
            <InfluencerModelPicker
              models={models}
              value={selectedModelId}
              onChange={setSelectedModelId}
              shotCount={packSpec.billed}
              disabled={pending}
              size="compact"
              showBreakdown={false}
            />
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
                disabled={pending || !canGenerate}
                onClick={handleGenerate}
                className="h-11 flex-1 rounded-xl text-[15px] tracking-[-0.015em]"
              >
                <SparklesIcon className="size-4" strokeWidth={1.75} />
                {pending
                  ? 'Creating…'
                  : selectedModel
                    ? `Generate · ${formatModelCost(generationCost, selectedModel.costUnit)}`
                    : 'Generate'}
              </Button>
            </div>
            {!canGenerate && selectedModel ? (
              <p className="text-center text-[12px] text-muted-foreground">
                {hasReferenceImages
                  ? 'Add a name to generate'
                  : 'Add a name and reference photos or a niche'}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <AttachImagesDialog
        open={attachDialogOpen}
        accept="image"
        onOpenChange={setAttachDialogOpen}
        maxImagesSelect={MAX_USER_REFERENCE_IMAGES}
        initialSelected={referenceImages}
        workspaceId={workspaceId}
        title="Attach reference images"
        description="Optional. Up to 3 photos — we generate similar variations (same face, lighting, wardrobe vibe, and set mood)."
        onSelect={setReferenceImages}
      />
    </div>
  )
}

/* ─── Start ─────────────────────────────────────────────────────────────── */

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
        <div className="grid gap-2.5 sm:grid-cols-2">
          {INFLUENCER_PRESETS.map(preset => {
            const sceneLabels = preset.form.scenes
              .slice(0, 3)
              .map(id => labelForChoice(SCENE_OPTIONS, id))
            return (
            <motion.button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              whileTap={reduceMotion ? undefined : { scale: 0.985 }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.28 }}
              className={cn(
                'group flex flex-col gap-3 rounded-xl p-3.5 text-left sm:p-4',
                'bg-muted/10 ring-1 ring-border/35 transition-[background-color,ring-color] duration-150',
                'hover:bg-muted/20 hover:ring-border/50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
              )}
            >
              <div className="flex items-start gap-3">
                <InfluencerAvatarSilhouette
                  skinTone={preset.form.appearance.skinTone}
                  hairColor={preset.form.appearance.hairColor}
                  eyeColor={preset.form.appearance.eyeColor}
                  hairStyle={preset.form.appearance.hairStyle}
                  facialHair={preset.form.appearance.facialHair}
                  size="sm"
                  className="shrink-0 scale-90"
                />
                <div className="min-w-0 flex-1 space-y-0.5 pt-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[14px] font-semibold tracking-[-0.02em] text-foreground">
                      {preset.title}
                    </p>
                    <span className="shrink-0 rounded-full bg-muted/40 px-2 py-0.5 text-[10px] font-medium tracking-[0.04em] text-muted-foreground uppercase ring-1 ring-border/30">
                      {INFLUENCER_SHOT_PACK_SPEC[preset.shotPack].shots} shots
                    </span>
                  </div>
                  <p className="text-[12px] font-medium tracking-[-0.01em] text-foreground/70">
                    {preset.useCase}
                  </p>
                  <p className="text-[13px] leading-[1.4] tracking-[-0.01em] text-muted-foreground">
                    {preset.description}
                  </p>
                  {sceneLabels.length > 0 ? (
                    <p className="pt-1 text-[11px] tracking-[-0.01em] text-muted-foreground/75">
                      {sceneLabels.join(' · ')}
                    </p>
                  ) : null}
                </div>
              </div>
            </motion.button>
            )
          })}
        </div>
      </div>

      <Separator className="bg-border/40" />

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onScratch}
          className="h-11 flex-1 rounded-xl text-[14px] tracking-[-0.015em]"
        >
          Start from scratch
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onSurprise}
          className="h-11 flex-1 rounded-xl text-[14px] tracking-[-0.015em] text-muted-foreground hover:text-foreground"
        >
          <DicesIcon className="size-3.5" strokeWidth={1.75} />
          Surprise me
        </Button>
      </div>
    </div>
  )
}

/* ─── Design form (Identity + Look + Style) ─────────────────────────────── */

function DesignForm({
  form,
  featureDraft,
  showFacialHair,
  showMakeup,
  models,
  selectedModelId,
  onSelectedModelChange,
  modelPickerDisabled,
  onNameChange,
  onBioChange,
  onGenderChange,
  onAgeRangeChange,
  onNicheChange,
  onScenesChange,
  onEthnicityChange,
  onDirectionsChange,
  onPhotoStyleChange,
  onShotPackChange,
  onAestheticChange,
  onFeatureDraftChange,
  onUpdateAppearance,
  onAddFeature,
  onRemoveFeature,
  referenceImages,
  onReferenceImagesChange,
  onOpenAttachDialog,
  referencesDisabled,
}: {
  form: InfluencerCreateFormState
  featureDraft: string
  showFacialHair: boolean
  showMakeup: boolean
  models: Model[]
  selectedModelId: string
  onSelectedModelChange: (id: string) => void
  modelPickerDisabled?: boolean
  onNameChange: (v: string) => void
  onBioChange: (v: string) => void
  onGenderChange: (v: InfluencerGender) => void
  onAgeRangeChange: (v: InfluencerAgeRange) => void
  onNicheChange: (v: string[]) => void
  onScenesChange: (v: string[]) => void
  onEthnicityChange: (v: string) => void
  onDirectionsChange: (v: string) => void
  onPhotoStyleChange: (v: InfluencerPhotoStyle) => void
  onShotPackChange: (v: InfluencerShotPack) => void
  onAestheticChange: (v: string[]) => void
  onFeatureDraftChange: (v: string) => void
  onUpdateAppearance: <K extends keyof InfluencerCreateFormState['appearance']>(
    key: K,
    value: InfluencerCreateFormState['appearance'][K],
  ) => void
  onAddFeature: (raw: string) => void
  onRemoveFeature: (tag: string) => void
  referenceImages: AttachedImage[]
  onReferenceImagesChange: (images: AttachedImage[]) => void
  onOpenAttachDialog: () => void
  referencesDisabled?: boolean
}) {
  const {
    name,
    bio,
    directions,
    gender,
    ageRange,
    niche,
    scenes,
    ethnicity,
    appearance,
    aestheticTags,
    photoStyle,
    shotPack,
  } = form

  return (
    <div className="space-y-10">
      <section id="section-identity" className="scroll-mt-24 space-y-5">
        <SectionHeading>Identity</SectionHeading>

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

        <div id="section-references">
          <FieldLabel
            hint={`${referenceImages.length}/${MAX_USER_REFERENCE_IMAGES}`}
            icon={ImagePlusIcon}
          >
            Reference photos
          </FieldLabel>
          <p className="mb-3 text-[12px] tracking-[-0.005em] text-muted-foreground">
            {referenceImages.length > 0
              ? 'References drive face + vibe. Everything below is optional — you can generate now.'
              : 'Up to 3 photos (e.g. Pinterest saves). Attach these to skip look options and generate fast.'}
          </p>

          {referenceImages.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {referenceImages.map(image => (
                <AttachedMediaThumb
                  key={image.id}
                  file={image}
                  size="sm"
                  disabled={referencesDisabled}
                  onRemove={id =>
                    onReferenceImagesChange(referenceImages.filter(item => item.id !== id))
                  }
                />
              ))}
            </div>
          ) : null}

          <Button
            type="button"
            variant="outline"
            disabled={referencesDisabled}
            onClick={onOpenAttachDialog}
            className="h-10 rounded-xl border-border/60"
          >
            <ImagePlusIcon className="size-4" strokeWidth={1.75} />
            {referenceImages.length > 0
              ? `Manage references (${referenceImages.length})`
              : 'Attach references'}
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel
              icon={FIELD_ICONS.gender}
              hint={referenceImages.length > 0 ? 'Optional' : undefined}
            >
              Gender
            </FieldLabel>
            <OptionSegmented
              aria-label="Gender"
              value={gender}
              options={GENDER_OPTIONS}
              onChange={onGenderChange}
              layoutId="influencer-gender-indicator"
            />
          </div>
          <div>
            <FieldLabel
              icon={FIELD_ICONS.age}
              hint={referenceImages.length > 0 ? 'Optional' : undefined}
            >
              Age range
            </FieldLabel>
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
          <FieldLabel
            hint={
              referenceImages.length > 0
                ? `Optional · ${niche.length}/${NICHE_MAX}`
                : `${niche.length}/${NICHE_MAX}`
            }
            icon={FIELD_ICONS.niche}
          >
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
          </div>
        </AdvancedCollapsible>
      </section>

      <Separator className="bg-border/40" />

      <section id="section-look" className="scroll-mt-24 space-y-6">
        <SectionHeading>
          {referenceImages.length > 0 ? 'Look (optional)' : 'Look'}
        </SectionHeading>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <FieldLabel icon={FIELD_ICONS.skinTone}>Skin tone</FieldLabel>
            <SwatchPicker
              aria-label="Skin tone"
              value={appearance.skinTone}
              options={SKIN_TONE_OPTIONS}
              onChange={v => onUpdateAppearance('skinTone', v)}
            />
            <p className="mt-2 text-[12px] tracking-[-0.005em] text-muted-foreground">
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
            <p className="mt-2 text-[12px] tracking-[-0.005em] text-muted-foreground">
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
          <p className="mt-2 text-[12px] tracking-[-0.005em] text-muted-foreground">
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

        <AdvancedCollapsible label="Advanced — distinguishing features" icon={FIELD_ICONS.features}>
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
                      atMax &&
                        'cursor-not-allowed opacity-40 hover:bg-muted/25 hover:text-muted-foreground hover:ring-border/30',
                    )}
                  >
                    {FeatureIcon ? (
                      <FeatureIcon className="size-3.5 shrink-0 stroke-[1.75]" aria-hidden />
                    ) : null}
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
      </section>

      <Separator className="bg-border/40" />

      <section id="section-style" className="scroll-mt-24 space-y-5">
        <SectionHeading>
          {referenceImages.length > 0 ? 'Style (optional)' : 'Style'}
        </SectionHeading>

        <div>
          <FieldLabel icon={FIELD_ICONS.model}>Model</FieldLabel>
          <InfluencerModelPicker
            models={models}
            value={selectedModelId}
            onChange={onSelectedModelChange}
            shotCount={INFLUENCER_SHOT_PACK_SPEC[shotPack].billed}
            disabled={modelPickerDisabled}
          />
        </div>

        <div>
          <FieldLabel icon={FIELD_ICONS.shotPack}>Shot pack</FieldLabel>
          <ChoiceGrid
            aria-label="Shot pack"
            value={shotPack}
            options={SHOT_PACK_OPTIONS}
            onChange={v => onShotPackChange(v as InfluencerShotPack)}
            iconGroup="shotPack"
          />
        </div>

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
            hint={`${scenes.length}/${INFLUENCER_SCENES_MAX}`}
            icon={FIELD_ICONS.scenes}
          >
            Scenes
          </FieldLabel>
          <ChipMultiSelect
            aria-label="Scenes"
            values={scenes}
            options={SCENE_OPTIONS}
            onChange={onScenesChange}
            max={INFLUENCER_SCENES_MAX}
            iconGroup="scene"
          />
          <p className="mt-1.5 text-[12px] tracking-[-0.005em] text-muted-foreground">
            UGC situations for TikTok / Instagram — rotates across the shot pack.
          </p>
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

        <div>
          <FieldLabel
            htmlFor="influencer-directions"
            hint={`${directions.length}/${DIRECTIONS_MAX}`}
            icon={FIELD_ICONS.directions}
          >
            Extra direction
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
            Optional mood or outfit notes on top of scenes and accessories.
          </p>
        </div>
      </section>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">{children}</h2>
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
  const presetMatch = ETHNICITY_OPTIONS.find(
    o =>
      o.id.toLowerCase() === trimmed.toLowerCase() ||
      o.label.toLowerCase() === trimmed.toLowerCase(),
  )
  const [customMode, setCustomMode] = useState(() => trimmed.length > 0 && !presetMatch)
  const showCustomInput = customMode || (trimmed.length > 0 && !presetMatch)

  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Ethnicity / background" className="flex flex-wrap gap-2">
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
              onClick={() => {
                setCustomMode(false)
                onChange(selected ? '' : option.id)
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
