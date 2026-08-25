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
import { StudioSkillPicker } from "@/components/skills/studio-skill-picker";
import { STUDIO_COMPOSER_SURFACE_CLASS } from "@/components/studio/prompt/studio-composer-surface";
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
import { ImagePromptAnatomy } from "./prompt-anatomy";

const MAX_REFERENCE_IMAGES = 3;

const DEFAULT_PLACEHOLDER = "Describe the scene, mood, and style…";

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
  const router = useRouter();
  const { composerRef, registerPromptHandlers } = useImageStudio();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const projectId = useProjectStore((s) => getProjectId(s.currentProject));
  const [isPending, startTransition] = useTransition();
  const [attachedImages, setAttachedImages] = useState<AttachedMedia[]>([]);
  const [selectedModelId, setSelectedModelId] = useState(models[0]?._id ?? "");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("1:1");
  const [numImages, setNumImages] = useState(IMAGE_GENERATION_COUNT_DEFAULT);
  const [skillId, setSkillId] = useState<string | undefined>();
  const [enhance, setEnhance] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { textInput } = usePromptInputController();

  const placeholder = useMemo(() => {
    if (attachedImages.length >= 2) {
      return "the person from @image1 is holding the product from @image2…";
    }
    if (attachedImages.length === 1) {
      return "the person from @image1, standing in a sunlit kitchen…";
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

  const focusPrompt = useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    registerPromptHandlers({
      insertAtCursor,
      focusPrompt,
    });
  }, [registerPromptHandlers, insertAtCursor, focusPrompt]);

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
        ...(skillId ? { skillId } : {}),
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
      <DropdownMenuTrigger asChild>
        <PromptInputButton
          aria-label={`Aspect ratio ${selectedAspect.id}`}
          className={cn(
            "h-7 gap-1.5 rounded-xl border px-1.5 pr-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
            "border-border/40 bg-background/90 transition-[border-color,background-color,box-shadow] duration-150",
            "hover:border-border/65 hover:bg-background",
            "active:scale-[0.97]",
          )}
          disabled={isPending}
          type="button"
        >
          <AspectRatioIcon active ratio={selectedAspect.ratio} />
          <span className="text-xs font-medium leading-none tracking-[-0.015em]">
            {selectedAspect.id}
          </span>
          <ChevronDownIcon className="size-3 shrink-0 text-muted-foreground/60" />
        </PromptInputButton>
      </DropdownMenuTrigger>
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
    <div>
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
        tools={
          <>
            {aspectTools}
            <PromptInputButton
              aria-label={enhance ? "Prompt enhancement on" : "Prompt enhancement off"}
              aria-pressed={enhance}
              className={cn(
                "h-7 gap-1.5 rounded-xl border px-1.5 pr-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
                "transition-[border-color,background-color,box-shadow] duration-150",
                "active:scale-[0.97]",
                enhance
                  ? "border-border/65 bg-background"
                  : "border-border/40 bg-background/90 hover:border-border/65 hover:bg-background",
              )}
              disabled={isPending}
              onClick={() => setEnhance((value) => !value)}
              type="button"
            >
              <WandSparklesIcon
                className={cn(
                  "size-3.5 shrink-0",
                  enhance ? "text-foreground/80" : "text-muted-foreground/60",
                )}
              />
              <span className="text-xs font-medium leading-none tracking-[-0.015em]">
                {enhance ? "Enhance" : "Raw"}
              </span>
            </PromptInputButton>
            <StudioSkillPicker
              target={PROMPT_KEYS.imagePrompt}
              value={skillId}
              onChange={setSkillId}
              disabled={isPending || !enhance}
            />
          </>
        }
        textareaRef={(node) => {
          textareaRef.current = node;
        }}
        composerRef={composerRef}
        emptyTitle="No image models yet"
        emptyDescription="Add a text-to-image model in the manager to start creating social visuals."
        surfaceClassName={STUDIO_COMPOSER_SURFACE_CLASS}
      />

      <div className="mt-3 px-0.5">
        <StudioReferenceTagHint attachmentCount={attachedImages.length} />
      </div>

      <div className="mt-6 space-y-5">
        <ImagePromptAnatomy />

        <p className="flex flex-wrap items-center justify-center gap-1.5 px-0.5 text-[11px] tracking-[-0.01em] text-muted-foreground/50">
          <Kbd className="h-4 min-w-4 border-border/35 bg-muted/25 px-1 text-[10px] text-muted-foreground/65">
            /
          </Kbd>
          <span>to focus</span>
          <span aria-hidden className="text-muted-foreground/20">
            ·
          </span>
          <Kbd className="h-4 min-w-4 border-border/35 bg-muted/25 px-1 text-[10px] text-muted-foreground/65">
            ⌘↵
          </Kbd>
          <span>to generate</span>
        </p>
      </div>
    </div>
  );
}

const ImageGenerationPromptInput = ({ models }: { models: Model[] }) => {
  if (models.length === 0) {
    return (
      <div className="rounded-[1.375rem] border border-dashed border-border/50 bg-background/75 px-6 py-14 text-center backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-2xl bg-muted/40 ring-1 ring-border/35">
          <SparklesIcon className="size-4 text-muted-foreground/80" />
        </div>
        <p className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
          No image models yet
        </p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-[1.55] tracking-[-0.01em] text-muted-foreground">
          Add a text-to-image model in the manager to start creating social
          visuals.
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
