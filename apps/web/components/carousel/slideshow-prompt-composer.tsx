'use client'

import {
  generateSlideshowFromPrompt,
  startSlideshowGeneration,
} from '@/actions/slideshow-generation.actions'
import {
  PromptInputButton,
  PromptInputProvider,
  usePromptInputController,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { AspectRatioIcon } from '@/components/icons/aspect-ration.icon'
import { StudioSkillPicker } from '@/components/skills/studio-skill-picker'
import { SlideshowPromptAnatomy } from '@/components/studio/slideshows/slideshow-prompt-anatomy'
import { useSlideshowStudio } from '@/components/studio/slideshows/slideshow-studio-provider'
import { SlideshowStudioStarters } from '@/components/studio/slideshows/slideshow-studio-starters'
import { StudioInputActionTooltip } from '@/components/studio/prompt/studio-input-action-tooltip'
import {
  STUDIO_HOME_COMPOSER_SURFACE_CLASS,
  STUDIO_TOOL_BUTTON_ACTIVE_CLASS,
  STUDIO_TOOL_BUTTON_CLASS,
  STUDIO_TOOL_CHEVRON_CLASS,
} from '@/components/studio/prompt/studio-composer-surface'
import { StudioComposerModelSelector } from '@/components/studio/prompt/studio-composer-model-selector'
import { StudioPromptComposer } from '@/components/studio/prompt/studio-prompt-composer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Kbd } from '@/components/ui/kbd'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { ASPECT_RATIO_PRESETS, DEFAULT_ASPECT_RATIO_ID } from '@/lib/carousel/aspect-ratios'
import { storeGenerationAccessToken } from '@/lib/image-generation/session'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/workspace.store'
import { formatCredits } from '@/utils/format'
import { commitHaptic } from '@/utils/haptics'
import {
  PROMPT_KEYS,
  SLIDESHOW_GENERATION_SLIDE_COUNT_MAX,
  SLIDESHOW_GENERATION_SLIDE_COUNT_MIN,
  SLIDESHOW_PLAN_CREDIT_COST,
  type Model,
} from '@socialista/types'
import { ChevronDownIcon, ImagesIcon, SparklesIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'

const COMPOSER_PRESET_IDS = ['instagram-portrait', 'instagram-square', 'instagram-story', 'tiktok'] as const

const COMPOSER_PRESETS = ASPECT_RATIO_PRESETS.filter(preset =>
  COMPOSER_PRESET_IDS.includes(preset.id as (typeof COMPOSER_PRESET_IDS)[number]),
)

const DEFAULT_PLACEHOLDER = 'A 7-slide story about the serum nobody talks about…'

type ImageSource = 'stock' | 'ai'

function getSubmitShortcutLabel() {
  if (typeof navigator === 'undefined') return '⌘↵'
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? navigator.userAgent) ? '⌘↵' : 'Ctrl↵'
}

function SlideshowPromptComposerInner({
  models,
  textModels,
}: {
  models: Model[]
  textModels: Model[]
}) {
  const router = useRouter()
  const [submitShortcut] = useState(getSubmitShortcutLabel)
  const { composerRef, registerPromptHandlers } = useSlideshowStudio()
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const { textInput } = usePromptInputController()
  const [isPending, startTransition] = useTransition()
  const [imageSource, setImageSource] = useState<ImageSource>('stock')
  const [slideCount, setSlideCount] = useState<number | 'auto'>('auto')
  const [aspectRatioId, setAspectRatioId] = useState(DEFAULT_ASPECT_RATIO_ID)
  const [selectedModelId, setSelectedModelId] = useState(models[0]?._id ?? '')
  const [selectedTextModelId, setSelectedTextModelId] = useState(textModels[0]?._id ?? '')
  const [skillId, setSkillId] = useState<string | undefined>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedPreset =
    COMPOSER_PRESETS.find(preset => preset.id === aspectRatioId) ??
    COMPOSER_PRESETS[0] ??
    ASPECT_RATIO_PRESETS[0]!
  const selectedModel = models.find(model => model._id === selectedModelId) ?? models[0]
  const selectedTextModel = textModels.find(model => model._id === selectedTextModelId) ?? textModels[0]
  const useAiImages = imageSource === 'ai'
  const isAutoSlideCount = slideCount === 'auto'
  const planCost = selectedTextModel?.cost ?? SLIDESHOW_PLAN_CREDIT_COST
  const estimatedImageCount = isAutoSlideCount
    ? SLIDESHOW_GENERATION_SLIDE_COUNT_MIN
    : slideCount
  const estimatedCost = useAiImages
    ? planCost + (selectedModel?.cost ?? 0) * estimatedImageCount
    : planCost

  const insertAtCursor = useCallback(
    (snippet: string) => {
      const el = textareaRef.current
      const current = textInput.value

      if (!el) {
        textInput.setInput(current ? `${current}${snippet}` : snippet)
        return
      }

      const start = el.selectionStart ?? current.length
      const end = el.selectionEnd ?? current.length
      const next = `${current.slice(0, start)}${snippet}${current.slice(end)}`
      textInput.setInput(next)

      requestAnimationFrame(() => {
        const position = start + snippet.length
        el.focus()
        el.setSelectionRange(position, position)
      })
    },
    [textInput],
  )

  const setPrompt = useCallback(
    (text: string) => {
      textInput.setInput(text)
      requestAnimationFrame(() => {
        const el = textareaRef.current
        if (!el) return
        el.focus()
        el.setSelectionRange(text.length, text.length)
      })
    },
    [textInput],
  )

  const focusPrompt = useCallback(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    registerPromptHandlers({
      insertAtCursor,
      setPrompt,
      focusPrompt,
    })
  }, [registerPromptHandlers, insertAtCursor, setPrompt, focusPrompt])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(pointer: fine)').matches) return
    textareaRef.current?.focus()
  }, [])

  const submitLabel = useMemo(() => {
    if (isPending) return 'Generating…'
    if (isAutoSlideCount) return useAiImages ? 'Generate' : 'Create'
    return useAiImages ? `Generate ${slideCount}` : `Create ${slideCount}`
  }, [isPending, isAutoSlideCount, slideCount, useAiImages])

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
          aspectRatioId,
          skillId,
          model: selectedModel.value,
          workspaceId: currentWorkspace._id,
          ...(isAutoSlideCount ? {} : { slideCount }),
          ...(selectedTextModel ? { textModel: selectedTextModel.value } : {}),
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
        aspectRatioId,
        skillId,
        ...(isAutoSlideCount ? {} : { slideCount }),
        ...(selectedTextModel ? { textModel: selectedTextModel.value } : {}),
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
            className={STUDIO_TOOL_BUTTON_CLASS}
            disabled={isPending}
            size="xs"
            type="button"
          >
            <AspectRatioIcon
              active
              ratio={selectedPreset.dimensions.width / selectedPreset.dimensions.height}
            />
            <span className="min-w-0 truncate text-[12px] font-medium leading-none tracking-[-0.015em]">
              {selectedPreset.label}
            </span>
            <ChevronDownIcon className={STUDIO_TOOL_CHEVRON_CLASS} />
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
    <div className="slideshow-studio-prompt">
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
          value: isAutoSlideCount ? SLIDESHOW_GENERATION_SLIDE_COUNT_MIN : slideCount,
          min: SLIDESHOW_GENERATION_SLIDE_COUNT_MIN,
          max: SLIDESHOW_GENERATION_SLIDE_COUNT_MAX,
          auto: isAutoSlideCount,
          onChange: setSlideCount,
          onAutoChange: () => setSlideCount('auto'),
          label: 'Number of slides',
        }}
        placeholder={DEFAULT_PLACEHOLDER}
        pending={isPending}
        onSubmit={handleSubmit}
        submitLabel={submitLabel}
        submitTitle={submitLabel}
        submitAppearance="send"
        footerClassName="border-transparent bg-transparent px-2.5 pb-2 pt-1 sm:px-3"
        emptyTitle="Describe a slideshow"
        emptyDescription="Stock photos work without an image model. Pick a text model to write the slides, then add a text-to-image model for AI images."
        surfaceClassName={STUDIO_HOME_COMPOSER_SURFACE_CLASS}
        composerRef={composerRef}
        textareaRef={node => {
          textareaRef.current = node
        }}
        tools={
          <>
            {aspectTools}
            <PromptInputButton
              aria-label={useAiImages ? 'AI images on' : 'Stock photos on'}
              aria-pressed={useAiImages}
              className={cn(STUDIO_TOOL_BUTTON_CLASS, useAiImages && STUDIO_TOOL_BUTTON_ACTIVE_CLASS)}
              disabled={isPending}
              onClick={() => {
                if (!useAiImages && models.length === 0) {
                  toast.error('Add a text-to-image model to generate AI images.')
                  return
                }
                setImageSource(value => (value === 'ai' ? 'stock' : 'ai'))
              }}
              size="xs"
              tooltip={
                useAiImages
                  ? 'AI images — generates a unique photo for each slide'
                  : 'Stock photos — picks Unsplash images from the plan'
              }
              type="button"
            >
              {useAiImages ? (
                <SparklesIcon className="size-3.5 shrink-0" />
              ) : (
                <ImagesIcon className="size-3.5 shrink-0" />
              )}
              <span className="text-[12px] font-medium leading-none tracking-[-0.015em]">
                {useAiImages ? 'AI images' : 'Stock'}
              </span>
            </PromptInputButton>
            <StudioSkillPicker
              target={PROMPT_KEYS.slideshow}
              value={skillId}
              onChange={setSkillId}
              disabled={isPending}
            />
            {textModels.length > 0 ? (
              <StudioComposerModelSelector
                models={textModels}
                selectedModelId={selectedTextModel?._id ?? selectedTextModelId}
                onSelectedModelChange={setSelectedTextModelId}
                disabled={isPending}
              />
            ) : null}
          </>
        }
      />

      <div className="mt-4 flex flex-col items-center gap-4">
        <SlideshowStudioStarters disabled={isPending} />

        <p className="hidden pointer-fine:flex flex-wrap items-center justify-center gap-1.5 text-[11px] tracking-[-0.01em] text-black/32 dark:text-white/32">
          <Kbd className="h-4 min-w-4 border-black/8 bg-transparent px-1 text-[10px] text-black/40 dark:border-white/10 dark:text-white/40">
            /
          </Kbd>
          <span>to focus</span>
          <span aria-hidden className="text-black/16 dark:text-white/16">
            ·
          </span>
          <Kbd className="h-4 min-w-4 border-black/8 bg-transparent px-1 text-[10px] text-black/40 dark:border-white/10 dark:text-white/40">
            {submitShortcut}
          </Kbd>
          <span>to generate</span>
        </p>

        <p className="text-[11px] tabular-nums tracking-[-0.01em] text-black/32 dark:text-white/32">
          {useAiImages && isAutoSlideCount ? 'from' : '≈'} {formatCredits(estimatedCost)} credits
        </p>

        <div className="w-full">
          <SlideshowPromptAnatomy />
        </div>
      </div>
    </div>
  )
}

export function SlideshowPromptComposer({
  models,
  textModels,
}: {
  models: Model[]
  textModels: Model[]
}) {
  return (
    <PromptInputProvider>
      <SlideshowPromptComposerInner models={models} textModels={textModels} />
    </PromptInputProvider>
  )
}
