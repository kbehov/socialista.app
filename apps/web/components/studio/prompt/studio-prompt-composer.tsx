"use client";

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
} from "@/components/ai-elements/model-selector";
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
} from "@/components/ai-elements/prompt-input";
import {
  AttachedMediaThumb,
  type AttachedMedia,
} from "@/components/files/attach-images-dialog";
import { ModelLogo } from "@/components/icons/model-logo";
import {
  StudioAttachMenu,
  attachmentChipLabel,
  type StudioAttachSource,
} from "@/components/studio/prompt/studio-attach-menu";
import { StudioInputActionTooltip } from "@/components/studio/prompt/studio-input-action-tooltip";
import { StudioPromptHighlight, PROMPT_FIELD_STYLE } from "@/components/studio/prompt/studio-prompt-highlight";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import {
  getActiveMention,
  insertTagAtCursor,
  mentionMatchesAttachment,
  referenceTag,
  referenceTagTone,
  replaceMentionWithTag,
  taggedAttachmentIndices,
} from "@/lib/studio/prompt/reference-tags";
import { getModelCompanyName } from "@/lib/model-company";
import { cn } from "@/lib/utils";
import { formatModelCost } from "@/utils/format";
import { ContextSupport, type Model } from "@socialista/types";
import {
  CheckIcon,
  ChevronDownIcon,
  FileIcon,
  ImageIcon,
  MinusIcon,
  MusicIcon,
  PlusIcon,
  SparklesIcon,
  TypeIcon,
  VideoIcon,
  type LucideIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";

export type { StudioAttachSource };

type ModelHighlight = "cheapest" | "newest" | "mostUsed";

const MODEL_HIGHLIGHT_CONFIG = {
  cheapest: {
    label: "Cheapest",
    className: "border-success/20 bg-success/10 text-success",
  },
  newest: {
    label: "New",
    className: "border-info/20 bg-info/10 text-info",
  },
  mostUsed: {
    label: "Popular",
    className: "border-warning/20 bg-warning/10 text-warning-foreground",
  },
} as const satisfies Record<
  ModelHighlight,
  { label: string; className: string }
>;

const SUPPORT_LABELS: Record<
  ContextSupport,
  { label: string; icon: LucideIcon }
> = {
  [ContextSupport.IMAGE]: { label: "Image", icon: ImageIcon },
  [ContextSupport.VIDEO]: { label: "Video", icon: VideoIcon },
  [ContextSupport.AUDIO]: { label: "Audio", icon: MusicIcon },
  [ContextSupport.TEXT]: { label: "Text", icon: TypeIcon },
  [ContextSupport.FILE]: { label: "File", icon: FileIcon },
};

const TOOL_BUTTON_CLASS = cn(
  "h-7 gap-1.5 rounded-lg border px-1.5 pr-2",
  "border-black/10 bg-black/[0.02] transition-[border-color,background-color] duration-150",
  "hover:border-black/18 hover:bg-black/[0.04]",
  "dark:border-white/12 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.06]",
  "active:scale-[0.97]",
);

function getModelUsageCount(model: Model): number {
  if ("usageCount" in model && typeof model.usageCount === "number") {
    return model.usageCount;
  }
  return 0;
}

function buildModelHighlights(models: Model[]): Map<string, ModelHighlight[]> {
  const highlights = new Map<string, ModelHighlight[]>();
  if (models.length === 0) return highlights;

  const newestId = [...models].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0]?._id;
  const cheapestId = [...models].sort((a, b) => a.cost - b.cost)[0]?._id;
  const mostUsedModel = [...models].sort(
    (a, b) => getModelUsageCount(b) - getModelUsageCount(a),
  )[0];
  const mostUsedId =
    mostUsedModel && getModelUsageCount(mostUsedModel) > 0
      ? mostUsedModel._id
      : undefined;

  for (const model of models) {
    const modelHighlights: ModelHighlight[] = [];
    if (model._id === newestId) modelHighlights.push("newest");
    if (model._id === cheapestId) modelHighlights.push("cheapest");
    if (mostUsedId && model._id === mostUsedId)
      modelHighlights.push("mostUsed");
    if (modelHighlights.length > 0) highlights.set(model._id, modelHighlights);
  }

  return highlights;
}

function ModelHighlightBadge({ highlight }: { highlight: ModelHighlight }) {
  const config = MODEL_HIGHLIGHT_CONFIG[highlight];

  return (
    <Badge
      className={cn(
        config.className,
        "h-4 shrink-0 rounded-full border-0 px-1.5 py-0 text-[9px] font-medium leading-none tracking-[-0.01em]",
      )}
    >
      {config.label}
    </Badge>
  );
}

function StudioCountStepper({
  value,
  min,
  max,
  onChange,
  disabled,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <div
      className="flex h-7 items-center gap-0.5 rounded-xl bg-muted/30 p-0.5 ring-1 ring-border/30"
      role="group"
      aria-label={label ?? "Number of images"}
    >
      <PromptInputButton
        aria-label="Decrease"
        className="size-6 rounded-lg text-muted-foreground hover:text-foreground"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        tooltip="Generate fewer images"
        type="button"
      >
        <MinusIcon className="size-3" strokeWidth={2.25} />
      </PromptInputButton>
      <span className="min-w-5 text-center text-xs font-medium tabular-nums tracking-[-0.015em]">
        {value}
      </span>
      <PromptInputButton
        aria-label="Increase"
        className="size-6 rounded-lg text-muted-foreground hover:text-foreground"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        tooltip="Generate more images"
        type="button"
      >
        <PlusIcon className="size-3" strokeWidth={2.25} />
      </PromptInputButton>
    </div>
  );
}

const PROMPT_TEXT_METRICS =
  "box-border w-full whitespace-pre-wrap break-words px-4 pt-4 pb-10 font-normal leading-[25px]";

const PROMPT_TEXTAREA_CLASS = cn(
  PROMPT_TEXT_METRICS,
  "block min-h-32 max-h-48 overflow-y-auto",
);

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
  file: AttachedMedia;
  index: number;
  tagged?: boolean;
  picking?: boolean;
  dimmed?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  onRemove: (id: string) => void;
  onInsert: (index: number) => void;
  onHover: (index: number | null) => void;
}) {
  const tag = referenceTag(index);
  const tone = referenceTagTone(index);

  return (
    <div
      id={`studio-reference-${index}`}
      role={selectable ? "option" : "listitem"}
      aria-selected={selectable ? picking : undefined}
      aria-label={`Insert ${tag}`}
      className={cn(
        "flex w-12 shrink-0 cursor-pointer flex-col items-center gap-1 transition-opacity duration-150",
        "focus-visible:outline-none",
        dimmed && "opacity-35",
        disabled && "pointer-events-none opacity-50",
      )}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onInsert(index)}
    >
      <div
        className={cn(
          "rounded-[0.875rem] transition-transform duration-150 active:scale-[0.97]",
          picking && "scale-[1.04]",
        )}
      >
        <AttachedMediaThumb
          file={file}
          size="sm"
          disabled={disabled}
          onRemove={onRemove}
          className={cn(
            "rounded-[0.875rem] transition-[box-shadow,ring-color] duration-150",
            tagged || picking
              ? cn("ring-2", tone.chip)
              : "ring-border/45 hover:ring-border/70",
          )}
        />
      </div>
      <span
        className={cn(
          "max-w-14 truncate text-center text-[10px] font-semibold leading-none tracking-[-0.02em]",
          tagged || picking ? tone.caption : "text-muted-foreground/70",
        )}
      >
        {tag}
      </span>
    </div>
  );
}

export type StudioPromptComposerCount = {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
};

export type StudioPromptComposerProps = {
  models: Model[];
  selectedModelId: string;
  onSelectedModelChange: (id: string) => void;
  attachments: AttachedMedia[];
  onAttachmentsChange: (files: AttachedMedia[]) => void;
  attachSources: readonly StudioAttachSource[];
  maxAttachments?: number;
  minAttachments?: number;
  workspaceId?: string;
  count?: StudioPromptComposerCount;
  placeholder?: string;
  disabled?: boolean;
  pending?: boolean;
  onSubmit: (message: PromptInputMessage) => void;
  tools?: ReactNode;
  composerHeader?: ReactNode;
  submitLabel?: string;
  canSubmit?: boolean;
  requirePrompt?: boolean;
  hideModelSelector?: boolean;
  allowEmptyModels?: boolean;
  highlighted?: boolean;
  textareaRef?: (node: HTMLTextAreaElement | null) => void;
  onPromptChange?: () => void;
  className?: string;
  surfaceClassName?: string;
  composerRef?: Ref<HTMLDivElement>;
  emptyTitle?: string;
  emptyDescription?: string;
  submitTitle?: string;
};

export function StudioPromptComposer({
  models,
  selectedModelId,
  onSelectedModelChange,
  attachments,
  onAttachmentsChange,
  attachSources,
  maxAttachments = 3,
  minAttachments = 0,
  workspaceId,
  count,
  placeholder = "Describe what to generate…",
  disabled,
  pending,
  onSubmit,
  tools,
  composerHeader,
  submitLabel = "Generate",
  canSubmit: canSubmitProp,
  requirePrompt = true,
  hideModelSelector = false,
  allowEmptyModels = false,
  highlighted,
  textareaRef: textareaRefProp,
  onPromptChange,
  className,
  surfaceClassName,
  composerRef,
  emptyTitle = "No image models yet",
  emptyDescription = "Add a text-to-image model in the manager to start creating.",
  submitTitle,
}: StudioPromptComposerProps) {
  const { textInput } = usePromptInputController();
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [mentionOptionIndex, setMentionOptionIndex] = useState(0);
  const [suppressedMentionStart, setSuppressedMentionStart] = useState<
    number | null
  >(null);
  const [hoveredAttachmentIndex, setHoveredAttachmentIndex] = useState<
    number | null
  >(null);
  const innerTextareaRef = useRef<HTMLTextAreaElement>(null);

  const setTextareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerTextareaRef.current = node;
      textareaRefProp?.(node);
    },
    [textareaRefProp],
  );

  const selectedModel = useMemo(
    () => models.find((model) => model._id === selectedModelId) ?? models[0],
    [models, selectedModelId],
  );

  const companyNames = useMemo(
    () => [...new Set(models.map((model) => getModelCompanyName(model)))].sort(),
    [models],
  );
  const modelHighlights = useMemo(() => buildModelHighlights(models), [models]);
  const selectedModelHighlights = useMemo(
    () => (selectedModel ? (modelHighlights.get(selectedModel._id) ?? []) : []),
    [modelHighlights, selectedModel],
  );

  const hasPrompt = textInput.value.trim().length > 0;
  const meetsAttachmentRequirement = attachments.length >= minAttachments;
  const meetsPromptRequirement = !requirePrompt || hasPrompt;
  const ready =
    canSubmitProp === undefined
      ? meetsPromptRequirement && meetsAttachmentRequirement
      : canSubmitProp || (meetsPromptRequirement && meetsAttachmentRequirement);
  const canSubmit = ready && (hideModelSelector || allowEmptyModels || !!selectedModel) && !disabled && !pending;
  const attachDisabled =
    disabled ||
    pending ||
    (!hideModelSelector &&
      !selectedModel?.contextSupports?.includes(ContextSupport.IMAGE));
  const multiplier = count?.value ?? 1;
  const costLabel = selectedModel
    ? formatModelCost(selectedModel.cost * multiplier, selectedModel.costUnit)
    : null;

  const taggedIndexes = taggedAttachmentIndices(
    textInput.value,
    attachments.length,
  );
  const activeMention = getActiveMention(textInput.value, cursor);
  const mentionOpen =
    activeMention !== null && activeMention.start !== suppressedMentionStart;
  const filteredMentionIndexes = attachments.flatMap((file, index) =>
    activeMention &&
    mentionMatchesAttachment(
      activeMention.query,
      index,
      attachmentChipLabel(file),
    )
      ? [index]
      : [],
  );
  const selectedMentionIndex =
    filteredMentionIndexes.length === 0
      ? 0
      : Math.min(mentionOptionIndex, filteredMentionIndexes.length - 1);

  const focusPrompt = useCallback(() => {
    innerTextareaRef.current?.focus();
  }, []);

  const syncCursor = useCallback((el: HTMLTextAreaElement) => {
    setCursor(el.selectionStart);
  }, []);

  const insertReference = useCallback(
    (index: number, mentionStart?: number) => {
      const el = innerTextareaRef.current;
      const current = textInput.value;
      const tag = referenceTag(index);
      const selectionStart = el?.selectionStart ?? current.length;
      const selectionEnd = el?.selectionEnd ?? current.length;
      const result =
        mentionStart === undefined
          ? insertTagAtCursor(current, selectionStart, selectionEnd, tag)
          : replaceMentionWithTag(current, mentionStart, selectionStart, tag);

      textInput.setInput(result.next);
      onPromptChange?.();
      setSuppressedMentionStart(null);
      setMentionOptionIndex(0);

      requestAnimationFrame(() => {
        const node = innerTextareaRef.current;
        if (!node) return;
        node.focus();
        node.setSelectionRange(result.cursor, result.cursor);
        setCursor(result.cursor);
      });
    },
    [onPromptChange, textInput],
  );

  const handlePromptChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      syncCursor(event.currentTarget);
      setSuppressedMentionStart(null);
      setMentionOptionIndex(0);
      onPromptChange?.();
    },
    [onPromptChange, syncCursor],
  );

  const handlePromptKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        event.currentTarget.form?.requestSubmit();
        return;
      }

      if (!mentionOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setSuppressedMentionStart(activeMention?.start ?? null);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (filteredMentionIndexes.length === 0) return;
        setMentionOptionIndex(
          (current) => (current + 1) % filteredMentionIndexes.length,
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (filteredMentionIndexes.length === 0) return;
        setMentionOptionIndex(
          (current) =>
            (current - 1 + filteredMentionIndexes.length) %
            filteredMentionIndexes.length,
        );
        return;
      }

      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        const attachmentIndex = filteredMentionIndexes[selectedMentionIndex];
        if (attachmentIndex === undefined || !activeMention) return;
        insertReference(attachmentIndex, activeMention.start);
      }
    },
    [
      activeMention,
      filteredMentionIndexes,
      insertReference,
      mentionOpen,
      selectedMentionIndex,
    ],
  );

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (
        event.key === "/" &&
        !isTyping &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        focusPrompt();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [focusPrompt]);

  if (models.length === 0 && !allowEmptyModels) {
    return (
      <div className="rounded-xl border border-dashed border-black/12 bg-black/[0.02] px-6 py-14 text-left dark:border-white/12 dark:bg-white/[0.02]">
        <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-black/[0.04] ring-1 ring-black/10 dark:bg-white/[0.04] dark:ring-white/12">
          <SparklesIcon className="size-4 text-black/56 dark:text-white/56" />
        </div>
        <p className="text-[15px] font-medium tracking-[-0.02em] text-foreground">
          {emptyTitle}
        </p>
        <p className="mt-2 max-w-sm text-[13px] leading-[1.55] tracking-[-0.01em] text-black/56 dark:text-white/56">
          {emptyDescription}
        </p>
      </div>
    );
  }

  const modelSelector =
    !hideModelSelector && selectedModel ? (
    <ModelSelector onOpenChange={setModelSelectorOpen} open={modelSelectorOpen}>
      <StudioInputActionTooltip label="Choose generation model">
        <ModelSelectorTrigger asChild>
          <PromptInputButton
          aria-expanded={modelSelectorOpen}
          aria-haspopup="dialog"
          className={cn(
            TOOL_BUTTON_CLASS,
            "max-w-[min(100%,14rem)]",
            modelSelectorOpen && "border-black/18 bg-black/[0.04] dark:border-white/20 dark:bg-white/[0.06]",
          )}
          disabled={disabled || pending}
          type="button"
        >
          <span className="flex size-5 shrink-0 items-center justify-center rounded-[0.4375rem] bg-muted/50 ring-1 ring-border/30">
            <ModelLogo className="size-3" model={selectedModel} size={12} />
          </span>
          {selectedModelHighlights[0] ? (
            <span
              aria-hidden
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                selectedModelHighlights[0] === "cheapest" && "bg-success",
                selectedModelHighlights[0] === "newest" && "bg-info",
                selectedModelHighlights[0] === "mostUsed" && "bg-warning",
              )}
            />
          ) : null}
          <ModelSelectorName className="text-xs font-medium leading-none tracking-[-0.015em]">
            {selectedModel.name}
          </ModelSelectorName>
          <ChevronDownIcon
            className={cn(
              "size-3 shrink-0 text-muted-foreground/60 transition-transform duration-200 ease-out",
              modelSelectorOpen && "rotate-180",
            )}
          />
        </PromptInputButton>
        </ModelSelectorTrigger>
      </StudioInputActionTooltip>

      <ModelSelectorContent className="sm:max-w-104" title="Choose model">
        <ModelSelectorHeader
          heading="Models"
          description={
            <>
              {models.length} available
              {companyNames.length > 1 ? ` · ${companyNames.length} companies` : null}
            </>
          }
        />
        <ModelSelectorInput placeholder="Search by name or provider…" />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models match your search.</ModelSelectorEmpty>
          {companyNames.map((companyName) => (
            <ModelSelectorGroup heading={companyName} key={companyName}>
              {models
                .filter((model) => getModelCompanyName(model) === companyName)
                .map((model) => {
                  const isSelected = selectedModelId === model._id;
                  const highlights = modelHighlights.get(model._id) ?? [];
                  const supports = model.contextSupports ?? [];

                  return (
                    <ModelSelectorItem
                      key={model._id}
                      data-checked={isSelected ? true : undefined}
                      onSelect={() => {
                        onSelectedModelChange(model._id);
                        setModelSelectorOpen(false);
                      }}
                      value={`${model.name} ${model.modelProvider} ${getModelCompanyName(model)}`}
                    >
                      <ModelSelectorLogoBadge>
                        <ModelLogo className="size-3.5" model={model} size={14} />
                      </ModelSelectorLogoBadge>

                      <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <ModelSelectorName className="min-w-0 flex-1 text-[13px] font-medium leading-none tracking-[-0.016em]">
                            {model.name}
                          </ModelSelectorName>
                          {highlights.length > 0 ? (
                            <span className="flex shrink-0 items-center gap-1">
                              {highlights.map((highlight) => (
                                <ModelHighlightBadge
                                  key={highlight}
                                  highlight={highlight}
                                />
                              ))}
                            </span>
                          ) : null}
                        </span>

                        {supports.length > 0 ? (
                          <span className="flex items-center gap-1.5">
                            {supports.map((support) => {
                              const { icon: Icon, label } =
                                SUPPORT_LABELS[support];
                              return (
                                <Icon
                                  key={support}
                                  aria-label={label}
                                  className="size-3 text-muted-foreground/40"
                                  strokeWidth={1.75}
                                />
                              );
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
                            "flex size-4 items-center justify-center transition-opacity duration-150",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        >
                          <CheckIcon
                            className="size-3.5 text-foreground"
                            strokeWidth={2.25}
                          />
                        </span>
                      </span>
                    </ModelSelectorItem>
                  );
                })}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  ) : null;

  return (
    <div
      ref={composerRef}
      className={cn(
        "w-full scroll-mt-10 transition-[transform,opacity] duration-300",
        highlighted && "animate-in fade-in-0 duration-300",
        className,
      )}
    >
      <PromptInput
        className={cn(
          "rounded-2xl border-black/10 bg-background transition-[border-color,ring-color] duration-200",
          "has-[[data-slot=input-group-control]:focus-visible]:border-black/18",
          "has-[[data-slot=input-group-control]:focus-visible]:ring-2",
          "has-[[data-slot=input-group-control]:focus-visible]:ring-ring/6",
          "dark:border-white/12",
          "dark:has-[[data-slot=input-group-control]:focus-visible]:border-white/20",
          highlighted && "border-foreground/15 ring-2 ring-foreground/8",
          surfaceClassName,
        )}
        onSubmit={onSubmit}
      >
        {composerHeader ? (
          <div className="w-full min-w-0 self-stretch overflow-hidden border-b border-border/35 bg-muted/8 py-2">
            {composerHeader}
          </div>
        ) : null}

        <PromptInputBody>
          <div className="relative w-full min-w-0 self-stretch">
            <StudioPromptHighlight
              value={textInput.value}
              attachmentCount={attachments.length}
              emphasizedIndex={hoveredAttachmentIndex}
              textareaRef={innerTextareaRef}
              className={PROMPT_TEXT_METRICS}
            />
            <PromptInputTextarea
              ref={setTextareaRef}
              style={PROMPT_FIELD_STYLE}
              className={cn(
                PROMPT_TEXTAREA_CLASS,
                "relative z-10 bg-transparent caret-foreground selection:bg-foreground/15",
                "placeholder:text-muted-foreground/45 placeholder:transition-opacity placeholder:duration-300",
                "shadow-none ring-0 focus:outline-none focus:ring-0 focus-visible:ring-0",
                "dark:bg-transparent",
              )}
              disabled={disabled || pending}
              placeholder={placeholder}
              aria-autocomplete="list"
              aria-expanded={mentionOpen}
              aria-controls={
                mentionOpen ? "studio-reference-attachments" : undefined
              }
              aria-activedescendant={
                mentionOpen && filteredMentionIndexes[selectedMentionIndex] != null
                  ? `studio-reference-${filteredMentionIndexes[selectedMentionIndex]}`
                  : undefined
              }
              onChange={handlePromptChange}
              onFocus={(event) => syncCursor(event.currentTarget)}
              onClick={(event) => syncCursor(event.currentTarget)}
              onKeyUp={(event) => syncCursor(event.currentTarget)}
              onSelect={(event) =>
                syncCursor(event.currentTarget as HTMLTextAreaElement)
              }
              onKeyDown={handlePromptKeyDown}
            />
            {hasPrompt ? (
              <span
                aria-hidden
                className="pointer-events-none absolute right-4 bottom-3 z-10 text-[10px] tabular-nums tracking-[-0.01em] text-muted-foreground/35"
              >
                {textInput.value.length.toLocaleString()}
              </span>
            ) : null}
          </div>
        </PromptInputBody>

        {mentionOpen && attachments.length === 0 ? (
          <div
            id="studio-reference-attachments"
            className="border-t border-border/35 bg-muted/12 px-3.5 py-2.5 text-[12px] leading-snug tracking-[-0.01em] text-muted-foreground"
            role="status"
          >
            Attach a reference first, then tag it with{" "}
            <span className="font-medium text-foreground/80">@image1</span>.
          </div>
        ) : null}

        {attachments.length > 0 ? (
          <div
            id="studio-reference-attachments"
            className={cn(
              "flex w-full items-end gap-2.5 overflow-x-auto border-t border-border/35 bg-muted/12 px-3 pt-2.5 pb-2 scrollbar-none sm:px-3.5",
              mentionOpen && "bg-muted/18",
            )}
            role={mentionOpen ? "listbox" : "list"}
            aria-label="Reference images"
          >
            {attachments.map((file, index) => (
              <StudioAttachmentChip
                key={file.id}
                file={file}
                index={index}
                tagged={taggedIndexes.has(index)}
                picking={
                  mentionOpen &&
                  filteredMentionIndexes[selectedMentionIndex] === index
                }
                dimmed={
                  mentionOpen && !filteredMentionIndexes.includes(index)
                }
                selectable={mentionOpen}
                disabled={disabled || pending}
                onInsert={(attachmentIndex) =>
                  insertReference(attachmentIndex, activeMention?.start)
                }
                onHover={(index) => {
                  setHoveredAttachmentIndex(index);
                  if (index === null || !mentionOpen) return;
                  const optionIndex = filteredMentionIndexes.indexOf(index);
                  if (optionIndex >= 0) setMentionOptionIndex(optionIndex);
                }}
                onRemove={(id) =>
                  onAttachmentsChange(
                    attachments.filter((item) => item.id !== id),
                  )
                }
              />
            ))}
          </div>
        ) : null}

        <PromptInputFooter
          className={cn(
            "border-t border-border/35 bg-muted/12 px-3 py-2.5 sm:px-3.5",
            attachments.length > 0 && "border-t-0 pt-2",
          )}
        >
          <PromptInputTools className="min-w-0 flex-wrap gap-2">
            {attachSources.length > 0 ? (
              <StudioAttachMenu
                sources={attachSources}
                attachments={attachments}
                onAttachmentsChange={onAttachmentsChange}
                maxAttachments={maxAttachments}
                workspaceId={workspaceId}
                disabled={attachDisabled}
                disabledReason={
                  selectedModel?.contextSupports?.includes(ContextSupport.IMAGE)
                    ? "Attach references"
                    : "This model does not support image references"
                }
              />
            ) : null}

            {count ? (
              <>
                {attachSources.length > 0 ? (
                  <Separator
                    className="hidden h-5 bg-border/50 sm:block"
                    orientation="vertical"
                  />
                ) : null}
                <StudioInputActionTooltip label={count.label ?? "Number of images to generate"}>
                  <StudioCountStepper
                    value={count.value}
                    min={count.min}
                    max={count.max}
                    onChange={count.onChange}
                    disabled={disabled || pending}
                    label={count.label}
                  />
                </StudioInputActionTooltip>
              </>
            ) : null}

            {tools ? (
              <>
                <Separator
                  className="hidden h-5 bg-border/50 sm:block"
                  orientation="vertical"
                />
                {tools}
              </>
            ) : null}

            {modelSelector ? (
              <>
                <Separator
                  className="hidden h-5 bg-border/50 sm:block"
                  orientation="vertical"
                />
                {modelSelector}
              </>
            ) : null}
          </PromptInputTools>

          <div className="flex shrink-0 items-center gap-2.5">
            {costLabel ? (
              <span className="hidden text-[11px] tabular-nums tracking-[-0.015em] text-muted-foreground/65 md:inline">
                {costLabel}
              </span>
            ) : null}
            <StudioInputActionTooltip
              label={submitTitle ?? submitLabel}
              shortcut={canSubmit ? "⌘↵" : undefined}
            >
              <PromptInputSubmit
                className={cn(
                  "h-8 gap-1.5 rounded-lg px-3.5 text-[13px] font-medium tracking-[-0.015em]",
                  "transition-[transform,opacity] duration-150 active:scale-[0.98]",
                  !canSubmit && "opacity-45",
                )}
                disabled={!canSubmit}
                size="sm"
                status={pending ? "submitted" : undefined}
              >
                <span className="hidden sm:inline">{submitLabel}</span>
                <Kbd className="ml-0.5 hidden h-5 min-w-5 border-primary-foreground/15 bg-primary-foreground/10 px-1 text-[10px] font-normal text-primary-foreground/85 lg:inline-flex">
                  ⌘↵
                </Kbd>
              </PromptInputSubmit>
            </StudioInputActionTooltip>
          </div>
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
