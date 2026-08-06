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
import { AttachedMediaThumb, AttachImagesDialog, type AttachedImage } from '@/components/files/attach-images-dialog'
import { AspectRatioIcon } from '@/components/icons/aspect-ration.icon'
import { ModelProviderIcon } from '@/components/icons/model-provider-icon'
import { useImageStudio } from '@/components/studio/images/image-studio-provider'
import { Badge } from '@/components/ui/badge'
import { Kbd } from '@/components/ui/kbd'
import { Separator } from '@/components/ui/separator'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { storeGenerationAccessToken } from '@/lib/image-generation/session'
import {
  getVibePlaceholder,
  VIBE_IDS,
  VIBE_LABELS,
  type AspectRatioId,
  type VibeId,
} from '@/lib/studio/images/examples'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/workspace.store'
import { formatModelCost } from '@/utils/format'
import { commitHaptic } from '@/utils/haptics'
import { ContextSupport, type Model } from '@socialista/types'
import {
  CheckIcon,
  ChevronDownIcon,
  FileIcon,
  ImageIcon,
  ImagePlusIcon,
  MusicIcon,
  SparklesIcon,
  TypeIcon,
  VideoIcon,
  type LucideIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ImagePromptAnatomy } from './prompt-anatomy'

const MAX_REFERENCE_IMAGES = 3

const QUICK_VIBES = VIBE_IDS.filter((vibe): vibe is Exclude<VibeId, 'all'> => vibe !== 'all').slice(0, 5)

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
        'h-4 shrink-0 rounded-full border-0 px-1.5 py-0 text-[9px] font-medium leading-none tracking-[-0.01em]',
      )}
    >
      {config.label}
    </Badge>
  )
}
const SUPPORT_LABELS: Record<ContextSupport, { label: string; icon: LucideIcon }> = {
  [ContextSupport.IMAGE]: {
    label: 'Image',
    icon: ImageIcon,
  },
  [ContextSupport.VIDEO]: {
    label: 'Video',
    icon: VideoIcon,
  },
  [ContextSupport.AUDIO]: {
    label: 'Audio',
    icon: MusicIcon,
  },
  [ContextSupport.TEXT]: {
    label: 'Text',
    icon: TypeIcon,
  },
  [ContextSupport.FILE]: {
    label: 'File',
    icon: FileIcon,
  },
}

function ImagePromptComposer({ models }: { models: Model[] }) {
  const router = useRouter()
  const { textInput } = usePromptInputController()
  const {
    selectedVibe,
    setSelectedVibe,
    activeExampleId,
    composerRef,
    registerPromptHandlers,
    setActiveExampleId,
  } = useImageStudio()
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
            'h-7 max-w-[min(100%,14rem)] gap-1.5 rounded-xl border px-1.5 pr-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
            'border-border/40 bg-background/90 transition-[border-color,background-color,box-shadow] duration-150',
            'hover:border-border/65 hover:bg-background',
            'active:scale-[0.97]',
            modelSelectorOpen && 'border-border/65 bg-background shadow-sm',
          )}
          disabled={isPending}
          type="button"
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-[0.4375rem] bg-muted/50 ring-1 ring-border/30">
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
          <ModelSelectorName className="text-xs font-medium leading-none tracking-[-0.015em]">
            {selectedModel.name}
          </ModelSelectorName>
          <ChevronDownIcon
            className={cn(
              'size-3 shrink-0 text-muted-foreground/60 transition-transform duration-200 ease-out',
              modelSelectorOpen && 'rotate-180',
            )}
          />
        </PromptInputButton>
      </ModelSelectorTrigger>

      <ModelSelectorContent className="sm:max-w-104" title="Choose model">
        <ModelSelectorHeader
          heading="Models"
          description={
            <>
              {models.length} available
              {chefs.length > 1 ? ` · ${chefs.length} providers` : null}
            </>
          }
        />
        <ModelSelectorInput placeholder="Search by name or provider…" />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models match your search.</ModelSelectorEmpty>
          {chefs.map(chef => (
            <ModelSelectorGroup heading={chef} key={chef}>
              {models
                .filter(model => model.chef === chef)
                .map(model => {
                  const isSelected = selectedModelId === model._id
                  const highlights = modelHighlights.get(model._id) ?? []
                  const supports = model.contextSupports ?? []

                  return (
                    <ModelSelectorItem
                      key={model._id}
                      data-checked={isSelected ? true : undefined}
                      onSelect={() => handleModelSelect(model._id)}
                      value={`${model.name} ${model.modelProvider} ${model.chef}`}
                    >
                      <ModelSelectorLogoBadge>
                        <ModelProviderIcon className="size-3.5" provider={model.modelProvider} />
                      </ModelSelectorLogoBadge>

                      <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <ModelSelectorName className="min-w-0 flex-1 text-[13px] font-medium leading-none tracking-[-0.016em]">
                            {model.name}
                          </ModelSelectorName>
                          {highlights.length > 0 ? (
                            <span className="flex shrink-0 items-center gap-1">
                              {highlights.map(highlight => (
                                <ModelHighlightBadge key={highlight} highlight={highlight} />
                              ))}
                            </span>
                          ) : null}
                        </span>

                        {supports.length > 0 ? (
                          <span className="flex items-center gap-1.5">
                            {supports.map(support => {
                              const { icon: Icon, label } = SUPPORT_LABELS[support]
                              return (
                                <Icon
                                  key={support}
                                  aria-label={label}
                                  className="size-3 text-muted-foreground/40"
                                  strokeWidth={1.75}
                                />
                              )
                            })}
                          </span>
                        ) : null}
                      </span>

                      <span className="flex shrink-0 items-center gap-2.5">
                        <ModelSelectorShortcut>
                          {formatModelCost(model.cost, model.costUnit)}
                        </ModelSelectorShortcut>
                        <span
                          aria-hidden
                          className={cn(
                            'flex size-4 items-center justify-center transition-opacity duration-150',
                            isSelected ? 'opacity-100' : 'opacity-0',
                          )}
                        >
                          <CheckIcon className="size-3.5 text-foreground" strokeWidth={2.25} />
                        </span>
                      </span>
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
          'rounded-3xl border-border/45 bg-background/95 transition-[border-color,box-shadow,ring-color] duration-200',
          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_2px_rgba(0,0,0,0.03),0_12px_40px_-18px_rgba(0,0,0,0.12)]',
          'has-[[data-slot=input-group-control]:focus-visible]:border-ring/25',
          'has-[[data-slot=input-group-control]:focus-visible]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_1px_2px_rgba(0,0,0,0.04),0_16px_44px_-16px_rgba(0,0,0,0.14)]',
          'has-[[data-slot=input-group-control]:focus-visible]:ring-2',
          'has-[[data-slot=input-group-control]:focus-visible]:ring-ring/6',
          'dark:bg-background/80',
          'dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_1px_2px_rgba(0,0,0,0.2),0_12px_40px_-18px_rgba(0,0,0,0.48)]',
          'dark:has-[[data-slot=input-group-control]:focus-visible]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03),0_1px_2px_rgba(0,0,0,0.24),0_16px_48px_-16px_rgba(0,0,0,0.52)]',
          activeExampleId && 'border-foreground/15 ring-2 ring-foreground/8',
        )}
        onSubmit={handleSubmit}
      >
        <PromptInputBody className="relative">
          <PromptInputTextarea
            ref={textareaRef}
            className={cn(
              'min-h-40 px-4 pt-4 pb-10 text-[15px] leading-[1.65] tracking-[-0.012em]',
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
              disabled={isPending || !selectedModel?.contextSupports?.includes(ContextSupport.IMAGE)}
              onClick={() => setAttachDialogOpen(true)}
              tooltip={
                selectedModel?.contextSupports?.includes(ContextSupport.IMAGE)
                  ? 'Attach images'
                  : 'This model does not support image generation'
              }
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

      <div className="mt-4 space-y-4">
        <div
          className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label="Quick vibes"
        >
          {QUICK_VIBES.map(vibe => {
            const isSelected = selectedVibe === vibe

            return (
              <button
                key={vibe}
                type="button"
                onClick={() => {
                  commitHaptic({ vibrateDuration: 6 })
                  setSelectedVibe(isSelected ? 'all' : vibe)
                  focusPrompt()
                }}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium tracking-[-0.015em]',
                  'ring-1 transition-[background-color,color,box-shadow,ring-color,transform] duration-150',
                  'active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
                  isSelected
                    ? 'bg-foreground/8 text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-border/50'
                    : 'bg-muted/20 text-muted-foreground ring-border/30 hover:bg-muted/35 hover:text-foreground/90 hover:ring-border/45',
                )}
              >
                {VIBE_LABELS[vibe]}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 px-0.5">
          <p className="inline-flex items-center gap-1.5 text-[11px] tracking-[-0.01em] text-muted-foreground/55">
            <Kbd className="h-4 min-w-4 border-border/40 bg-muted/30 px-1 text-[10px] text-muted-foreground/70">
              /
            </Kbd>
            <span>to focus</span>
            <span aria-hidden className="text-muted-foreground/25">
              ·
            </span>
            <Kbd className="h-4 min-w-4 border-border/40 bg-muted/30 px-1 text-[10px] text-muted-foreground/70">
              ⌘↵
            </Kbd>
            <span>to generate</span>
          </p>
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
