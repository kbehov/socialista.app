'use client'

import { startImageGeneration } from '@/actions/image-generation.actions'
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorHeader,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogoBadge,
  ModelSelectorName,
  ModelSelectorShortcut,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector'
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputController,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { AttachImagesDialog, AttachedMediaThumb, type AttachedImage } from '@/components/files/attach-images-dialog'
import { AspectRatioIcon } from '@/components/icons/aspect-ration.icon'
import { ModelProviderIcon } from '@/components/icons/model-provider-icon'
import { useImageStudio } from '@/components/studio/images/image-studio-provider'
import { Badge } from '@/components/ui/badge'
import { Kbd } from '@/components/ui/kbd'
import { Separator } from '@/components/ui/separator'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { storeGenerationAccessToken } from '@/lib/image-generation/session'
import { getVibePlaceholder, VIBE_LABELS, type AspectRatioId } from '@/lib/studio/images/examples'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/workspace.store'
import { formatModelCost } from '@/utils/format'
import { commitHaptic } from '@/utils/haptics'
import type { Model } from '@socialista/types'
import { ChevronDownIcon, ImagePlusIcon, SparklesIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ImagePromptAnatomy } from './prompt-anatomy'

const MAX_REFERENCE_IMAGES = 3

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square', ratio: 1 },
  { id: '16:9', label: 'Landscape', ratio: 16 / 9 },
  { id: '9:16', label: 'Portrait', ratio: 9 / 16 },
  { id: '4:3', label: 'Classic', ratio: 4 / 3 },
] as const satisfies ReadonlyArray<{ id: AspectRatioId; label: string; ratio: number }>

type ModelHighlight = 'cheapest' | 'newest' | 'mostUsed'

const MODEL_HIGHLIGHT_CONFIG = {
  cheapest: {
    label: 'Cheapest',
    className: 'border-success/20 bg-success/10 text-success',
  },
  newest: {
    label: 'New',
    className: 'border-info/20 bg-info/10 text-info',
  },
  mostUsed: {
    label: 'Popular',
    className: 'border-warning/20 bg-warning/10 text-warning-foreground',
  },
} as const satisfies Record<ModelHighlight, { label: string; className: string }>

function getModelUsageCount(model: Model): number {
  if ('usageCount' in model && typeof model.usageCount === 'number') {
    return model.usageCount
  }
  return 0
}

function buildModelHighlights(models: Model[]): Map<string, ModelHighlight[]> {
  const highlights = new Map<string, ModelHighlight[]>()
  if (models.length === 0) return highlights

  const newestId = [...models].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?._id
  const cheapestId = [...models].sort((a, b) => a.cost - b.cost)[0]?._id
  const mostUsedModel = [...models].sort((a, b) => getModelUsageCount(b) - getModelUsageCount(a))[0]
  const mostUsedId = mostUsedModel && getModelUsageCount(mostUsedModel) > 0 ? mostUsedModel._id : undefined

  for (const model of models) {
    const modelHighlights: ModelHighlight[] = []
    if (model._id === newestId) modelHighlights.push('newest')
    if (model._id === cheapestId) modelHighlights.push('cheapest')
    if (mostUsedId && model._id === mostUsedId) modelHighlights.push('mostUsed')
    if (modelHighlights.length > 0) highlights.set(model._id, modelHighlights)
  }

  return highlights
}

function ModelHighlightBadge({ highlight }: { highlight: ModelHighlight }) {
  const config = MODEL_HIGHLIGHT_CONFIG[highlight]

  return (
    <Badge
      className={cn(
        config.className,
        'h-[18px] rounded-md border px-1.5 py-0 text-[10px] font-medium leading-none tracking-[-0.01em]',
      )}
    >
      {config.label}
    </Badge>
  )
}

function ImagePromptComposer({ models }: { models: Model[] }) {
  const router = useRouter()
  const { textInput } = usePromptInputController()
  const { selectedVibe, activeExampleId, composerRef, registerPromptHandlers, setActiveExampleId } = useImageStudio()
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const [isPending, startTransition] = useTransition()
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const [attachDialogOpen, setAttachDialogOpen] = useState(false)
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([])
  const [selectedModelId, setSelectedModelId] = useState(models[0]?._id ?? '')
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>('1:1')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedModel = useMemo(
    () => models.find(model => model._id === selectedModelId) ?? models[0],
    [models, selectedModelId],
  )

  const chefs = useMemo(() => [...new Set(models.map(model => model.chef))].sort(), [models])
  const modelHighlights = useMemo(() => buildModelHighlights(models), [models])
  const selectedModelHighlights = useMemo(
    () => (selectedModel ? (modelHighlights.get(selectedModel._id) ?? []) : []),
    [modelHighlights, selectedModel],
  )

  const placeholder = useMemo(() => getVibePlaceholder(selectedVibe), [selectedVibe])
  const hasPrompt = textInput.value.trim().length > 0
  const canSubmit = hasPrompt && !!selectedModel && !isPending

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

  const focusPrompt = useCallback(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    registerPromptHandlers({
      setPrompt: textInput.setInput,
      setAspectRatio,
      insertAtCursor,
      focusPrompt,
    })
  }, [registerPromptHandlers, textInput.setInput, insertAtCursor, focusPrompt])

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable

      if (event.key === '/' && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        focusPrompt()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [focusPrompt])

  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId)
    setModelSelectorOpen(false)
  }

  const handleSubmit = (message: PromptInputMessage) => {
    const prompt = message.text.trim()
    if (!prompt) return

    if (!selectedModel) {
      toast.error('Select a model to continue.')
      return
    }

    if (!currentWorkspace?._id) {
      toast.error('Select a workspace to continue.')
      return
    }

    startTransition(async () => {
      const imageUrls = attachedImages.map(image => image.url)
      const result = await startImageGeneration({
        prompt,
        model: selectedModel.value,
        workspaceId: currentWorkspace._id,
        aspectRatio,
        userId: '',
        ...(imageUrls.length === 1 ? { imageUrl: imageUrls[0] } : imageUrls.length > 1 ? { imageUrls } : {}),
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      commitHaptic({ vibrateDuration: 10 })
      storeGenerationAccessToken(result.runId, result.publicAccessToken)
      router.push(DASHBOARD_ROUTES.STUDIO.imageRun(result.runId))
    })
  }

  const modelSelector = selectedModel ? (
    <ModelSelector onOpenChange={setModelSelectorOpen} open={modelSelectorOpen}>
      <ModelSelectorTrigger asChild>
        <PromptInputButton
          aria-expanded={modelSelectorOpen}
          aria-haspopup="dialog"
          className={cn(
            'h-7 max-w-[min(100%,14rem)] gap-1.5 rounded-xl border px-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
            'border-border/40 bg-background/90 transition-[border-color,background-color,box-shadow] duration-150',
            'hover:border-border/65 hover:bg-background',
            modelSelectorOpen && 'border-border/65 bg-background shadow-sm',
          )}
          disabled={isPending}
          type="button"
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-lg bg-muted/55 ring-1 ring-border/35">
            <ModelProviderIcon className="size-3" provider={selectedModel.modelProvider} />
          </span>
          {selectedModelHighlights[0] ? (
            <span
              aria-hidden
              className={cn(
                'size-1.5 shrink-0 rounded-full',
                selectedModelHighlights[0] === 'cheapest' && 'bg-success',
                selectedModelHighlights[0] === 'newest' && 'bg-info',
                selectedModelHighlights[0] === 'mostUsed' && 'bg-warning',
              )}
            />
          ) : null}
          <ModelSelectorName className="text-xs font-medium leading-none">{selectedModel.name}</ModelSelectorName>
          <ChevronDownIcon
            className={cn(
              'size-3 shrink-0 text-muted-foreground transition-transform duration-200',
              modelSelectorOpen && 'rotate-180',
            )}
          />
        </PromptInputButton>
      </ModelSelectorTrigger>

      <ModelSelectorContent className="sm:max-w-104" title="Choose model">
        <ModelSelectorHeader
          heading="Choose model"
          description={
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="size-1.5 rounded-full bg-success" />
                Cheapest
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="size-1.5 rounded-full bg-info" />
                New
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="size-1.5 rounded-full bg-warning" />
                Popular
              </span>
            </p>
          }
        />
        <ModelSelectorInput placeholder="Search models…" />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          {chefs.map(chef => (
            <ModelSelectorGroup heading={chef} key={chef}>
              {models
                .filter(model => model.chef === chef)
                .map(model => {
                  const isSelected = selectedModelId === model._id
                  const highlights = modelHighlights.get(model._id) ?? []

                  return (
                    <ModelSelectorItem
                      key={model._id}
                      data-checked={isSelected ? true : undefined}
                      onSelect={() => handleModelSelect(model._id)}
                      value={`${model.name} ${model.modelProvider}`}
                    >
                      <ModelSelectorLogoBadge>
                        <ModelProviderIcon className="size-3.5" provider={model.modelProvider} />
                      </ModelSelectorLogoBadge>
                      <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                        <ModelSelectorName className="text-[13px] font-medium leading-tight">
                          {model.name}
                        </ModelSelectorName>
                        {highlights.length > 0 ? (
                          <span className="flex flex-wrap gap-1">
                            {highlights.map(highlight => (
                              <ModelHighlightBadge key={highlight} highlight={highlight} />
                            ))}
                          </span>
                        ) : null}
                      </span>
                      <ModelSelectorShortcut>{formatModelCost(model.cost, model.costUnit)}</ModelSelectorShortcut>
                    </ModelSelectorItem>
                  )
                })}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  ) : null

  return (
    <div
      ref={composerRef}
      className={cn(
        'w-full scroll-mt-10 transition-[transform,opacity] duration-300',
        activeExampleId && 'animate-in fade-in-0 duration-300',
      )}
    >
      <PromptInput
        className={cn(
          'rounded-[1.375rem] border-border/50 bg-background transition-[border-color,box-shadow,ring-color] duration-200',
          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_2px_rgba(0,0,0,0.03),0_10px_32px_-16px_rgba(0,0,0,0.1)]',
          'has-[[data-slot=input-group-control]:focus-visible]:border-ring/25',
          'has-[[data-slot=input-group-control]:focus-visible]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_2px_rgba(0,0,0,0.04),0_12px_36px_-16px_rgba(0,0,0,0.12)]',
          'has-[[data-slot=input-group-control]:focus-visible]:ring-2',
          'has-[[data-slot=input-group-control]:focus-visible]:ring-ring/6',
          'dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_1px_2px_rgba(0,0,0,0.18),0_10px_32px_-16px_rgba(0,0,0,0.42)]',
          'dark:has-[[data-slot=input-group-control]:focus-visible]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_1px_2px_rgba(0,0,0,0.22),0_14px_40px_-16px_rgba(0,0,0,0.48)]',
          activeExampleId && 'border-foreground/15 ring-2 ring-foreground/8',
        )}
        onSubmit={handleSubmit}
      >
        <PromptInputBody className="relative">
          <PromptInputTextarea
            ref={textareaRef}
            className={cn(
              'min-h-[9rem] px-4 pt-4 pb-10 text-[15px] leading-[1.65] tracking-[-0.012em]',
              'placeholder:text-muted-foreground/45 placeholder:transition-opacity placeholder:duration-300',
              'focus:outline-none focus:ring-0',
            )}
            disabled={isPending}
            placeholder={placeholder}
            onChange={() => setActiveExampleId(null)}
            onKeyDown={event => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
          />
          {hasPrompt ? (
            <span
              aria-hidden
              className="pointer-events-none absolute right-4 bottom-3 text-[10px] tabular-nums tracking-[-0.01em] text-muted-foreground/35"
            >
              {textInput.value.length.toLocaleString()}
            </span>
          ) : null}
        </PromptInputBody>

        {attachedImages.length > 0 ? (
          <div className="flex w-full gap-2 overflow-x-auto border-t border-border/35 bg-muted/12 px-3 pt-2.5 scrollbar-none sm:px-3.5">
            {attachedImages.map(image => (
              <AttachedMediaThumb
                key={image.id}
                file={image}
                size="sm"
                disabled={isPending}
                onRemove={id => setAttachedImages(current => current.filter(item => item.id !== id))}
              />
            ))}
          </div>
        ) : null}

        <PromptInputFooter
          className={cn(
            'border-t border-border/35 bg-muted/12 px-3 py-2.5 sm:px-3.5',
            attachedImages.length > 0 && 'border-t-0 pt-2',
          )}
        >
          <PromptInputTools className="min-w-0 flex-wrap gap-2">
            <PromptInputButton
              aria-label="Attach images"
              className={cn(
                'h-7 gap-1.5 rounded-xl border px-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
                'border-border/40 bg-background/90 transition-[border-color,background-color,box-shadow] duration-150',
                'hover:border-border/65 hover:bg-background',
                attachedImages.length > 0 && 'border-border/65 bg-background shadow-sm',
              )}
              disabled={isPending}
              onClick={() => setAttachDialogOpen(true)}
              tooltip="Attach images"
              type="button"
            >
              <ImagePlusIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
              <span className="text-xs font-medium leading-none tracking-[-0.015em]">
                {attachedImages.length > 0 ? attachedImages.length : 'Attach'}
              </span>
            </PromptInputButton>

            <Separator className="hidden h-5 bg-border/50 sm:block" orientation="vertical" />

            <div
              className="flex items-center gap-0.5 rounded-xl bg-muted/30 p-0.5 ring-1 ring-border/30"
              role="group"
              aria-label="Aspect ratio"
            >
              {ASPECT_RATIOS.map(option => {
                const isSelected = aspectRatio === option.id

                return (
                  <PromptInputButton
                    key={option.id}
                    aria-pressed={isSelected}
                    className={cn(
                      'h-7 gap-1.5 rounded-lg px-2 text-xs tracking-[-0.015em] transition-[background-color,box-shadow,color,transform] duration-150',
                      'active:scale-[0.97]',
                      isSelected
                        ? 'bg-background text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-border/50 hover:bg-background'
                        : 'text-muted-foreground hover:text-foreground/90',
                    )}
                    disabled={isPending}
                    onClick={() => setAspectRatio(option.id)}
                    tooltip={option.label}
                    type="button"
                  >
                    <AspectRatioIcon active={isSelected} ratio={option.ratio} />
                    <span className="max-[360px]:sr-only">{option.id}</span>
                  </PromptInputButton>
                )
              })}
            </div>

            <Separator className="hidden h-5 bg-border/50 sm:block" orientation="vertical" />

            {modelSelector}
          </PromptInputTools>

          <div className="flex shrink-0 items-center gap-2.5">
            {selectedModel ? (
              <span className="hidden text-[11px] tabular-nums tracking-[-0.015em] text-muted-foreground/65 md:inline">
                {formatModelCost(selectedModel.cost, selectedModel.costUnit)}
              </span>
            ) : null}
            <PromptInputSubmit
              className={cn(
                'h-8 gap-1.5 rounded-xl px-3.5 text-[13px] font-semibold tracking-[-0.015em]',
                'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_12px_-4px_rgba(0,0,0,0.12)]',
                'transition-[transform,opacity,box-shadow] duration-150 active:scale-[0.98]',
                !canSubmit && 'opacity-45 shadow-none',
              )}
              disabled={!canSubmit}
              size="sm"
              status={isPending ? 'submitted' : undefined}
            >
              <SparklesIcon className="size-3.5 shrink-0" />
              <span className="hidden sm:inline">Generate</span>
              <Kbd className="ml-0.5 hidden h-5 min-w-5 border-primary-foreground/15 bg-primary-foreground/10 px-1 text-[10px] font-normal text-primary-foreground/85 lg:inline-flex">
                ⌘↵
              </Kbd>
            </PromptInputSubmit>
          </div>
        </PromptInputFooter>
      </PromptInput>

      <AttachImagesDialog
        open={attachDialogOpen}
        accept="image"
        onOpenChange={setAttachDialogOpen}
        maxImagesSelect={MAX_REFERENCE_IMAGES}
        initialSelected={attachedImages}
        workspaceId={currentWorkspace?._id}
        title="Attach reference images"
        description="Guide the model with product shots, mood boards, or style references."
        onSelect={setAttachedImages}
      />

      <div className="mt-3.5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-full bg-muted/20 px-2.5 py-1 text-[11px] tracking-[-0.01em] text-muted-foreground/70 ring-1 ring-border/30">
            <Kbd className="h-4 min-w-4 border-border/50 bg-background/80 px-1 text-[10px]">/</Kbd>
            <span>focus</span>
            <span aria-hidden className="text-muted-foreground/25">
              ·
            </span>
            <Kbd className="h-4 min-w-4 border-border/50 bg-background/80 px-1 text-[10px]">⌘↵</Kbd>
            <span>generate</span>
          </p>
          {selectedVibe !== 'all' ? (
            <span className="text-[11px] tracking-[-0.01em] text-muted-foreground/55">
              {VIBE_LABELS[selectedVibe]} examples
            </span>
          ) : null}
        </div>
        <ImagePromptAnatomy />
      </div>
    </div>
  )
}

const ImageGenerationPromptInput = ({ models }: { models: Model[] }) => {
  if (models.length === 0) {
    return (
      <div className="rounded-[1.375rem] border border-dashed border-border/50 bg-muted/10 px-6 py-14 text-center">
        <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-2xl bg-muted/40 ring-1 ring-border/35">
          <SparklesIcon className="size-4 text-muted-foreground/80" />
        </div>
        <p className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">No image models yet</p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-[1.55] tracking-[-0.01em] text-muted-foreground">
          Add a text-to-image model in the manager to start creating social visuals.
        </p>
      </div>
    )
  }

  return (
    <PromptInputProvider>
      <ImagePromptComposer models={models} />
    </PromptInputProvider>
  )
}

export default ImageGenerationPromptInput
