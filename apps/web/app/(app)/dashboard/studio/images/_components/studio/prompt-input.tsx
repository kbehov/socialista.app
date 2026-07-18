'use client'

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
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
import { AspectRatioIcon } from '@/components/icons/aspect-ration.icon'
import { ModelProviderIcon } from '@/components/icons/model-provider-icon'
import { Badge } from '@/components/ui/badge'
import { Kbd } from '@/components/ui/kbd'
import { Separator } from '@/components/ui/separator'
import { useImageStudio } from '@/context/image-studio-provider'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { storeGenerationAccessToken } from '@/lib/image-generation/session'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/workspace.store'
import { formatModelCost } from '@/utils/format'
import { commitHaptic } from '@/utils/haptics'
import type { Model } from '@socialista/types'
import { ChevronDownIcon, SparklesIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { getVibePlaceholder, type AspectRatioId } from '@/lib/studio/images/examples'
import { startImageGeneration } from '../../_actions/generation'
import { ImagePromptAnatomy } from './prompt-anatomy'

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square', ratio: 1 },
  { id: '16:9', label: 'Landscape', ratio: 16 / 9 },
  { id: '9:16', label: 'Portrait', ratio: 9 / 16 },
  { id: '4:3', label: 'Classic', ratio: 4 / 3 },
] as const satisfies ReadonlyArray<{ id: AspectRatioId; label: string; ratio: number }>

type ModelHighlight = 'cheapest' | 'newest' | 'mostUsed'

const MODEL_HIGHLIGHT_CONFIG = {
  cheapest: {
    emoji: '💸',
    label: 'Cheapest',
    className: 'border-success/25 bg-success/10 text-success',
  },
  newest: {
    emoji: '✨',
    label: 'Newest',
    className: 'border-info/25 bg-info/10 text-info',
  },
  mostUsed: {
    emoji: '🔥',
    label: 'Most used',
    className: 'border-warning/25 bg-warning/10 text-warning-foreground',
  },
} as const satisfies Record<ModelHighlight, { emoji: string; label: string; className: string }>

function getModelUsageCount(model: Model): number {
  if ('usageCount' in model && typeof model.usageCount === 'number') {
    return model.usageCount
  }
  return 0
}

function buildModelHighlights(models: Model[]): Map<string, ModelHighlight[]> {
  const highlights = new Map<string, ModelHighlight[]>()
  if (models.length === 0) return highlights

  const newestId = [...models].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0]?._id
  const cheapestId = [...models].sort((a, b) => a.cost - b.cost)[0]?._id
  const mostUsedModel = [...models].sort((a, b) => getModelUsageCount(b) - getModelUsageCount(a))[0]
  const mostUsedId =
    mostUsedModel && getModelUsageCount(mostUsedModel) > 0 ? mostUsedModel._id : undefined

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
        'h-[18px] gap-0.5 rounded-md border px-1.5 py-0 text-[10px] font-medium leading-none',
      )}
    >
      <span aria-hidden className="text-[11px] leading-none">
        {config.emoji}
      </span>
      <span>{config.label}</span>
    </Badge>
  )
}

function ImagePromptComposer({ models }: { models: Model[] }) {
  const router = useRouter()
  const { textInput } = usePromptInputController()
  const { selectedVibe, composerRef, registerPromptHandlers, setActiveExampleId } = useImageStudio()
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const [isPending, startTransition] = useTransition()
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
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
      const result = await startImageGeneration({
        prompt,
        model: selectedModel.value,
        workspaceId: currentWorkspace._id,
        aspectRatio,
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
            'h-7 max-w-[min(100%,14rem)] gap-1.5 rounded-lg border px-2 shadow-xs',
            'border-border/50 bg-background/90 transition-[border-color,background-color,box-shadow] duration-150',
            'hover:border-border hover:bg-background',
            modelSelectorOpen && 'border-border bg-background shadow-sm',
          )}
          disabled={isPending}
          type="button"
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted/60 ring-1 ring-border/35">
            <ModelProviderIcon className="size-3" provider={selectedModel.modelProvider} />
          </span>
          {selectedModelHighlights[0] ? (
            <span aria-hidden className="shrink-0 text-[11px] leading-none">
              {MODEL_HIGHLIGHT_CONFIG[selectedModelHighlights[0]].emoji}
            </span>
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

      <ModelSelectorContent
        className="gap-0 overflow-hidden p-0 sm:max-w-104"
        showCloseButton={false}
        title="Choose model"
      >
        <div className="border-b border-border/50 px-3.5 py-3">
          <p className="text-sm font-medium tracking-[-0.01em] text-foreground">Choose your model</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            <span className="mr-2 inline-flex items-center gap-1">
              <span aria-hidden>💸</span>
              Cheapest
            </span>
            <span className="mr-2 inline-flex items-center gap-1">
              <span aria-hidden>✨</span>
              Newest
            </span>
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>🔥</span>
              Most used
            </span>
          </p>
        </div>
        <ModelSelectorInput placeholder="Search models…" />
        <ModelSelectorList className="max-h-80 px-1 pb-1">
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
                      className={cn(
                        'gap-3 rounded-lg px-2.5 py-2.5',
                        isSelected && 'bg-muted/40',
                      )}
                      data-checked={isSelected ? true : undefined}
                      onSelect={() => handleModelSelect(model._id)}
                      value={`${model.name} ${model.modelProvider}`}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/55 ring-1 ring-border/40">
                        <ModelProviderIcon className="size-3.5" provider={model.modelProvider} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                        <span className="truncate text-sm font-medium leading-tight">{model.name}</span>
                        {highlights.length > 0 ? (
                          <span className="flex flex-wrap gap-1">
                            {highlights.map(highlight => (
                              <ModelHighlightBadge key={highlight} highlight={highlight} />
                            ))}
                          </span>
                        ) : null}
                      </span>
                      <ModelSelectorShortcut className="rounded-md bg-muted/45 px-1.5 py-0.5 text-[11px] tracking-normal tabular-nums">
                        {formatModelCost(model.cost, model.costUnit)}
                      </ModelSelectorShortcut>
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
    <div ref={composerRef} className="w-full scroll-mt-6">
      <PromptInput
        className={cn(
          'overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm',
          'transition-[border-color,box-shadow] duration-200',
          'has-[[data-slot=input-group-control]:focus-visible]:border-ring/50',
          'has-[[data-slot=input-group-control]:focus-visible]:shadow-md',
          'has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/15',
          '[box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.05)]',
        )}
        onSubmit={handleSubmit}
      >
        <PromptInputBody className="relative">
          <PromptInputTextarea
            ref={textareaRef}
            className={cn(
              'min-h-32 px-4 pt-4 pb-8 text-[15px] leading-[1.6] tracking-[-0.01em]',
              'placeholder:text-muted-foreground/55 placeholder:transition-opacity placeholder:duration-300',
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
              className="pointer-events-none absolute right-3.5 bottom-2.5 text-[10px] tabular-nums text-muted-foreground/45"
            >
              {textInput.value.length}
            </span>
          ) : null}
        </PromptInputBody>

        <PromptInputFooter className="border-t border-border/45 px-3 py-2 sm:px-3.5 sm:py-2.5">
          <PromptInputTools className="min-w-0 flex-wrap gap-1.5">
            <div
              className="flex items-center gap-0.5 rounded-lg border border-border/35 bg-background/70 p-0.5 shadow-xs"
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
                      'h-7 gap-1.5 rounded-md px-2 text-xs transition-[background-color,box-shadow,color] duration-150',
                      'active:scale-[0.97]',
                      isSelected
                        ? 'bg-background text-foreground shadow-xs ring-1 ring-border/50 hover:bg-background'
                        : 'text-muted-foreground hover:text-foreground',
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

            <Separator className="hidden h-5 sm:block" orientation="vertical" />

            {modelSelector}
          </PromptInputTools>

          <div className="flex shrink-0 items-center gap-2">
            {selectedModel ? (
              <span className="hidden text-[11px] tabular-nums text-muted-foreground/80 md:inline">
                {formatModelCost(selectedModel.cost, selectedModel.costUnit)}
              </span>
            ) : null}
            <PromptInputSubmit
              className={cn(
                'h-8 gap-1.5 rounded-lg px-3.5 text-[13px] font-medium shadow-sm',
                'transition-[transform,opacity,box-shadow] duration-150 active:scale-[0.98]',
                !canSubmit && 'opacity-55',
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

      <div className="mt-2.5 space-y-2.5">
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-muted-foreground/75">
          <span>Press</span>
          <Kbd className="h-4 min-w-4 px-1 text-[10px]">/</Kbd>
          <span>to focus</span>
          <span aria-hidden className="text-muted-foreground/35">
            ·
          </span>
          <span>Press</span>
          <Kbd className="h-4 min-w-4 px-1 text-[10px]">⌘↵</Kbd>
          <span>to generate</span>
        </p>
        <ImagePromptAnatomy />
      </div>
    </div>
  )
}

const ImageGenerationPromptInput = ({ models }: { models: Model[] }) => {
  if (models.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-muted/20 px-6 py-10 text-center">
        <p className="text-[15px] font-medium text-foreground">No image models yet</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
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
