"use client";

import { startImageGeneration } from "@/actions/image-generation.actions";
import {
  PromptInputButton,
  PromptInputProvider,
  usePromptInputController,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { AspectRatioIcon } from "@/components/icons/aspect-ration.icon";
import { useImageStudio } from "@/components/studio/images/image-studio-provider";
import { StudioInputActionTooltip } from "@/components/studio/prompt/studio-input-action-tooltip";
import {
  StudioAttachedSkill,
  StudioSkillPicker,
} from "@/components/skills/studio-skill-picker";
import {
  STUDIO_HOME_COMPOSER_SURFACE_CLASS,
  STUDIO_TOOL_BUTTON_ACTIVE_CLASS,
  STUDIO_TOOL_BUTTON_CLASS,
  STUDIO_TOOL_CHEVRON_CLASS,
} from "@/components/studio/prompt/studio-composer-surface";
import { StudioPromptComposer } from "@/components/studio/prompt/studio-prompt-composer";
import { StudioReferenceTagHint } from "@/components/studio/prompt/studio-reference-tag-hint";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { DASHBOARD_ROUTES } from "@/constants/app-routes";
import { storeGenerationAccessToken } from "@/lib/image-generation/session";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace.store";
import { getProjectId, useProjectStore } from "@/store/project.store";
import { commitHaptic } from "@/utils/haptics";
import type { AttachedMedia } from "@/components/files/attach-images-dialog";
import {
  IMAGE_GENERATION_COUNT_DEFAULT,
  IMAGE_GENERATION_COUNT_MAX,
  IMAGE_GENERATION_COUNT_MIN,
  PROMPT_KEYS,
  type Model,
  type Skill,
} from "@socialista/types";
import { ChevronDownIcon, SparklesIcon, WandSparklesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { ImageStudioStarters } from "./image-studio-starters";
import { ImagePromptAnatomy } from "./prompt-anatomy";

const MAX_REFERENCE_IMAGES = 3;

const DEFAULT_PLACEHOLDER =
  "Matte serum on travertine, hard side light, luxury PDP still…";

function getSubmitShortcutLabel() {
  if (typeof navigator === "undefined") return "⌘↵";
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? navigator.userAgent)
    ? "⌘↵"
    : "Ctrl↵";
}

type AspectRatioId = "1:1" | "16:9" | "9:16" | "4:3";

const ASPECT_RATIOS = [
  { id: "1:1", label: "Square", ratio: 1 },
  { id: "16:9", label: "Landscape", ratio: 16 / 9 },
  { id: "9:16", label: "Portrait", ratio: 9 / 16 },
  { id: "4:3", label: "Classic", ratio: 4 / 3 },
] as const satisfies ReadonlyArray<{
  id: AspectRatioId;
  label: string;
  ratio: number;
}>;

function ImagePromptComposer({ models }: { models: Model[] }) {
  const [submitShortcut] = useState(getSubmitShortcutLabel);
  const router = useRouter();
  const { composerRef, registerPromptHandlers } = useImageStudio();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const projectId = useProjectStore((s) => getProjectId(s.currentProject));
  const [isPending, startTransition] = useTransition();
  const [attachedImages, setAttachedImages] = useState<AttachedMedia[]>([]);
  const [selectedModelId, setSelectedModelId] = useState(models[0]?._id ?? "");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("1:1");
  const [numImages, setNumImages] = useState(IMAGE_GENERATION_COUNT_DEFAULT);
  const [attachedSkill, setAttachedSkill] = useState<Skill | undefined>();
  const [enhance, setEnhance] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { textInput } = usePromptInputController();

  const placeholder = useMemo(() => {
    if (attachedImages.length >= 2) {
      return "the creator from @image1 holding the product from @image2, native UGC for Reels…";
    }
    if (attachedImages.length === 1) {
      return "the product from @image1 on marble, ecommerce hero, clean studio light…";
    }
    return DEFAULT_PLACEHOLDER;
  }, [attachedImages.length]);

  const insertAtCursor = useCallback(
    (snippet: string) => {
      const el = textareaRef.current;
      const current = textInput.value;

      if (!el) {
        textInput.setInput(current ? `${current}${snippet}` : snippet);
        return;
      }

      const start = el.selectionStart ?? current.length;
      const end = el.selectionEnd ?? current.length;
      const next = `${current.slice(0, start)}${snippet}${current.slice(end)}`;
      textInput.setInput(next);

      requestAnimationFrame(() => {
        const position = start + snippet.length;
        el.focus();
        el.setSelectionRange(position, position);
      });
    },
    [textInput],
  );

  const setPrompt = useCallback(
    (text: string) => {
      textInput.setInput(text);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(text.length, text.length);
      });
    },
    [textInput],
  );

  const focusPrompt = useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    registerPromptHandlers({
      insertAtCursor,
      setPrompt,
      focusPrompt,
    });
  }, [registerPromptHandlers, insertAtCursor, setPrompt, focusPrompt]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (message: PromptInputMessage) => {
    const prompt = message.text.trim();
    if (!prompt) return;

    const selectedModel =
      models.find((model) => model._id === selectedModelId) ?? models[0];
    if (!selectedModel) {
      toast.error("Select a model to continue.");
      return;
    }

    if (!currentWorkspace?._id) {
      toast.error("Select a workspace to continue.");
      return;
    }

    startTransition(async () => {
      const imageUrls = attachedImages.map((image) => image.url);
      const result = await startImageGeneration({
        prompt,
        model: selectedModel.value,
        workspaceId: currentWorkspace._id,
        aspectRatio,
        userId: "",
        numImages,
        ...(imageUrls.length > 0 ? { imageUrls } : {}),
        ...(attachedSkill ? { skillId: attachedSkill._id } : {}),
        ...(enhance ? {} : { enhance: false }),
        ...(projectId ? { projectId } : {}),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      commitHaptic({ vibrateDuration: 10 });
      storeGenerationAccessToken(result.runId, result.publicAccessToken);
      router.push(DASHBOARD_ROUTES.STUDIO.imageRun(result.runId));
    });
  };

  const selectedAspect =
    ASPECT_RATIOS.find((option) => option.id === aspectRatio) ?? ASPECT_RATIOS[0];

  const aspectTools = (
    <DropdownMenu>
      <StudioInputActionTooltip label="Output aspect ratio">
        <DropdownMenuTrigger asChild>
          <PromptInputButton
            aria-label={`Aspect ratio ${selectedAspect.id}`}
            className={STUDIO_TOOL_BUTTON_CLASS}
            disabled={isPending}
            size="xs"
            type="button"
          >
            <AspectRatioIcon active ratio={selectedAspect.ratio} />
            <span className="text-[12px] font-medium leading-none tracking-[-0.015em]">
              {selectedAspect.id}
            </span>
            <ChevronDownIcon className={STUDIO_TOOL_CHEVRON_CLASS} />
          </PromptInputButton>
        </DropdownMenuTrigger>
      </StudioInputActionTooltip>
      <DropdownMenuContent align="start" className="min-w-44 w-44">
        <DropdownMenuRadioGroup
          value={aspectRatio}
          onValueChange={(value) => setAspectRatio(value as AspectRatioId)}
        >
          {ASPECT_RATIOS.map((option) => (
            <DropdownMenuRadioItem
              key={option.id}
              className="gap-2.5 rounded-lg"
              value={option.id}
            >
              <AspectRatioIcon
                active={aspectRatio === option.id}
                ratio={option.ratio}
              />
              <span className="text-[13px] font-medium tracking-[-0.015em]">
                {option.label}
              </span>
              <DropdownMenuShortcut>{option.id}</DropdownMenuShortcut>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="image-studio-prompt">
      <StudioPromptComposer
        models={models}
        selectedModelId={selectedModelId}
        onSelectedModelChange={setSelectedModelId}
        attachments={attachedImages}
        onAttachmentsChange={setAttachedImages}
        attachSources={["upload", "library", "influencer", "product"]}
        maxAttachments={MAX_REFERENCE_IMAGES}
        workspaceId={currentWorkspace?._id}
        count={{
          value: numImages,
          min: IMAGE_GENERATION_COUNT_MIN,
          max: IMAGE_GENERATION_COUNT_MAX,
          onChange: setNumImages,
          label: "Number of images",
        }}
        placeholder={placeholder}
        pending={isPending}
        onSubmit={handleSubmit}
        submitLabel={numImages === 1 ? "Generate" : `Generate ${numImages}`}
        submitTitle={numImages === 1 ? "Generate" : `Generate ${numImages}`}
        submitAppearance="send"
        footerClassName="border-transparent bg-transparent px-2.5 pb-2 pt-1 sm:px-3"
        composerHeader={
          attachedSkill ? (
            <StudioAttachedSkill
              skill={attachedSkill}
              disabled={isPending}
              onRemove={() => setAttachedSkill(undefined)}
            />
          ) : null
        }
        composerHeaderClassName="border-black/[0.06] bg-transparent py-1.5 dark:border-white/[0.08]"
        tools={
          <>
            {aspectTools}
            <PromptInputButton
              aria-label={enhance ? "Prompt enhancement on" : "Prompt enhancement off"}
              aria-pressed={enhance}
              className={cn(
                STUDIO_TOOL_BUTTON_CLASS,
                enhance && STUDIO_TOOL_BUTTON_ACTIVE_CLASS,
              )}
              disabled={isPending}
              onClick={() => setEnhance((value) => !value)}
              size="xs"
              tooltip={
                enhance
                  ? "Enhance on — AI refines your prompt before generating"
                  : "Raw prompt — send exactly what you typed"
              }
              type="button"
            >
              <WandSparklesIcon className="size-3.5 shrink-0" />
              <span className="text-[12px] font-medium leading-none tracking-[-0.015em]">
                {enhance ? "Enhance" : "Raw"}
              </span>
            </PromptInputButton>
            <StudioSkillPicker
              target={PROMPT_KEYS.imagePrompt}
              value={attachedSkill?._id}
              onChange={(skillId) => {
                if (!skillId) setAttachedSkill(undefined);
              }}
              onSelect={setAttachedSkill}
              disabled={isPending || !enhance}
            />
          </>
        }
        textareaRef={(node) => {
          textareaRef.current = node;
        }}
        composerRef={composerRef}
        emptyTitle="No image models yet"
        emptyDescription="Add a text-to-image model in the manager to start making campaign stills."
        surfaceClassName={STUDIO_HOME_COMPOSER_SURFACE_CLASS}
      />

      {attachedImages.length > 0 ? (
        <div className="mt-2.5 px-0.5">
          <StudioReferenceTagHint attachmentCount={attachedImages.length} />
        </div>
      ) : null}

      <div className="mt-4 flex flex-col items-center gap-4">
        <ImageStudioStarters disabled={isPending} />

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

        <div className="w-full">
          <ImagePromptAnatomy />
        </div>
      </div>
    </div>
  );
}

const ImageGenerationPromptInput = ({ models }: { models: Model[] }) => {
  if (models.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-black/[0.08] bg-black/[0.015] px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.015]">
        <div className="mx-auto mb-4 flex size-9 items-center justify-center rounded-lg bg-black/[0.03] ring-1 ring-black/8 dark:bg-white/[0.03] dark:ring-white/10">
          <SparklesIcon className="size-3.5 text-black/48 dark:text-white/48" />
        </div>
        <p className="text-[15px] font-medium tracking-[-0.02em] text-foreground">
          No image models yet
        </p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-[1.55] tracking-[-0.01em] text-black/48 dark:text-white/48">
          Add a text-to-image model in the manager to start making campaign
          stills.
        </p>
      </div>
    );
  }

  return (
    <PromptInputProvider>
      <ImagePromptComposer models={models} />
    </PromptInputProvider>
  );
};

export default ImageGenerationPromptInput;
