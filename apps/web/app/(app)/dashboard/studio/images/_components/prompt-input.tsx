'use client'

import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector'
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputController,
} from '@/components/ai-elements/prompt-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { storeGenerationAccessToken } from '@/lib/image-generation/session'
import { useWorkspaceStore } from '@/store/workspace.store'
import type { Model } from '@socialista/types'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CheckIcon, ChevronDownIcon, SlidersHorizontalIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { getVibePlaceholder, type AspectRatioId } from '../_lib/examples'
import { useImageStudio } from '../_lib/studio-context'
import { startImageGeneration } from '../actions'
import { PromptAnatomy } from './prompt-anatomy'

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square', ratio: 1 },
  { id: '16:9', label: 'Landscape', ratio: 16 / 9 },
  { id: '9:16', label: 'Portrait', ratio: 9 / 16 },
  { id: '4:3', label: 'Classic', ratio: 4 / 3 },
] as const satisfies ReadonlyArray<{ id: AspectRatioId; label: string; ratio: number }>

function getProviderSlug(model: Model): string {
  return model.modelProvider.toLowerCase().replace(/\s+/g, '-')
}

function formatModelCost(model: Model): string {
  const credits = `${model.cost} credit${model.cost === 1 ? '' : 's'}`
  if (model.costUnit === 'generation') {
    return credits
  }
  return `${credits} / ${model.costUnit}`
}

function AspectRatioIcon({ ratio }: { ratio: number }) {
  const maxSize = 10
  const width = ratio >= 1 ? maxSize : maxSize * ratio
  const height = ratio >= 1 ? maxSize / ratio : maxSize

  return (
    <span aria-hidden className="inline-flex size-3 items-center justify-center">
      <span
        className="rounded-[1.5px] border border-current/70"
        style={{ width, height }}
      />
    </span>
  )
}

function ImagePromptComposer({ models }: { models: Model[] }) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const { textInput } = usePromptInputController()
  const { selectedVibe, composerRef, registerPromptHandlers, setActiveExampleId } = useImageStudio()
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const [isPending, startTransition] = useTransition()
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const [selectedModelId, setSelectedModelId] = useState(models[0]?._id ?? '')
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>('1:1')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [negativePrompt, setNegativePrompt] = useState('')
  const [styleIntensity, setStyleIntensity] = useState([60])
  const [seed, setSeed] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedModel = useMemo(
    () => models.find(model => model._id === selectedModelId) ?? models[0],
    [models, selectedModelId],
  )

  const chefs = useMemo(
    () => [...new Set(models.map(model => model.chef))].sort(),
    [models],
  )

  const placeholder = useMemo(() => getVibePlaceholder(selectedVibe), [selectedVibe])

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
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable

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

  const commitHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
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

      commitHaptic()
      storeGenerationAccessToken(result.runId, result.publicAccessToken)
      router.push(`/dashboard/studio/images/${result.runId}`)
    })
  }

  const modelSelector = selectedModel ? (
    <ModelSelector onOpenChange={setModelSelectorOpen} open={modelSelectorOpen}>
      <ModelSelectorTrigger asChild>
        <PromptInputButton
          className="max-w-[12rem] gap-2 px-2.5"
          disabled={isPending}
          type="button"
        >
          <ModelSelectorLogo className="size-3.5" provider={getProviderSlug(selectedModel)} />
          <ModelSelectorName className="text-xs font-medium">{selectedModel.name}</ModelSelectorName>
        </PromptInputButton>
      </ModelSelectorTrigger>

      <ModelSelectorContent title="Choose model">
        <ModelSelectorInput placeholder="Search models…" />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          {chefs.map(chef => (
            <ModelSelectorGroup heading={chef} key={chef}>
              {models
                .filter(model => model.chef === chef)
                .map(model => (
                  <ModelSelectorItem
                    key={model._id}
                    onSelect={() => handleModelSelect(model._id)}
                    value={`${model.name} ${model.modelProvider}`}
                  >
                    <ModelSelectorLogo className="size-3.5" provider={getProviderSlug(model)} />
                    <ModelSelectorName className="text-sm">{model.name}</ModelSelectorName>
                    {selectedModelId === model._id ? (
                      <CheckIcon className="ml-auto size-4 shrink-0" />
                    ) : (
                      <span className="ml-auto size-4 shrink-0" />
                    )}
                  </ModelSelectorItem>
                ))}
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
          'rounded-xl border border-border/60 bg-background shadow-sm',
          'ring-1 ring-foreground/[0.03]',
          '[box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.06)]',
          'motion-reduce:backdrop-blur-none',
          '[@media_(prefers-reduced-transparency:reduce)]:bg-background',
        )}
        onSubmit={handleSubmit}
      >
        <PromptInputBody>
          <PromptInputTextarea
            ref={textareaRef}
            className="min-h-[7.5rem] px-4 pt-4 text-[15px] leading-relaxed placeholder:text-muted-foreground/60"
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
        </PromptInputBody>

        <AnimatePresence initial={false}>
          {advancedOpen ? (
            <motion.div
              key="advanced-panel"
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.3 }}
              className="overflow-hidden border-t border-border/50 bg-muted/25 px-4 py-4"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Model</Label>
                  <div>{modelSelector}</div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="negative-prompt" className="text-xs text-muted-foreground">
                    Negative prompt
                    <span className="ml-1 text-[10px] text-muted-foreground/70">(coming soon)</span>
                  </Label>
                  <Input
                    id="negative-prompt"
                    value={negativePrompt}
                    onChange={event => setNegativePrompt(event.target.value)}
                    disabled
                    placeholder="What to avoid in the image…"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style-intensity" className="text-xs text-muted-foreground">
                    Style intensity
                    <span className="ml-1 text-[10px] text-muted-foreground/70">(coming soon)</span>
                  </Label>
                  <input
                    id="style-intensity"
                    type="range"
                    min={0}
                    max={100}
                    value={styleIntensity[0]}
                    disabled
                    className="w-full accent-foreground"
                    onChange={event => setStyleIntensity([Number(event.target.value)])}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seed" className="text-xs text-muted-foreground">
                    Seed
                    <span className="ml-1 text-[10px] text-muted-foreground/70">(coming soon)</span>
                  </Label>
                  <Input
                    id="seed"
                    value={seed}
                    onChange={event => setSeed(event.target.value)}
                    disabled
                    placeholder="Optional reproducibility seed"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <PromptInputFooter className="border-t border-border/50 px-3 py-2">
          <PromptInputTools className="flex-wrap gap-1.5">
            <div
              className="flex items-center gap-0.5 rounded-lg bg-muted/40 p-0.5"
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
                      'h-7 gap-1.5 rounded-md px-2 text-xs active:scale-[0.97]',
                      isSelected && 'bg-background text-foreground shadow-xs hover:bg-background',
                    )}
                    disabled={isPending}
                    onClick={() => setAspectRatio(option.id)}
                    tooltip={option.label}
                    type="button"
                  >
                    <AspectRatioIcon ratio={option.ratio} />
                    <span className="max-[360px]:sr-only">{option.id}</span>
                  </PromptInputButton>
                )
              })}
            </div>

            {!advancedOpen ? modelSelector : null}

            <PromptInputButton
              type="button"
              aria-expanded={advancedOpen}
              className="gap-1.5 px-2.5 text-xs active:scale-[0.97]"
              disabled={isPending}
              onClick={() => setAdvancedOpen(open => !open)}
              tooltip="Tune generation"
            >
              <SlidersHorizontalIcon className="size-3.5" />
              Tune
              <ChevronDownIcon
                className={cn('size-3.5 transition-transform', advancedOpen && 'rotate-180')}
              />
            </PromptInputButton>
          </PromptInputTools>

          <div className="flex items-center gap-2">
            {selectedModel ? (
              <span className="hidden text-[11px] tabular-nums text-muted-foreground sm:inline">
                {formatModelCost(selectedModel)}
              </span>
            ) : null}
            <PromptInputSubmit
              className="h-8 gap-1.5 rounded-lg px-3.5 text-[13px] font-medium active:scale-[0.97]"
              disabled={!selectedModel || isPending}
              size="sm"
              status={isPending ? 'submitted' : undefined}
            >
              <span className="hidden sm:inline">Generate</span>
              <kbd className="ml-0.5 hidden rounded border border-border/60 bg-background/50 px-1 py-px text-[10px] font-normal text-muted-foreground lg:inline">
                ⌘↵
              </kbd>
            </PromptInputSubmit>
          </div>
        </PromptInputFooter>
      </PromptInput>

      <div className="mt-2.5 space-y-2.5">
        <p className="text-[12px] text-muted-foreground/80">
          <kbd className="rounded border border-border/60 bg-muted/40 px-1 py-px font-sans text-[11px] text-muted-foreground">
            /
          </kbd>{' '}
          to focus ·{' '}
          <kbd className="rounded border border-border/60 bg-muted/40 px-1 py-px font-sans text-[11px] text-muted-foreground">
            ⌘↵
          </kbd>{' '}
          to generate
        </p>
        <PromptAnatomy />
      </div>
    </div>
  )
}

const ImageGenerationPromptInput = ({ models }: { models: Model[] }) => {
  if (models.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/20 px-6 py-10 text-center">
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
