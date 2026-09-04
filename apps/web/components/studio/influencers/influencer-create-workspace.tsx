'use client'

import type { AttachedMedia } from '@/components/files/attach-images-dialog'
import { dashboardSurface } from '@/components/dashboard'
import { StudioComposerModelSelector } from '@/components/studio/prompt/studio-composer-model-selector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import {
  ETHNICITY_OPTIONS,
  EYE_COLOR_OPTIONS,
  HAIR_COLOR_OPTIONS,
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
import { getProjectId, useProjectStore } from '@/store/project.store'
import { cn } from '@/lib/utils'
import { commitHaptic } from '@/utils/haptics'
import { formatModelCost } from '@/utils/format'
import type { Model } from '@socialista/types'
import {
  INFLUENCER_DEFAULT_MODEL,
  INFLUENCER_GENERATION_SHOT_COUNT,
  INFLUENCER_GENERATION_SHOT_MAX,
  INFLUENCER_GENERATION_SHOT_MIN,
  INFLUENCER_MAX_USER_REFERENCE_IMAGES,
} from '@socialista/types'
import { ArrowLeftIcon, Loader2Icon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition, type FormEvent, type KeyboardEvent } from 'react'
import { toast } from 'sonner'
import { InfluencerAvatarSilhouette } from './influencer-avatar-silhouette'
import { InfluencerCreateForm } from './influencer-create-form'
import { OptionSegmented } from './influencer-option-controls'
import { InfluencerPresetStrip } from './influencer-preset-strip'
import { InfluencerReferenceUploader } from './influencer-reference-uploader'

type InfluencerCreateWorkspaceProps = {
  workspaceId: string
  models: Model[]
  returnTo?: string
}

const FEATURE_MAX = 3
const NAME_MAX = 80
const CREATE_SHELL = 'mx-auto w-full max-w-3xl px-4 sm:px-6'

function getSubmitShortcutLabel() {
  if (typeof navigator === 'undefined') return '⌘↵'
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? navigator.userAgent) ? '⌘↵' : 'Ctrl↵'
}

const SHOT_OPTIONS = Array.from(
  { length: INFLUENCER_GENERATION_SHOT_MAX - INFLUENCER_GENERATION_SHOT_MIN + 1 },
  (_, index) => {
    const value = String(INFLUENCER_GENERATION_SHOT_MIN + index)
    return { id: value, label: value }
  },
)

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

export function InfluencerCreateWorkspace({ workspaceId, models, returnTo }: InfluencerCreateWorkspaceProps) {
  const router = useRouter()
  const projectId = useProjectStore(s => getProjectId(s.currentProject))
  const [pending, startTransition] = useTransition()
  const [referenceImages, setReferenceImages] = useState<AttachedMedia[]>([])
  const [form, setForm] = useState<InfluencerCreateFormState>(cloneDefaultForm)
  const [featureDraft, setFeatureDraft] = useState('')
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [shotCount, setShotCount] = useState(INFLUENCER_GENERATION_SHOT_COUNT)
  const [submitShortcut] = useState(getSubmitShortcutLabel)
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
  const canSubmit = Boolean(selectedModel) && !pending
  const costLabel = selectedModel
    ? formatModelCost(selectedModel.cost * shotCount, selectedModel.costUnit)
    : null

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
    setForm(prev => {
      if (
        prev.appearance.distinguishingFeatures.includes(tag) ||
        prev.appearance.distinguishingFeatures.length >= FEATURE_MAX
      ) {
        return prev
      }
      return {
        ...prev,
        appearance: {
          ...prev.appearance,
          distinguishingFeatures: [...prev.appearance.distinguishingFeatures, tag],
        },
      }
    })
    setFeatureDraft('')
  }

  function removeFeature(tag: string) {
    setForm(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        distinguishingFeatures: prev.appearance.distinguishingFeatures.filter(f => f !== tag),
      },
    }))
  }

  function applyPreset(preset: InfluencerPreset) {
    commitHaptic({})
    setForm(clonePresetForm(preset))
    setSelectedPresetId(preset.id)
  }

  function handleSurprise() {
    commitHaptic({})
    setForm(randomizeInfluencerForm())
    setSelectedPresetId('surprise')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedModel) {
      toast.error('Select a generation model')
      return
    }

    const promptText = form.directions.trim()
    const hasReferences = referenceImages.length > 0
    const trimmedName = form.name.trim() || (promptText ? suggestNameFromPrompt(promptText) : 'My Influencer')
    const niche = form.niche.length > 0 ? form.niche : ['lifestyle']

    startTransition(async () => {
      commitHaptic({})
      const response = await createInfluencer({
        workspaceId,
        projectId,
        model: selectedModel.value,
        name: trimmedName,
        bio: form.bio.trim() || undefined,
        directions: promptText || undefined,
        gender: form.gender,
        ageRange: form.ageRange,
        niche,
        scenes: form.scenes.length > 0 ? form.scenes : undefined,
        ethnicity: form.ethnicity.trim()
          ? (ETHNICITY_OPTIONS.find(o => o.id === form.ethnicity.trim())?.label ?? form.ethnicity.trim())
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
          accessories: form.appearance.accessories.length > 0 ? form.appearance.accessories : undefined,
        },
        aestheticTags: form.aestheticTags,
        vibeTags: form.vibeTags.length > 0 ? form.vibeTags : undefined,
        photoStyle: form.photoStyle,
        shotCount,
        ...(hasReferences
          ? {
              userReferenceImageUrls: referenceImages.map(image => image.url),
            }
          : {}),
      })

      if (!response.success || !response.data?.influencer) {
        toast.error(response.message ?? 'Failed to create influencer')
        return
      }

      toast.success('Generating your influencer…')
      if (returnTo) {
        const params = new URLSearchParams()
        params.set('influencer', response.data.influencer._id)
        router.push(`${returnTo}?${params.toString()}`)
        return
      }
      router.push(DASHBOARD_ROUTES.STUDIO.influencer(response.data.influencer._id))
    })
  }

  function handleFormKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.requestSubmit()
    }
  }

  return (
    <div className="image-studio studio-shell relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <form
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
        onSubmit={handleSubmit}
        onKeyDown={handleFormKeyDown}
      >
        <header className="relative z-20 shrink-0 border-b border-border/45 bg-background/80 backdrop-blur-xl backdrop-saturate-150 supports-backdrop-filter:bg-background/65 dark:border-border/55">
          <div className={cn(CREATE_SHELL, 'flex items-center gap-2 py-2')}>
            <h1 className="sr-only">New influencer</h1>
            <Button
              asChild
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 shrink-0 rounded-md text-muted-foreground hover:text-foreground"
            >
              <Link href={returnTo ?? DASHBOARD_ROUTES.STUDIO.INFLUENCERS} aria-label="Back">
                <ArrowLeftIcon className="size-4" strokeWidth={1.75} />
              </Link>
            </Button>
            <Input
              id="influencer-name"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              onKeyDown={e => {
                if (e.key === 'Enter') e.preventDefault()
              }}
              placeholder="Untitled"
              autoComplete="off"
              maxLength={NAME_MAX}
              aria-label="Influencer name"
              disabled={pending}
              className="h-8 min-w-0 flex-1 border-0 bg-transparent px-0 text-[15px] font-semibold tracking-[-0.02em] shadow-none placeholder:text-muted-foreground/40 focus-visible:border-transparent focus-visible:ring-0 disabled:opacity-50 dark:bg-transparent"
            />
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain sidebar-scrollbar">
          <div className={cn(CREATE_SHELL, 'flex flex-col gap-6 py-6 sm:py-8')}>
            <div className="flex justify-center" aria-hidden>
              <InfluencerAvatarSilhouette
                skinTone={form.appearance.skinTone}
                hairColor={form.appearance.hairColor}
                eyeColor={form.appearance.eyeColor}
                hairStyle={form.appearance.hairStyle}
                facialHair={showFacialHair ? form.appearance.facialHair : undefined}
                size="preview"
              />
            </div>

            <InfluencerPresetStrip
              selectedId={selectedPresetId}
              onSelect={applyPreset}
              onSurprise={handleSurprise}
              disabled={pending}
            />

            <InfluencerCreateForm
              form={form}
              featureDraft={featureDraft}
              onFeatureDraftChange={setFeatureDraft}
              onFormChange={setForm}
              onUpdateAppearance={updateAppearance}
              onAddFeature={addFeature}
              onRemoveFeature={removeFeature}
              referenceCount={referenceImages.length}
              referenceMax={INFLUENCER_MAX_USER_REFERENCE_IMAGES}
              references={
                <InfluencerReferenceUploader
                  workspaceId={workspaceId}
                  images={referenceImages}
                  onImagesChange={setReferenceImages}
                  maxImages={INFLUENCER_MAX_USER_REFERENCE_IMAGES}
                  disabled={pending}
                />
              }
              disabled={pending}
            />
          </div>
        </div>

        <div className="relative z-20 shrink-0 border-t border-border/45 bg-background/80 backdrop-blur-xl backdrop-saturate-150 supports-backdrop-filter:bg-background/65 dark:border-border/55">
          <div
            className={cn(
              CREATE_SHELL,
              'flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]',
            )}
          >
            {models.length > 0 && selectedModel ? (
              <StudioComposerModelSelector
                models={models}
                selectedModelId={selectedModel._id}
                onSelectedModelChange={setSelectedModelId}
                disabled={pending}
                heading="Image models"
                tooltip="Choose generation model"
              />
            ) : (
              <p className="min-w-0 truncate text-[12px] text-muted-foreground">No image models available</p>
            )}

            <span className="hidden h-3 w-px bg-border/70 sm:block" aria-hidden />

            <OptionSegmented
              aria-label="Number of portraits"
              value={String(shotCount)}
              options={SHOT_OPTIONS}
              onChange={v => setShotCount(Number(v))}
              className="w-[6.75rem] shrink-0"
            />

            <div className="ml-auto flex items-center gap-2.5">
              {costLabel ? (
                <span className="text-[12px] tabular-nums text-muted-foreground/75">{costLabel}</span>
              ) : null}
              <Button
                type="submit"
                size="sm"
                disabled={!canSubmit}
                aria-keyshortcuts="Meta+Enter Control+Enter"
                className={cn(dashboardSurface.createCta, 'gap-1.5')}
              >
                {pending ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2Icon className="size-3.5 animate-spin" />
                    Generating
                  </span>
                ) : (
                  <>
                    Generate
                    <Kbd className="ml-0.5 hidden h-[18px] min-w-0 border border-primary-foreground/20 bg-primary-foreground/12 px-1.5 text-[10px] leading-none font-medium tracking-[-0.01em] text-primary-foreground/80 sm:inline-flex">
                      {submitShortcut}
                    </Kbd>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
