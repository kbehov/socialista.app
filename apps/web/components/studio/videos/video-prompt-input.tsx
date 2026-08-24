"use client";

import { startVideoGeneration } from "@/actions/video-generation.actions";
import {
  PromptInputButton,
  PromptInputProvider,
  usePromptInputController,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { AspectRatioIcon } from "@/components/icons/aspect-ration.icon";
import { StudioSkillPicker } from "@/components/skills/studio-skill-picker";
import { STUDIO_COMPOSER_SURFACE_CLASS } from "@/components/studio/prompt/studio-composer-surface";
import { StudioPromptComposer } from "@/components/studio/prompt/studio-prompt-composer";
import { StudioReferenceTagHint } from "@/components/studio/prompt/studio-reference-tag-hint";
import { useVideoStudio } from "@/components/studio/videos/video-studio-provider";
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
import { commitHaptic } from "@/utils/haptics";
import type { AttachedMedia } from "@/components/files/attach-images-dialog";
import {
  ModelType,
  PROMPT_KEYS,
  VIDEO_DURATION_DEFAULT,
  VIDEO_DURATIONS,
  type Model,
  type VideoAspectRatio,
} from "@socialista/types";
import { ChevronDownIcon, SparklesIcon, Volume2Icon, VolumeXIcon } from "lucide-react";
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
import { VideoPromptAnatomy } from "./video-prompt-anatomy";

const MAX_REFERENCE_IMAGES = 3;
const DEFAULT_PLACEHOLDER = "Describe the scene, motion, and mood…";

const ASPECT_RATIOS = [
  { id: "9:16", label: "Portrait", ratio: 9 / 16 },
  { id: "16:9", label: "Landscape", ratio: 16 / 9 },
  { id: "1:1", label: "Square", ratio: 1 },
] as const satisfies ReadonlyArray<{
  id: VideoAspectRatio;
  label: string;
  ratio: number;
}>;

const TOOL_BUTTON_CLASS = cn(
  "h-7 gap-1.5 rounded-xl border px-1.5 pr-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
  "border-border/40 bg-background/90 transition-[border-color,background-color,box-shadow] duration-150",
  "hover:border-border/65 hover:bg-background",
  "active:scale-[0.97]",
);

function VideoPromptComposer({ models }: { models: Model[] }) {
  const router = useRouter();
  const { composerRef, registerPromptHandlers } = useVideoStudio();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const [isPending, startTransition] = useTransition();
  const [attachedImages, setAttachedImages] = useState<AttachedMedia[]>([]);
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>("9:16");
  const [duration, setDuration] = useState(VIDEO_DURATION_DEFAULT);
  const [generateAudio, setGenerateAudio] = useState(true);
  const [skillId, setSkillId] = useState<string | undefined>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { textInput } = usePromptInputController();

  const visibleModels = useMemo(() => {
    if (attachedImages.length === 0) {
      const textToVideo = models.filter((model) => model.modelType === ModelType.TEXT_TO_VIDEO);
      return textToVideo.length > 0 ? textToVideo : models;
    }
    const imageToVideo = models.filter((model) => model.modelType === ModelType.IMAGE_TO_VIDEO);
    return imageToVideo.length > 0 ? imageToVideo : models;
  }, [attachedImages.length, models]);

  const [selectedModelId, setSelectedModelId] = useState(visibleModels[0]?._id ?? "");

  useEffect(() => {
    if (visibleModels.some((model) => model._id === selectedModelId)) return;
    setSelectedModelId(visibleModels[0]?._id ?? "");
  }, [selectedModelId, visibleModels]);

  const placeholder = useMemo(() => {
    if (attachedImages.length >= 2) {
      return "the person from @image1 walks toward the product from @image2…";
    }
    if (attachedImages.length === 1) {
      return "the person from @image1 turns toward camera and smiles…";
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
      visibleModels.find((model) => model._id === selectedModelId) ?? visibleModels[0];
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
      const result = await startVideoGeneration({
        prompt,
        model: selectedModel.value,
        workspaceId: currentWorkspace._id,
        aspectRatio,
        duration,
        generateAudio,
        userId: "",
        ...(imageUrls.length > 0 ? { imageUrls } : {}),
        ...(skillId ? { skillId } : {}),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      commitHaptic({ vibrateDuration: 10 });
      storeGenerationAccessToken(result.runId, result.publicAccessToken);
      router.push(DASHBOARD_ROUTES.STUDIO.videoRun(result.runId));
    });
  };

  const selectedAspect =
    ASPECT_RATIOS.find((option) => option.id === aspectRatio) ?? ASPECT_RATIOS[0];

  const tools = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <PromptInputButton
            aria-label={`Aspect ratio ${selectedAspect.id}`}
            className={TOOL_BUTTON_CLASS}
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
            onValueChange={(value) => setAspectRatio(value as VideoAspectRatio)}
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <PromptInputButton
            aria-label={`Duration ${duration} seconds`}
            className={TOOL_BUTTON_CLASS}
            disabled={isPending}
            type="button"
          >
            <span className="text-xs font-medium leading-none tracking-[-0.015em] tabular-nums">
              {duration}s
            </span>
            <ChevronDownIcon className="size-3 shrink-0 text-muted-foreground/60" />
          </PromptInputButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-36 w-36">
          <DropdownMenuRadioGroup
            value={String(duration)}
            onValueChange={(value) => setDuration(Number(value))}
          >
            {VIDEO_DURATIONS.map((seconds) => (
              <DropdownMenuRadioItem
                key={seconds}
                className="rounded-lg"
                value={String(seconds)}
              >
                <span className="text-[13px] font-medium tracking-[-0.015em] tabular-nums">
                  {seconds} seconds
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <PromptInputButton
        aria-label={generateAudio ? "Audio on" : "Audio off"}
        aria-pressed={generateAudio}
        className={TOOL_BUTTON_CLASS}
        disabled={isPending}
        onClick={() => setGenerateAudio((current) => !current)}
        type="button"
      >
        {generateAudio ? (
          <Volume2Icon className="size-3.5" />
        ) : (
          <VolumeXIcon className="size-3.5 text-muted-foreground/70" />
        )}
        <span className="text-xs font-medium leading-none tracking-[-0.015em]">
          {generateAudio ? "Audio" : "Muted"}
        </span>
      </PromptInputButton>
      <StudioSkillPicker
        target={PROMPT_KEYS.videoPrompt}
        value={skillId}
        onChange={setSkillId}
        disabled={isPending}
      />
    </>
  );

  return (
    <div>
      <StudioPromptComposer
        models={visibleModels}
        selectedModelId={selectedModelId}
        onSelectedModelChange={setSelectedModelId}
        attachments={attachedImages}
        onAttachmentsChange={setAttachedImages}
        attachSources={["upload", "library", "influencer", "product"]}
        maxAttachments={MAX_REFERENCE_IMAGES}
        workspaceId={currentWorkspace?._id}
        placeholder={placeholder}
        pending={isPending}
        onSubmit={handleSubmit}
        submitLabel="Generate"
        tools={tools}
        textareaRef={(node) => {
          textareaRef.current = node;
        }}
        composerRef={composerRef}
        emptyTitle="No video models yet"
        emptyDescription="Add a text-to-video or image-to-video model in the manager to start creating clips."
        surfaceClassName={STUDIO_COMPOSER_SURFACE_CLASS}
      />

      <div className="mt-3 px-0.5">
        <StudioReferenceTagHint attachmentCount={attachedImages.length} />
      </div>

      <div className="mt-6 space-y-5">
        <VideoPromptAnatomy />

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

const VideoGenerationPromptInput = ({ models }: { models: Model[] }) => {
  if (models.length === 0) {
    return (
      <div className="rounded-[1.375rem] border border-dashed border-border/50 bg-background/75 px-6 py-14 text-center backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-2xl bg-muted/40 ring-1 ring-border/35">
          <SparklesIcon className="size-4 text-muted-foreground/80" />
        </div>
        <p className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
          No video models yet
        </p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-[1.55] tracking-[-0.01em] text-muted-foreground">
          Add a text-to-video or image-to-video model in the manager to start
          creating social clips.
        </p>
      </div>
    );
  }

  return (
    <PromptInputProvider>
      <VideoPromptComposer models={models} />
    </PromptInputProvider>
  );
};

export default VideoGenerationPromptInput;
