'use client'

import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { AttachedImage } from '@/components/files/attach-images-dialog'
import {
  ETHNICITY_OPTIONS,
  HAIR_COLOR_OPTIONS,
  EYE_COLOR_OPTIONS,
  SKIN_TONE_OPTIONS,
  labelForSwatch,
} from '@/lib/studio/influencers/options'
import {
  cloneDefaultForm,
  clonePresetForm,
  randomizeInfluencerForm,
  type InfluencerCreateFormState,
  type InfluencerPreset,
} from '@/lib/studio/influencers/presets'
import { createInfluencer } from '@/services/influencer.service'
import { commitHaptic } from '@/utils/haptics'
import type { Model } from '@socialista/types'
import { INFLUENCER_DEFAULT_MODEL } from '@socialista/types'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { InfluencerCreateForm } from './influencer-create-form'
import { InfluencerPresetStrip } from './influencer-preset-strip'

type InfluencerCreateWorkspaceProps = {
  workspaceId: string
  models: Model[]
}

const FEATURE_MAX = 3

function suggestNameFromPrompt(prompt: string): string {
  const trimmed = prompt.trim()
  if (!trimmed) return 'My Influencer'
  const words = trimmed.split(/\s+/).slice(0, 3)
  const candidate = words
    .map(w => w.replace(/[^a-zA-Z'-]/g, ''))
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
  return candidate.length >= 2 ? candidate : 'My Influencer'
}

export function InfluencerCreateWorkspace({ workspaceId, models }: InfluencerCreateWorkspaceProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [referenceImages, setReferenceImages] = useState<AttachedImage[]>([])
  const [form, setForm] = useState<InfluencerCreateFormState>(cloneDefaultForm)
  const [composerKey, setComposerKey] = useState('initial')
  const [promptSeed, setPromptSeed] = useState('')
  const [featureDraft, setFeatureDraft] = useState('')
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [selectedModelId, setSelectedModelId] = useState(() => {
    const preferred = models.find(m => m.value === INFLUENCER_DEFAULT_MODEL)
    return preferred?._id ?? models[0]?._id ?? ''
  })

  const selectedModel = useMemo(
    () => models.find(m => m._id === selectedModelId) ?? models[0],
    [models, selectedModelId],
  )

  const showFacialHair = form.gender === 'male'
  const showMakeup = form.gender === 'female' || form.gender === 'non-binary'

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
      form.appearance.distinguishingFeatures.includes(tag) ||
      form.appearance.distinguishingFeatures.length >= FEATURE_MAX
    ) {
      setFeatureDraft('')
      return
    }
    updateAppearance('distinguishingFeatures', [...form.appearance.distinguishingFeatures, tag])
    setFeatureDraft('')
  }

  function removeFeature(tag: string) {
    updateAppearance(
      'distinguishingFeatures',
      form.appearance.distinguishingFeatures.filter(f => f !== tag),
    )
  }

  function applyPreset(preset: InfluencerPreset) {
    commitHaptic({})
    const next = clonePresetForm(preset)
    setForm(next)
    setPromptSeed(next.directions.trim())
    setComposerKey(preset.id)
    setSelectedPresetId(preset.id)
    toast.success(`Loaded ${preset.title}`)
  }

  function handleSurprise() {
    commitHaptic({})
    const next = randomizeInfluencerForm()
    setForm(next)
    setPromptSeed(next.directions.trim())
    setComposerKey(`surprise-${Date.now()}`)
    setSelectedPresetId('surprise')
    toast.success('Randomized — tweak anything you like')
  }

  function handleSubmit(message: PromptInputMessage) {
    const promptText = message.text.trim()
    const hasReferences = referenceImages.length > 0
    const hasNiche = form.niche.length > 0

    if (!promptText && !hasReferences && !hasNiche) {
      toast.error('Pick a niche, add creative direction, or attach style references')
      return
    }
    if (!selectedModel) {
      toast.error('Select a generation model')
      return
    }

    const trimmedName =
      form.name.trim() || (promptText ? suggestNameFromPrompt(promptText) : 'My Influencer')
    const niche = hasNiche ? form.niche : hasReferences ? ['lifestyle'] : []

    startTransition(async () => {
      commitHaptic({})
      const response = await createInfluencer({
        workspaceId,
        model: selectedModel.value,
        name: trimmedName,
        bio: form.bio.trim() || undefined,
        directions: promptText || form.directions.trim() || undefined,
        gender: form.gender,
        ageRange: form.ageRange,
        niche,
        scenes: form.scenes.length > 0 ? form.scenes : undefined,
        ethnicity: form.ethnicity.trim()
          ? (ETHNICITY_OPTIONS.find(o => o.id === form.ethnicity.trim())?.label ??
            form.ethnicity.trim())
          : undefined,
        appearance: {
          hairColor: labelForSwatch(HAIR_COLOR_OPTIONS, form.appearance.hairColor),
          hairStyle: form.appearance.hairStyle,
          eyeColor: labelForSwatch(EYE_COLOR_OPTIONS, form.appearance.eyeColor),
          skinTone: labelForSwatch(SKIN_TONE_OPTIONS, form.appearance.skinTone),
          bodyShape: form.appearance.bodyShape,
          height: form.appearance.height,
          distinguishingFeatures: form.appearance.distinguishingFeatures,
          facialHair: showFacialHair ? form.appearance.facialHair : undefined,
          makeup: showMakeup ? form.appearance.makeup : undefined,
          accessories:
            form.appearance.accessories.length > 0 ? form.appearance.accessories : undefined,
        },
        aestheticTags: form.aestheticTags,
        photoStyle: form.photoStyle,
        ...(hasReferences
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

  return (
    <div className="image-studio relative flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-140 overflow-hidden">
        <div className="absolute left-1/2 -top-32 h-112 w-200 -translate-x-1/2 rounded-full bg-foreground/[0.022] blur-[100px]" />
      </div>
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        <header className="mb-8">
          <Link
            href={DASHBOARD_ROUTES.STUDIO.INFLUENCERS}
            className="group mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon
              className="size-3.5 transition-transform duration-150 group-hover:-translate-x-0.5 group-active:scale-95"
              strokeWidth={1.75}
            />
            Influencers
          </Link>

          <h1 className="font-serif text-balance text-[1.875rem] font-medium leading-[1.1] tracking-[-0.022em] text-foreground sm:text-[2.25rem] sm:leading-[1.08]">
            Create your influencer
          </h1>
          <p className="mt-2.5 max-w-md text-pretty text-[15px] leading-relaxed text-muted-foreground">
            Start from a persona, then refine the look. Generate three consistent portraits.
          </p>
        </header>

        <div className="mb-8">
          <InfluencerPresetStrip
            selectedId={selectedPresetId}
            onSelect={applyPreset}
            onSurprise={handleSurprise}
            disabled={pending}
          />
        </div>

        <InfluencerCreateForm
          key={selectedPresetId ?? 'blank'}
          form={form}
          featureDraft={featureDraft}
          onFeatureDraftChange={setFeatureDraft}
          onFormChange={setForm}
          onUpdateAppearance={updateAppearance}
          onAddFeature={addFeature}
          onRemoveFeature={removeFeature}
          referenceImages={referenceImages}
          onReferenceImagesChange={setReferenceImages}
          workspaceId={workspaceId}
          models={models}
          selectedModelId={selectedModelId}
          onSelectedModelChange={setSelectedModelId}
          onSubmit={handleSubmit}
          composerKey={composerKey}
          initialInput={promptSeed}
          disabled={pending}
        />
      </div>
    </div>
  )
}
