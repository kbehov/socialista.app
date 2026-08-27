'use client'

import {
  generateSlideshowFromPrompt,
  startSlideshowGeneration,
} from '@/actions/slideshow-generation.actions'
import {
  PromptInputButton,
  PromptInputProvider,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { AspectRatioIcon } from '@/components/icons/aspect-ration.icon'
import { StudioSkillPicker } from '@/components/skills/studio-skill-picker'
import { STUDIO_COMPOSER_SURFACE_CLASS } from '@/components/studio/prompt/studio-composer-surface'
import { StudioInputActionTooltip } from '@/components/studio/prompt/studio-input-action-tooltip'
import { StudioPromptComposer } from '@/components/studio/prompt/studio-prompt-composer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { ASPECT_RATIO_PRESETS, DEFAULT_ASPECT_RATIO_ID } from '@/lib/carousel/aspect-ratios'
import { storeGenerationAccessToken } from '@/lib/image-generation/session'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/workspace.store'
import { commitHaptic } from '@/utils/haptics'
import {
  PROMPT_KEYS,
  SLIDESHOW_GENERATION_SLIDE_COUNT_DEFAULT,
  SLIDESHOW_GENERATION_SLIDE_COUNT_MAX,
  SLIDESHOW_GENERATION_SLIDE_COUNT_MIN,
  SLIDESHOW_PLAN_CREDIT_COST,
  type Model,
} from '@socialista/types'
import { ChevronDownIcon, ImagesIcon, SparklesIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

const COMPOSER_PRESET_IDS = ['instagram-portrait', 'instagram-square', 'instagram-story', 'tiktok'] as const

const COMPOSER_PRESETS = ASPECT_RATIO_PRESETS.filter(preset =>
  COMPOSER_PRESET_IDS.includes(preset.id as (typeof COMPOSER_PRESET_IDS)[number]),
)

type ImageSource = 'stock' | 'ai'

function SlideshowPromptComposerInner({ models }: { models: Model[] }) {
  const router = useRouter()
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const [isPending, startTransition] = useTransition()
  const [imageSource, setImageSource] = useState<ImageSource>('stock')
  const [slideCount, setSlideCount] = useState(SLIDESHOW_GENERATION_SLIDE_COUNT_DEFAULT)
  const [aspectRatioId, setAspectRatioId] = useState(DEFAULT_ASPECT_RATIO_ID)
  const [selectedModelId, setSelectedModelId] = useState(models[0]?._id ?? '')
  const [skillId, setSkillId] = useState<string | undefined>()

  const selectedPreset =
    COMPOSER_PRESETS.find(preset => preset.id === aspectRatioId) ??
    COMPOSER_PRESETS[0] ??
    ASPECT_RATIO_PRESETS[0]!
  const selectedModel = models.find(model => model._id === selectedModelId) ?? models[0]
  const useAiImages = imageSource === 'ai'
  const estimatedCost = useAiImages
    ? SLIDESHOW_PLAN_CREDIT_COST + (selectedModel?.cost ?? 0) * slideCount
    : SLIDESHOW_PLAN_CREDIT_COST

  const submitLabel = useMemo(() => {
    if (isPending) return 'Generating…'
    return useAiImages ? `Generate ${slideCount} slides` : `Create ${slideCount} slides`
  }, [isPending, slideCount, useAiImages])

  const handleSubmit = (message: PromptInputMessage) => {
    const prompt = message.text.trim()
    if (!prompt) return

    if (!currentWorkspace?._id) {
      toast.error('Select a workspace to continue.')
      return
    }

    if (useAiImages && !selectedModel) {
      toast.error('Select a model to generate AI images.')
      return
    }

    startTransition(async () => {
      if (useAiImages && selectedModel) {
        const result = await startSlideshowGeneration({
          prompt,
          slideCount,
          aspectRatioId,
          skillId,
          model: selectedModel.value,
          workspaceId: currentWorkspace._id,
        })
        if (!result.success) {
          toast.error(result.error)
          return
        }
        commitHaptic({ vibrateDuration: 10 })
        storeGenerationAccessToken(result.runId, result.publicAccessToken)
        router.push(DASHBOARD_ROUTES.STUDIO.slideshowRun(result.runId))
        return
      }

      const result = await generateSlideshowFromPrompt({
        prompt,
        slideCount,
        aspectRatioId,
        skillId,
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      commitHaptic({ vibrateDuration: 10 })
      router.push(DASHBOARD_ROUTES.STUDIO.slideshow(result.slideshowId))
    })
  }

  const aspectTools = (
    <DropdownMenu>
      <StudioInputActionTooltip label="Slide format">
        <DropdownMenuTrigger asChild>
          <PromptInputButton
            aria-label={`Format ${selectedPreset.label}`}
            className={cn(
              'h-7 gap-1.5 rounded-lg border px-1.5 pr-1.5',
              'border-black/10 bg-black/[0.02] transition-[border-color,background-color] duration-150',
              'hover:border-black/18 hover:bg-black/[0.04]',
              'dark:border-white/12 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.06]',
              'active:scale-[0.97]',
            )}
            disabled={isPending}
            type="button"
          >
            <AspectRatioIcon
              active
              ratio={selectedPreset.dimensions.width / selectedPreset.dimensions.height}
            />
            <span className="text-xs font-medium leading-none tracking-[-0.015em]">
              {selectedPreset.label}
            </span>
            <ChevronDownIcon className="size-3 shrink-0 text-muted-foreground/60" />
          </PromptInputButton>
        </DropdownMenuTrigger>
      </StudioInputActionTooltip>
      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuRadioGroup value={aspectRatioId} onValueChange={setAspectRatioId}>
          {COMPOSER_PRESETS.map(preset => (
            <DropdownMenuRadioItem key={preset.id} className="gap-2.5 rounded-lg" value={preset.id}>
              <AspectRatioIcon
                active={aspectRatioId === preset.id}
                ratio={preset.dimensions.width / preset.dimensions.height}
              />
              <span className="text-[13px] font-medium tracking-[-0.015em]">
                {preset.platform} {preset.label}
              </span>
              <DropdownMenuShortcut>
                {preset.dimensions.width}:{preset.dimensions.height}
              </DropdownMenuShortcut>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div>
      <StudioPromptComposer
        models={models}
        selectedModelId={selectedModelId}
        onSelectedModelChange={setSelectedModelId}
        attachments={[]}
        onAttachmentsChange={() => undefined}
        attachSources={[]}
        hideModelSelector={!useAiImages}
        allowEmptyModels
        workspaceId={currentWorkspace?._id}
        count={{
          value: slideCount,
          min: SLIDESHOW_GENERATION_SLIDE_COUNT_MIN,
          max: SLIDESHOW_GENERATION_SLIDE_COUNT_MAX,
          onChange: setSlideCount,
          label: 'Number of slides',
        }}
        placeholder="Describe the slideshow you want — topic, tone, and who it’s for…"
        pending={isPending}
        onSubmit={handleSubmit}
        submitLabel={submitLabel}
        emptyTitle="Describe a slideshow"
        emptyDescription="Stock photos work without a model. Add a text-to-image model to generate AI images instead."
        surfaceClassName={STUDIO_COMPOSER_SURFACE_CLASS}
        tools={
          <>
            {aspectTools}
            <PromptInputButton
              aria-label={useAiImages ? 'AI images on' : 'Stock photos on'}
              aria-pressed={useAiImages}
              className={cn(
                'h-7 gap-1.5 rounded-lg border px-1.5 pr-1.5',
                'transition-[border-color,background-color] duration-150',
                'active:scale-[0.97]',
                useAiImages
                  ? 'border-black/18 bg-black/[0.04] dark:border-white/20 dark:bg-white/[0.06]'
                  : 'border-black/10 bg-black/[0.02] hover:border-black/18 hover:bg-black/[0.04] dark:border-white/12 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.06]',
              )}
              disabled={isPending}
              onClick={() => {
                if (!useAiImages && models.length === 0) {
                  toast.error('Add a text-to-image model to generate AI images.')
                  return
                }
                setImageSource(value => (value === 'ai' ? 'stock' : 'ai'))
              }}
              tooltip={
                useAiImages
                  ? 'AI images — generates a unique photo for each slide'
                  : 'Stock photos — picks Unsplash images from the plan'
              }
              type="button"
            >
              {useAiImages ? (
                <SparklesIcon className="size-3.5 shrink-0 text-foreground/80" />
              ) : (
                <ImagesIcon className="size-3.5 shrink-0 text-muted-foreground/70" />
              )}
              <span className="text-xs font-medium leading-none tracking-[-0.015em]">
                {useAiImages ? 'AI images' : 'Stock'}
              </span>
            </PromptInputButton>
            <StudioSkillPicker
              target={PROMPT_KEYS.slideshow}
              value={skillId}
              onChange={setSkillId}
              disabled={isPending}
            />
          </>
        }
      />
      <p className="mt-2 px-0.5 text-[11px] tracking-tight text-muted-foreground/80">
        ≈ ${estimatedCost.toFixed(2)} per generation
      </p>
    </div>
  )
}

export function SlideshowPromptComposer({ models }: { models: Model[] }) {
  return (
    <PromptInputProvider>
      <SlideshowPromptComposerInner models={models} />
    </PromptInputProvider>
  )
}
