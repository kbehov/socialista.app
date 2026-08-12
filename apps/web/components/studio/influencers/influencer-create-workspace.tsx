'use client'

import { Button } from '@/components/ui/button'
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
  INFLUENCER_PRESETS,
  randomizeInfluencerForm,
  type InfluencerCreateFormState,
  type InfluencerPreset,
} from '@/lib/studio/influencers/presets'
import { cn } from '@/lib/utils'
import { createInfluencer } from '@/services/influencer.service'
import type { Model } from '@socialista/types'
import { INFLUENCER_DEFAULT_MODEL } from '@socialista/types'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { ArrowLeftIcon, DicesIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { InfluencerCreateForm } from './influencer-create-form'
import { InfluencerPromptComposer } from './influencer-prompt-composer'

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
  const formReady = form.niche.length > 0

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
    const next = clonePresetForm(preset)
    setForm(next)
    setPromptSeed(next.directions.trim())
    setComposerKey(preset.id)
    toast.success(`Loaded ${preset.title} preset`)
  }

  function handleSurprise() {
    const next = randomizeInfluencerForm()
    setForm(next)
    setPromptSeed(next.directions.trim())
    setComposerKey(`surprise-${Date.now()}`)
    toast.success('Randomized settings — tweak as needed')
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

      <div className="relative mx-auto w-full max-w-5xl px-4 pb-16 pt-4 sm:px-6 sm:pt-8 lg:px-8">
        <header className="mb-8">
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

          <div className="space-y-2">
            <h1 className="text-balance text-[1.875rem] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-[2.125rem]">
              Create your influencer
            </h1>
            <p className="text-pretty text-[15px] leading-[1.55] tracking-[-0.01em] text-muted-foreground">
              Pick a preset or shape the identity below. Add creative direction and style references
              for the mood you want.
            </p>
          </div>
        </header>

        <div className="mb-6">
          <p className="mb-2.5 text-[11px] font-medium tracking-[0.08em] text-muted-foreground/80 uppercase">
            Quick start
          </p>
          <div
            className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Preset personas"
          >
            {INFLUENCER_PRESETS.slice(0, 8).map(preset => (
              <button
                key={preset.id}
                type="button"
                disabled={pending}
                onClick={() => applyPreset(preset)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium tracking-[-0.015em]',
                  'ring-1 transition-colors active:scale-[0.97]',
                  'bg-muted/20 text-muted-foreground ring-border/30',
                  'hover:bg-muted/35 hover:text-foreground hover:ring-border/45',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
                )}
              >
                {preset.title}
              </button>
            ))}
            <button
              type="button"
              disabled={pending}
              onClick={handleSurprise}
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium',
                'ring-1 ring-border/30 text-muted-foreground transition-colors',
                'hover:bg-muted/35 hover:text-foreground',
              )}
            >
              <DicesIcon className="size-3" strokeWidth={1.75} />
              Surprise
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
          <InfluencerCreateForm
            form={form}
            featureDraft={featureDraft}
            onFeatureDraftChange={setFeatureDraft}
            onFormChange={setForm}
            onUpdateAppearance={updateAppearance}
            onAddFeature={addFeature}
            onRemoveFeature={removeFeature}
            models={models}
            selectedModelId={selectedModelId}
            onSelectedModelChange={setSelectedModelId}
            hasStyleReferences={referenceImages.length > 0}
            disabled={pending}
          />

          <div className="lg:sticky lg:top-6">
            <InfluencerPromptComposer
              key={composerKey}
              composerKey={composerKey}
              initialInput={promptSeed}
              models={models}
              selectedModelId={selectedModelId}
              onSelectedModelChange={setSelectedModelId}
              referenceImages={referenceImages}
              onReferenceImagesChange={setReferenceImages}
              workspaceId={workspaceId}
              onSubmit={handleSubmit}
              disabled={pending}
              formReady={formReady}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
