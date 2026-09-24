'use client'

import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputController,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { AttachedMediaThumb, type AttachedMedia } from '@/components/files/attach-images-dialog'
import { ModelLogo } from '@/components/icons/model-logo'
import { StudioAnimatedPlaceholder } from '@/components/studio/prompt/studio-animated-placeholder'
import type { InfluencerPickerMediaType } from '@/components/studio/influencers/influencer-picker-dialog'
import {
  StudioAttachMenu,
  attachmentChipLabel,
  type StudioAttachSource,
} from '@/components/studio/prompt/studio-attach-menu'
import {
  StudioComposerModelSelector,
  type StudioModelPickerVariant,
} from '@/components/studio/prompt/studio-composer-model-selector'
import {
  STUDIO_COMPOSER_SEND_BUTTON_CLASS,
  STUDIO_PROMPT_COMPOSER_MAX_WIDTH_CLASS,
  STUDIO_TOOL_BUTTON_CLASS,
  STUDIO_TOOL_CHEVRON_CLASS,
} from '@/components/studio/prompt/studio-composer-surface'
import { StudioInputActionTooltip } from '@/components/studio/prompt/studio-input-action-tooltip'
import {
  PROMPT_FIELD_STYLE,
  PROMPT_FIELD_STYLE_COMPACT,
  StudioPromptHighlight,
} from '@/components/studio/prompt/studio-prompt-highlight'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Kbd } from '@/components/ui/kbd'
import {
  getActiveMention,
  insertTagAtCursor,
  mentionMatchesAttachment,
  referenceTag,
  referenceTagTone,
  replaceMentionWithTag,
  taggedAttachmentIndices,
} from '@/lib/studio/prompt/reference-tags'
import {
  attachedMediaFromStudioDrag,
  isStudioImageDrag,
  readStudioImageDrag,
} from '@/lib/studio/prompt/studio-image-drag'
import { cn } from '@/lib/utils'
import { formatCredits, formatModelCost } from '@/utils/format'
import { ContextSupport, CostUnit, type Model } from '@socialista/types'
import { ChevronDownIcon, ChevronUpIcon, CoinsIcon, ImagesIcon, SparklesIcon } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react'
import { toast } from 'sonner'

export type { StudioAttachSource }

function StudioBatchCountMenu({
  value,
  min,
  max,
  onChange,
  disabled,
  label,
  auto = false,
  onAutoChange,
  unitSingular = 'image',
  unitPlural = 'images',
}: {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  disabled?: boolean
  label?: string
  auto?: boolean
  onAutoChange?: () => void
  unitSingular?: string
  unitPlural?: string
}) {
  const options = useMemo(() => {
    const items: number[] = []
    for (let n = min; n <= max; n += 1) items.push(n)
    return items
  }, [min, max])

  const menuValue = auto ? 'auto' : String(value)
  const tooltip =
    label ?? (auto ? 'Slide count — automatic' : `Generate ${value} ${value === 1 ? unitSingular : unitPlural}`)

  return (
    <DropdownMenu>
      <StudioInputActionTooltip label={tooltip}>
        <DropdownMenuTrigger asChild>
          <PromptInputButton
            aria-label={tooltip}
            className={STUDIO_TOOL_BUTTON_CLASS}
            disabled={disabled}
            size="xs"
            type="button"
          >
            <ImagesIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
            <span className="text-[12px] font-medium leading-none tracking-[-0.015em] tabular-nums">
              {auto ? 'Auto' : `×${value}`}
            </span>
            <ChevronDownIcon className={STUDIO_TOOL_CHEVRON_CLASS} />
          </PromptInputButton>
        </DropdownMenuTrigger>
      </StudioInputActionTooltip>
      <DropdownMenuContent align="start" className="min-w-40 w-40">
        <DropdownMenuRadioGroup
          value={menuValue}
          onValueChange={next => {
            if (next === 'auto') {
              onAutoChange?.()
              return
            }
            onChange(Number(next))
          }}
        >
          {onAutoChange ? (
            <DropdownMenuRadioItem className="rounded-lg" value="auto">
              <span className="text-[13px] font-medium tracking-[-0.015em]">Auto</span>
              <DropdownMenuShortcut>Prompt</DropdownMenuShortcut>
            </DropdownMenuRadioItem>
          ) : null}
          {options.map(n => (
            <DropdownMenuRadioItem key={n} className="rounded-lg" value={String(n)}>
              <span className="text-[13px] font-medium tracking-[-0.015em] tabular-nums">
                {n} {n === 1 ? unitSingular : unitPlural}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const PROMPT_TEXT_METRICS =
  'box-border w-full whitespace-pre-wrap break-words px-4 pt-3 pb-10 font-normal leading-[25px]'

const PROMPT_TEXT_METRICS_COMPACT =
  'box-border w-full whitespace-pre-wrap break-words px-3 pt-2 pb-7 text-[13px] font-normal leading-[22px]'

const PROMPT_TEXT_METRICS_WITH_ATTACHMENTS =
  'box-border w-full whitespace-pre-wrap break-words px-4 pt-1 pb-10 font-normal leading-[25px]'

const PROMPT_TEXT_METRICS_COMPACT_WITH_ATTACHMENTS =
  'box-border w-full whitespace-pre-wrap break-words px-3 pt-0.5 pb-7 text-[13px] font-normal leading-[22px]'

const PROMPT_TEXTAREA_CLASS = cn(PROMPT_TEXT_METRICS, 'block min-h-32 max-h-48 overflow-y-auto')

const PROMPT_TEXTAREA_CLASS_COMPACT = cn(PROMPT_TEXT_METRICS_COMPACT, 'block min-h-[4.5rem] max-h-28 overflow-y-auto')

function StudioAttachmentChip({
  file,
  index,
  tagged,
  picking,
  dimmed,
  selectable,
  disabled,
  onRemove,
  onInsert,
  onHover,
}: {
  file: AttachedMedia
  index: number
  tagged?: boolean
  picking?: boolean
  dimmed?: boolean
  selectable?: boolean
  disabled?: boolean
  onRemove?: (id: string) => void
  onInsert: (index: number) => void
  onHover: (index: number | null) => void
}) {
  const tag = referenceTag(index)
  const tone = referenceTagTone(index)

  return (
    <div
      id={`studio-reference-${index}`}
      role={selectable ? 'option' : 'listitem'}
      aria-selected={selectable ? picking : undefined}
      aria-label={`Insert ${tag}`}
      className={cn(
        'flex w-12 shrink-0 cursor-pointer flex-col items-center gap-1 transition-opacity duration-150',
        'focus-visible:outline-none',
        dimmed && 'opacity-35',
        disabled && 'pointer-events-none opacity-50',
      )}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onInsert(index)}
    >
      <div
        className={cn(
          'rounded-[0.875rem] transition-transform duration-150 active:scale-[0.97]',
          picking && 'scale-[1.04]',
        )}
      >
        <AttachedMediaThumb
          file={file}
          size="sm"
          disabled={disabled}
          onRemove={onRemove}
          className={cn(
            'rounded-[0.875rem] transition-[box-shadow,ring-color] duration-150',
            tagged || picking ? cn('ring-2', tone.chip) : 'ring-border/45 hover:ring-border/70',
          )}
        />
      </div>
      <span
        className={cn(
          'max-w-14 truncate text-center text-[10px] font-semibold leading-none tracking-[-0.02em]',
          tagged || picking ? tone.caption : 'text-muted-foreground/70',
        )}
      >
        {tag}
      </span>
    </div>
  )
}

export type StudioPromptComposerCount = {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  label?: string
  auto?: boolean
  onAutoChange?: () => void
}

export type StudioPromptComposerProps = {
  models: Model[]
  selectedModelId: string
  onSelectedModelChange: (id: string) => void
  attachments: AttachedMedia[]
  onAttachmentsChange: (files: AttachedMedia[]) => void
  attachSources: readonly StudioAttachSource[]
  influencerMediaType?: InfluencerPickerMediaType
  attachmentsLocked?: boolean
  maxAttachments?: number
  minAttachments?: number
  workspaceId?: string
  attachClassName?: string
  count?: StudioPromptComposerCount
  costMultiplier?: number
  placeholder?: string
  animatedPlaceholderWords?: string[]
  disabled?: boolean
  pending?: boolean
  onSubmit: (message: PromptInputMessage) => void
  tools?: ReactNode
  composerHeader?: ReactNode
  composerHeaderClassName?: string
  submitLabel?: string
  canSubmit?: boolean
  requirePrompt?: boolean
  hideModelSelector?: boolean
  modelPickerVariant?: StudioModelPickerVariant
  modelPickerHeading?: string
  modelLocked?: boolean
  hideCost?: boolean
  submitDisabled?: boolean
  allowEmptyModels?: boolean
  highlighted?: boolean
  textareaRef?: (node: HTMLTextAreaElement | null) => void
  onPromptChange?: () => void
  maxLength?: number
  className?: string
  surfaceClassName?: string
  composerRef?: Ref<HTMLDivElement>
  emptyTitle?: string
  emptyDescription?: string
  submitTitle?: string
  footerClassName?: string
  submitAppearance?: 'labeled' | 'send'
  submitClassName?: string
  compact?: boolean
  embedded?: boolean
}

export function StudioPromptComposer({
  models,
  selectedModelId,
  onSelectedModelChange,
  attachments,
  onAttachmentsChange,
  attachSources,
  influencerMediaType,
  attachmentsLocked = false,
  maxAttachments = 3,
  minAttachments = 0,
  workspaceId,
  attachClassName,
  count,
  costMultiplier,
  placeholder = 'Describe what to generate…',
  animatedPlaceholderWords,
  disabled,
  pending,
  onSubmit,
  tools,
  composerHeader,
  composerHeaderClassName,
  submitLabel = 'Generate',
  canSubmit: canSubmitProp,
  requirePrompt = true,
  hideModelSelector = false,
  modelPickerVariant = 'default',
  modelPickerHeading = 'Models',
  modelLocked = false,
  hideCost = false,
  submitDisabled = false,
  allowEmptyModels = false,
  highlighted,
  textareaRef: textareaRefProp,
  onPromptChange,
  maxLength,
  className,
  surfaceClassName,
  composerRef,
  emptyTitle = 'No image models yet',
  emptyDescription = 'Add a text-to-image model in the manager to start creating.',
  submitTitle,
  footerClassName,
  submitAppearance = 'send',
  submitClassName,
  compact = false,
  embedded = false,
}: StudioPromptComposerProps) {
  const { textInput } = usePromptInputController()
  const [cursor, setCursor] = useState(0)
  const [mentionOptionIndex, setMentionOptionIndex] = useState(0)
  const [suppressedMentionStart, setSuppressedMentionStart] = useState<number | null>(null)
  const [hoveredAttachmentIndex, setHoveredAttachmentIndex] = useState<number | null>(null)
  const innerTextareaRef = useRef<HTMLTextAreaElement>(null)
  const dropDepthRef = useRef(0)
  const [dropActive, setDropActive] = useState(false)
  const acceptsImageDrop = attachSources.length > 0 && !attachmentsLocked && !disabled && !pending

  const setTextareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerTextareaRef.current = node
      textareaRefProp?.(node)
    },
    [textareaRefProp],
  )

  const selectedModel = useMemo(
    () => models.find(model => model._id === selectedModelId) ?? models[0],
    [models, selectedModelId],
  )

  const hasPrompt = textInput.value.trim().length > 0
  const meetsAttachmentRequirement = attachments.length >= minAttachments
  const meetsPromptRequirement = !requirePrompt || hasPrompt
  const ready =
    canSubmitProp === undefined
      ? meetsPromptRequirement && meetsAttachmentRequirement
      : canSubmitProp || (meetsPromptRequirement && meetsAttachmentRequirement)
  const canSubmit =
    ready && (hideModelSelector || allowEmptyModels || !!selectedModel) && !disabled && !pending && !submitDisabled
  const attachDisabled =
    disabled || pending || (!hideModelSelector && !selectedModel?.contextSupports?.includes(ContextSupport.IMAGE))
  const billedUnits =
    selectedModel?.costUnit === CostUnit.PER_SECOND ? (costMultiplier ?? count?.value ?? 1) : (count?.value ?? 1)
  const costLabel =
    hideCost || !selectedModel
      ? null
      : selectedModel.costUnit === CostUnit.PER_SECOND && costMultiplier != null
        ? `${formatCredits(selectedModel.cost * costMultiplier)} credits`
        : formatModelCost(selectedModel.cost * billedUnits, selectedModel.costUnit)

  const taggedIndexes = taggedAttachmentIndices(textInput.value, attachments.length)
  const activeMention = getActiveMention(textInput.value, cursor)
  const mentionOpen = activeMention !== null && activeMention.start !== suppressedMentionStart
  const filteredMentionIndexes = attachments.flatMap((file, index) =>
    activeMention && mentionMatchesAttachment(activeMention.query, index, attachmentChipLabel(file)) ? [index] : [],
  )
  const selectedMentionIndex =
    filteredMentionIndexes.length === 0 ? 0 : Math.min(mentionOptionIndex, filteredMentionIndexes.length - 1)

  const focusPrompt = useCallback(() => {
    innerTextareaRef.current?.focus()
  }, [])

  const syncCursor = useCallback((el: HTMLTextAreaElement) => {
    setCursor(el.selectionStart)
  }, [])

  const insertReference = useCallback(
    (index: number, mentionStart?: number) => {
      const el = innerTextareaRef.current
      const current = textInput.value
      const tag = referenceTag(index)
      const selectionStart = el?.selectionStart ?? current.length
      const selectionEnd = el?.selectionEnd ?? current.length
      const result =
        mentionStart === undefined
          ? insertTagAtCursor(current, selectionStart, selectionEnd, tag)
          : replaceMentionWithTag(current, mentionStart, selectionStart, tag)

      textInput.setInput(result.next)
      onPromptChange?.()
      setSuppressedMentionStart(null)
      setMentionOptionIndex(0)

      requestAnimationFrame(() => {
        const node = innerTextareaRef.current
        if (!node) return
        node.focus()
        node.setSelectionRange(result.cursor, result.cursor)
        setCursor(result.cursor)
      })
    },
    [onPromptChange, textInput],
  )

  const clearDropState = useCallback(() => {
    dropDepthRef.current = 0
    setDropActive(false)
  }, [])

  const handleStudioImageDragOver = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      if (!acceptsImageDrop || !isStudioImageDrag(event.dataTransfer.types)) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    },
    [acceptsImageDrop],
  )

  const handleStudioImageDragEnter = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      if (!acceptsImageDrop || !isStudioImageDrag(event.dataTransfer.types)) return
      event.preventDefault()
      dropDepthRef.current += 1
      setDropActive(true)
    },
    [acceptsImageDrop],
  )

  const handleStudioImageDragLeave = useCallback(() => {
    dropDepthRef.current = Math.max(0, dropDepthRef.current - 1)
    if (dropDepthRef.current === 0) setDropActive(false)
  }, [])

  const handleStudioImageDrop = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      const payload = readStudioImageDrag(event.dataTransfer)
      clearDropState()
      if (!payload || !acceptsImageDrop) return
      event.preventDefault()
      event.stopPropagation()

      if (attachments.some(item => item.url === payload.url || item.id === `drag-${payload.url}`)) {
        toast.error('That reference is already attached')
        return
      }
      if (attachments.length >= maxAttachments) {
        toast.error(`You can attach up to ${maxAttachments} references`)
        return
      }

      onAttachmentsChange([...attachments, attachedMediaFromStudioDrag(payload)])
    },
    [acceptsImageDrop, attachments, clearDropState, maxAttachments, onAttachmentsChange],
  )

  const handlePromptChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      syncCursor(event.currentTarget)
      setSuppressedMentionStart(null)
      setMentionOptionIndex(0)
      onPromptChange?.()
    },
    [onPromptChange, syncCursor],
  )

  const handlePromptKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        event.currentTarget.form?.requestSubmit()
        return
      }

      if (!mentionOpen) return

      if (event.key === 'Escape') {
        event.preventDefault()
        setSuppressedMentionStart(activeMention?.start ?? null)
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (filteredMentionIndexes.length === 0) return
        setMentionOptionIndex(current => (current + 1) % filteredMentionIndexes.length)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        if (filteredMentionIndexes.length === 0) return
        setMentionOptionIndex(current => (current - 1 + filteredMentionIndexes.length) % filteredMentionIndexes.length)
        return
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault()
        const attachmentIndex = filteredMentionIndexes[selectedMentionIndex]
        if (attachmentIndex === undefined || !activeMention) return
        insertReference(attachmentIndex, activeMention.start)
      }
    },
    [activeMention, filteredMentionIndexes, insertReference, mentionOpen, selectedMentionIndex],
  )

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

  if (models.length === 0 && !allowEmptyModels) {
    return (
      <div className="rounded-xl border border-dashed border-black/12 bg-black/[0.02] px-6 py-14 text-left dark:border-white/12 dark:bg-white/[0.02]">
        <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-black/[0.04] ring-1 ring-black/10 dark:bg-white/[0.04] dark:ring-white/12">
          <SparklesIcon className="size-4 text-black/56 dark:text-white/56" />
        </div>
        <p className="text-[15px] font-medium tracking-[-0.02em] text-foreground">{emptyTitle}</p>
        <p className="mt-2 max-w-sm text-[13px] leading-[1.55] tracking-[-0.01em] text-black/56 dark:text-white/56">
          {emptyDescription}
        </p>
      </div>
    )
  }

  const modelSelector =
    !hideModelSelector && selectedModel ? (
      modelLocked ? (
        <StudioInputActionTooltip label={selectedModel.name}>
          <span className="inline-flex">
            <PromptInputButton
              aria-label={selectedModel.name}
              className={cn(STUDIO_TOOL_BUTTON_CLASS, 'cursor-default [&_svg]:text-foreground/70')}
              size="xs"
              tabIndex={-1}
              type="button"
            >
              <ModelLogo className="size-3.5 shrink-0" model={selectedModel} size={14} />
              <span className="text-[12px] font-medium leading-none tracking-[-0.015em]">{selectedModel.name}</span>
            </PromptInputButton>
          </span>
        </StudioInputActionTooltip>
      ) : (
        <StudioComposerModelSelector
          disabled={disabled || pending}
          heading={modelPickerHeading}
          models={models}
          onSelectedModelChange={onSelectedModelChange}
          selectedModelId={selectedModelId}
          tooltip="Choose generation model"
          variant={modelPickerVariant}
        />
      )
    ) : null

  const hasAttachmentStrip = attachments.length > 0
  const textMetrics = compact
    ? hasAttachmentStrip
      ? PROMPT_TEXT_METRICS_COMPACT_WITH_ATTACHMENTS
      : PROMPT_TEXT_METRICS_COMPACT
    : hasAttachmentStrip
      ? PROMPT_TEXT_METRICS_WITH_ATTACHMENTS
      : PROMPT_TEXT_METRICS
  const textareaClass = compact ? PROMPT_TEXTAREA_CLASS_COMPACT : PROMPT_TEXTAREA_CLASS
  const showAnimatedPlaceholder = Boolean(animatedPlaceholderWords?.length) && textInput.value.length === 0

  const attachmentStrip =
    attachments.length > 0 ? (
      <div
        id="studio-reference-attachments"
        className={cn(
          'flex w-full items-end gap-2 overflow-x-auto scrollbar-none',
          embedded
            ? 'px-3 pt-3 pb-0.5 sm:px-6 sm:pt-6'
            : compact
              ? 'px-2.5 pt-2.5 pb-0 sm:px-3'
              : 'px-3.5 pt-3.5 pb-0 sm:px-4',
          mentionOpen && 'bg-muted/8',
        )}
        role={mentionOpen ? 'listbox' : 'list'}
        aria-label="Reference images"
      >
        {attachments.map((file, index) => (
          <StudioAttachmentChip
            key={file.id}
            file={file}
            index={index}
            tagged={taggedIndexes.has(index)}
            picking={mentionOpen && filteredMentionIndexes[selectedMentionIndex] === index}
            dimmed={mentionOpen && !filteredMentionIndexes.includes(index)}
            selectable={mentionOpen}
            disabled={disabled || pending}
            onInsert={attachmentIndex => insertReference(attachmentIndex, activeMention?.start)}
            onHover={index => {
              setHoveredAttachmentIndex(index)
              if (index === null || !mentionOpen) return
              const optionIndex = filteredMentionIndexes.indexOf(index)
              if (optionIndex >= 0) setMentionOptionIndex(optionIndex)
            }}
            onRemove={
              attachmentsLocked
                ? undefined
                : id => onAttachmentsChange(attachments.filter(item => item.id !== id))
            }
          />
        ))}
      </div>
    ) : null

  return (
    <div
      ref={composerRef}
      onDragEnter={handleStudioImageDragEnter}
      onDragLeave={handleStudioImageDragLeave}
      onDragOver={handleStudioImageDragOver}
      onDrop={handleStudioImageDrop}
      className={cn(
        'relative w-full scroll-mt-10 transition-[transform,opacity] duration-300',
        !embedded && cn('mx-auto', STUDIO_PROMPT_COMPOSER_MAX_WIDTH_CLASS),
        highlighted && 'animate-in fade-in-0 duration-300',
        className,
      )}
    >
      <PromptInput
        className={cn(
          !embedded &&
            cn(
              'rounded-2xl p-3 border-black/10 bg-background transition-[border-color,box-shadow,ring-color] duration-200',
              'has-[[data-slot=input-group-control]:focus-visible]:border-black/18',
              'has-[[data-slot=input-group-control]:focus-visible]:ring-2',
              'has-[[data-slot=input-group-control]:focus-visible]:ring-ring/6',
              'dark:border-white/12',
              'dark:has-[[data-slot=input-group-control]:focus-visible]:border-white/20',
            ),
          embedded && 'rounded-none p-2 border-0 bg-transparent shadow-none',
          highlighted && !embedded && 'border-foreground/15 ring-2 ring-foreground/8',
          dropActive && !embedded && 'border-foreground/25 ring-2 ring-foreground/12',
          surfaceClassName,
        )}
        onSubmit={onSubmit}
      >
        {composerHeader ? (
          <div
            className={cn(
              'w-full min-w-0 self-stretch overflow-hidden border-b border-border/35 bg-muted/8 py-2',
              composerHeaderClassName,
            )}
          >
            {composerHeader}
          </div>
        ) : null}

        <PromptInputBody>
          {attachmentStrip}
          <div className="relative w-full min-w-0 self-stretch">
            <StudioPromptHighlight
              value={textInput.value}
              attachmentCount={attachments.length}
              emphasizedIndex={hoveredAttachmentIndex}
              textareaRef={innerTextareaRef}
              className={textMetrics}
              style={compact ? PROMPT_FIELD_STYLE_COMPACT : PROMPT_FIELD_STYLE}
            />
            {showAnimatedPlaceholder ? (
              <StudioAnimatedPlaceholder words={animatedPlaceholderWords!} compact={compact} />
            ) : null}
            <PromptInputTextarea
              ref={setTextareaRef}
              style={compact ? PROMPT_FIELD_STYLE_COMPACT : PROMPT_FIELD_STYLE}
              className={cn(
                textareaClass,
                'relative z-10 bg-transparent caret-foreground selection:bg-foreground/15',
                'placeholder:text-muted-foreground/45 placeholder:transition-opacity placeholder:duration-300',
                'shadow-none ring-0 focus:outline-none focus:ring-0 focus-visible:ring-0',
                'dark:bg-transparent',
              )}
              disabled={disabled || pending}
              placeholder={showAnimatedPlaceholder ? '' : placeholder}
              maxLength={maxLength}
              aria-autocomplete="list"
              aria-expanded={mentionOpen}
              aria-controls={mentionOpen ? 'studio-reference-attachments' : undefined}
              aria-activedescendant={
                mentionOpen && filteredMentionIndexes[selectedMentionIndex] != null
                  ? `studio-reference-${filteredMentionIndexes[selectedMentionIndex]}`
                  : undefined
              }
              onChange={handlePromptChange}
              onFocus={event => syncCursor(event.currentTarget)}
              onClick={event => syncCursor(event.currentTarget)}
              onKeyUp={event => syncCursor(event.currentTarget)}
              onSelect={event => syncCursor(event.currentTarget as HTMLTextAreaElement)}
              onKeyDown={handlePromptKeyDown}
            />
            {hasPrompt && maxLength == null ? (
              <span
                aria-hidden
                className={cn(
                  'pointer-events-none absolute z-10 text-[10px] tabular-nums tracking-[-0.01em] text-muted-foreground/35',
                  compact ? 'right-3 bottom-2' : 'right-4 bottom-3',
                )}
              >
                {textInput.value.length.toLocaleString()}
              </span>
            ) : null}
          </div>
        </PromptInputBody>

        {mentionOpen && attachments.length === 0 ? (
          <div
            id="studio-reference-attachments"
            className={cn(
              'border-t border-border/35 bg-muted/12 py-2.5 text-[12px] leading-snug tracking-[-0.01em] text-muted-foreground',
              embedded ? 'px-3 sm:px-3.5' : 'px-3.5',
            )}
            role="status"
          >
            Attach a reference first, then tag it with <span className="font-medium text-foreground/80">@image1</span>.
          </div>
        ) : null}

        <PromptInputFooter
          className={cn(
            compact
              ? 'border-t-0 bg-transparent px-2.5 py-2 sm:px-3'
              : 'border-t-0 bg-transparent px-3 py-2.5 sm:px-3.5',
            footerClassName,
          )}
        >
          <PromptInputTools className="min-w-0 flex-nowrap items-center gap-0.5 overflow-x-auto scrollbar-none">
            {attachSources.length > 0 ? (
              <>
                <StudioAttachMenu
                  sources={attachSources}
                  attachments={attachments}
                  onAttachmentsChange={onAttachmentsChange}
                  maxAttachments={maxAttachments}
                  workspaceId={workspaceId}
                  influencerMediaType={influencerMediaType}
                  disabled={attachDisabled}
                  className={attachClassName}
                  disabledReason={
                    selectedModel?.contextSupports?.includes(ContextSupport.IMAGE)
                      ? 'Add references'
                      : 'This model does not support image references'
                  }
                />
                <span aria-hidden className="mx-0.5 hidden h-4 w-px shrink-0 bg-black/10 dark:bg-white/12 sm:block" />
              </>
            ) : null}

            {tools}

            {count ? (
              <StudioBatchCountMenu
                value={count.value}
                min={count.min}
                max={count.max}
                onChange={count.onChange}
                disabled={disabled || pending}
                label={count.label}
                auto={count.auto}
                onAutoChange={count.onAutoChange}
                unitSingular={
                  count.label?.toLowerCase().includes('slide')
                    ? 'slide'
                    : count.label?.toLowerCase().includes('video')
                      ? 'video'
                      : 'image'
                }
                unitPlural={
                  count.label?.toLowerCase().includes('slide')
                    ? 'slides'
                    : count.label?.toLowerCase().includes('video')
                      ? 'videos'
                      : 'images'
                }
              />
            ) : null}

            {modelSelector}
          </PromptInputTools>

          <div className="flex shrink-0 items-center gap-2">
            {costLabel ? (
              <span className="flex items-center gap-1 text-[11px] tabular-nums tracking-[-0.015em] text-black/40 dark:text-white/40">
                <CoinsIcon className="size-3" strokeWidth={1.75} />
                {costLabel}
              </span>
            ) : null}
            <StudioInputActionTooltip label={submitTitle ?? submitLabel} shortcut={canSubmit ? '⌘↵' : undefined}>
              <PromptInputSubmit
                aria-label={submitTitle ?? submitLabel}
                variant={submitAppearance === 'send' ? 'ghost' : 'default'}
                className={cn(
                  'transition-[transform,opacity] duration-150 active:scale-[0.96] motion-reduce:active:scale-100',
                  submitAppearance === 'send'
                    ? STUDIO_COMPOSER_SEND_BUTTON_CLASS
                    : 'rounded-xl px-2 text-[12px] font-medium tracking-[-0.015em]',
                  submitAppearance !== 'send' && !canSubmit && 'opacity-40',
                  submitClassName,
                )}
                disabled={!canSubmit}
                size={submitAppearance === 'send' ? 'icon-xs' : 'xs'}
                status={pending ? 'submitted' : undefined}
              >
                {submitAppearance === 'send' ? (
                  pending ? null : (
                    <ChevronUpIcon className="size-3.5 text-background" strokeWidth={2.5} />
                  )
                ) : (
                  <>
                    <span>{submitLabel}</span>
                    {!submitClassName ? (
                      <Kbd className="ml-0.5 hidden h-5 min-w-5 border-primary-foreground/15 bg-primary-foreground/10 px-1 text-[10px] font-normal text-primary-foreground/85 lg:inline-flex">
                        ⌘↵
                      </Kbd>
                    ) : null}
                  </>
                )}
              </PromptInputSubmit>
            </StudioInputActionTooltip>
          </div>
        </PromptInputFooter>
      </PromptInput>
      {dropActive ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-background/80 text-[13px] font-medium tracking-tight">
          Drop to attach
        </div>
      ) : null}
    </div>
  )
}
