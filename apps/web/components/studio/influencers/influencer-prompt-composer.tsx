'use client'

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
import { ModelProviderIcon } from '@/components/icons/model-provider-icon'
import { Badge } from '@/components/ui/badge'
import { Kbd } from '@/components/ui/kbd'
import { INFLUENCER_PROMPT_PLACEHOLDER } from '@/lib/studio/influencers/options'
import { cn } from '@/lib/utils'
import { formatModelCost } from '@/utils/format'
import { ContextSupport, INFLUENCER_GENERATION_BILLED, INFLUENCER_GENERATION_SHOT_COUNT, INFLUENCER_MAX_USER_REFERENCE_IMAGES, type Model } from '@socialista/types'
import {
  CheckIcon,
  ChevronDownIcon,
  ImagePlusIcon,
  SparklesIcon,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const MAX_REFERENCE_IMAGES = INFLUENCER_MAX_USER_REFERENCE_IMAGES

type ModelHighlight = 'cheapest' | 'newest' | 'mostUsed'

const MODEL_HIGHLIGHT_CONFIG = {
  cheapest: { label: 'Cheapest', className: 'border-success/20 bg-success/10 text-success' },
  newest: { label: 'New', className: 'border-info/20 bg-info/10 text-info' },
  mostUsed: { label: 'Popular', className: 'border-warning/20 bg-warning/10 text-warning-foreground' },
} as const satisfies Record<ModelHighlight, { label: string; className: string }>

function getModelUsageCount(model: Model): number {
  if ('usageCount' in model && typeof model.usageCount === 'number') return model.usageCount
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

export type InfluencerPromptComposerProps = {
  models: Model[]
  selectedModelId: string
  onSelectedModelChange: (id: string) => void
  referenceImages: AttachedImage[]
  onReferenceImagesChange: (images: AttachedImage[]) => void
  workspaceId: string
  onSubmit: (message: PromptInputMessage) => void
  disabled?: boolean
  /** When true, allow generate even without creative direction or style refs (e.g. niche selected). */
  formReady?: boolean
  /** Resets prompt text when presets are applied */
  initialInput?: string
  composerKey?: string
}

function InfluencerPromptComposerInner({
  models,
  selectedModelId,
  onSelectedModelChange,
  referenceImages,
  onReferenceImagesChange,
  workspaceId,
  onSubmit,
  disabled,
  formReady,
}: InfluencerPromptComposerProps) {
  const { textInput } = usePromptInputController()
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const [attachDialogOpen, setAttachDialogOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedModel = useMemo(
    () => models.find(m => m._id === selectedModelId) ?? models[0],
    [models, selectedModelId],
  )
  const chefs = useMemo(() => [...new Set(models.map(m => m.chef))].sort(), [models])
  const modelHighlights = useMemo(() => buildModelHighlights(models), [models])
  const generationCost = selectedModel ? selectedModel.cost * INFLUENCER_GENERATION_BILLED : 0

  const hasPrompt = textInput.value.trim().length > 0
  const hasReferences = referenceImages.length > 0
  const canSubmit = (hasPrompt || hasReferences || formReady) && !!selectedModel && !disabled

  const focusPrompt = useCallback(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if (event.key === '/' && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        focusPrompt()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [focusPrompt])

  const modelSelector = selectedModel ? (
    <ModelSelector onOpenChange={setModelSelectorOpen} open={modelSelectorOpen}>
      <ModelSelectorTrigger asChild>
        <PromptInputButton
          aria-expanded={modelSelectorOpen}
          aria-haspopup="dialog"
          className={cn(
            'h-7 max-w-[min(100%,14rem)] gap-1.5 rounded-xl border px-1.5 pr-2',
            'border-border/40 bg-background/90 hover:border-border/65 hover:bg-background',
            modelSelectorOpen && 'border-border/65 bg-background shadow-sm',
          )}
          disabled={disabled}
          type="button"
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-[0.4375rem] bg-muted/50 ring-1 ring-border/30">
            <ModelProviderIcon className="size-3" provider={selectedModel.modelProvider} />
          </span>
          <ModelSelectorName className="text-xs font-medium leading-none tracking-[-0.015em]">
            {selectedModel.name}
          </ModelSelectorName>
          <ChevronDownIcon
            className={cn(
              'size-3 shrink-0 text-muted-foreground/60 transition-transform duration-200',
              modelSelectorOpen && 'rotate-180',
            )}
          />
        </PromptInputButton>
      </ModelSelectorTrigger>
      <ModelSelectorContent className="sm:max-w-104" title="Choose model">
        <ModelSelectorHeader heading="Models" description={`${models.length} available`} />
        <ModelSelectorInput placeholder="Search models…" />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models match.</ModelSelectorEmpty>
          {chefs.map(chef => (
            <ModelSelectorGroup heading={chef} key={chef}>
              {models
                .filter(m => m.chef === chef)
                .map(model => {
                  const isSelected = selectedModelId === model._id
                  const highlights = modelHighlights.get(model._id) ?? []
                  return (
                    <ModelSelectorItem
                      key={model._id}
                      data-checked={isSelected ? true : undefined}
                      onSelect={() => {
                        onSelectedModelChange(model._id)
                        setModelSelectorOpen(false)
                      }}
                      value={`${model.name} ${model.modelProvider}`}
                    >
                      <ModelSelectorLogoBadge>
                        <ModelProviderIcon className="size-3.5" provider={model.modelProvider} />
                      </ModelSelectorLogoBadge>
                      <span className="flex min-w-0 flex-1 items-center gap-1.5">
                        <ModelSelectorName className="min-w-0 flex-1 text-[13px] font-medium">
                          {model.name}
                        </ModelSelectorName>
                        {highlights.map(h => (
                          <Badge
                            key={h}
                            className={cn(
                              MODEL_HIGHLIGHT_CONFIG[h].className,
                              'h-4 rounded-full border-0 px-1.5 text-[9px]',
                            )}
                          >
                            {MODEL_HIGHLIGHT_CONFIG[h].label}
                          </Badge>
                        ))}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <ModelSelectorShortcut>
                          {formatModelCost(model.cost, model.costUnit)}
                        </ModelSelectorShortcut>
                        {isSelected ? <CheckIcon className="size-3.5" /> : null}
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
    <div className="w-full scroll-mt-10">
      <p className="mb-2 text-[11px] font-medium tracking-[0.08em] text-muted-foreground/80 uppercase">
        Creative direction
      </p>
      <PromptInput
        className={cn(
          'rounded-3xl border-border/45 bg-background/95 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.12)]',
          'has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/6',
        )}
        onSubmit={onSubmit}
        maxFiles={MAX_REFERENCE_IMAGES}
        accept="image/*"
      >
        <PromptInputBody className="relative">
          <PromptInputTextarea
            ref={textareaRef}
            className="min-h-28 px-4 pt-4 pb-3 text-[15px] leading-[1.65] tracking-[-0.012em]"
            disabled={disabled}
            placeholder={INFLUENCER_PROMPT_PLACEHOLDER}
            onKeyDown={event => {
              if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
          />
        </PromptInputBody>

        {referenceImages.length > 0 ? (
          <div className="flex w-full gap-2 overflow-x-auto border-t border-border/35 bg-muted/12 px-3 pt-2.5 pb-2">
            {referenceImages.map(image => (
              <AttachedMediaThumb
                key={image.id}
                file={image}
                size="sm"
                disabled={disabled}
                onRemove={id =>
                  onReferenceImagesChange(referenceImages.filter(item => item.id !== id))
                }
              />
            ))}
          </div>
        ) : null}

        <PromptInputFooter className="border-t border-border/35 bg-muted/12 px-3 py-2.5">
          <PromptInputTools className="min-w-0 flex-wrap gap-2">
            <PromptInputButton
              aria-label="Attach style reference images"
              className={cn(
                'h-7 gap-1.5 rounded-xl border px-2',
                'border-border/40 bg-background/90',
                referenceImages.length > 0 && 'border-border/65 bg-background shadow-sm',
              )}
              disabled={
                disabled ||
                !selectedModel?.contextSupports?.includes(ContextSupport.IMAGE) ||
                referenceImages.length >= MAX_REFERENCE_IMAGES
              }
              onClick={() => setAttachDialogOpen(true)}
              tooltip="Style reference — lighting, color grade (1 image max)"
              type="button"
            >
              <ImagePlusIcon className="size-3.5" strokeWidth={1.75} />
              <span className="text-xs font-medium">
                {referenceImages.length > 0 ? referenceImages.length : 'Style refs'}
              </span>
            </PromptInputButton>
            {modelSelector}
          </PromptInputTools>

          <div className="flex shrink-0 items-center gap-2">
            {selectedModel ? (
              <span className="hidden text-[11px] tabular-nums text-muted-foreground/65 lg:inline">
                {formatModelCost(generationCost, selectedModel.costUnit)} · {INFLUENCER_GENERATION_SHOT_COUNT} shots
              </span>
            ) : null}
            <PromptInputSubmit
              className={cn(
                'h-8 gap-1.5 rounded-xl px-3.5 text-[13px] font-semibold',
                !canSubmit && 'opacity-45',
              )}
              disabled={!canSubmit}
              size="sm"
              status={disabled ? 'submitted' : undefined}
            >
              <SparklesIcon className="size-3.5" strokeWidth={1.75} />
              <span className="hidden sm:inline">Generate</span>
              <Kbd className="ml-0.5 hidden h-5 min-w-5 border-primary-foreground/15 bg-primary-foreground/10 px-1 text-[10px] lg:inline-flex">
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
        initialSelected={referenceImages}
        workspaceId={workspaceId}
        title="Attach style reference"
        description="One photo — we'll match the lighting, color grade, and photographic vibe, not the person."
        onSelect={onReferenceImagesChange}
      />

      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 px-0.5 text-[11px] text-muted-foreground/55">
        <Kbd className="h-4 min-w-4 border-border/40 bg-muted/30 px-1 text-[10px]">/</Kbd>
        <span>to focus</span>
        <span aria-hidden>·</span>
        <Kbd className="h-4 min-w-4 border-border/40 bg-muted/30 px-1 text-[10px]">⌘↵</Kbd>
        <span>to generate</span>
        {hasReferences ? (
          <>
            <span aria-hidden>·</span>
            <span>Style reference mode — photographic vibe only</span>
          </>
        ) : null}
      </p>
    </div>
  )
}

export function InfluencerPromptComposer({
  initialInput = '',
  composerKey = 'default',
  ...props
}: InfluencerPromptComposerProps) {
  if (props.models.length === 0) {
    return (
      <div className="rounded-[1.375rem] border border-dashed border-border/50 bg-muted/10 px-6 py-14 text-center">
        <SparklesIcon className="mx-auto mb-4 size-8 text-muted-foreground/60" />
        <p className="text-[15px] font-semibold tracking-[-0.02em]">No image models available</p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] text-muted-foreground">
          Add an image generation model to create AI influencers.
        </p>
      </div>
    )
  }

  return (
    <PromptInputProvider key={composerKey} initialInput={initialInput}>
      <InfluencerPromptComposerInner {...props} />
    </PromptInputProvider>
  )
}
