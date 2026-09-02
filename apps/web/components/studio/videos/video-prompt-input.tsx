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
import { StudioInputActionTooltip } from "@/components/studio/prompt/studio-input-action-tooltip";
import { STUDIO_HOME_COMPOSER_SURFACE_CLASS, STUDIO_TOOL_BUTTON_ACTIVE_CLASS, STUDIO_TOOL_BUTTON_CLASS, STUDIO_TOOL_CHEVRON_CLASS } from "@/components/studio/prompt/studio-composer-surface";
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
import { getProjectId, useProjectStore } from "@/store/project.store";
import { commitHaptic } from "@/utils/haptics";
import type { AttachedMedia } from "@/components/files/attach-images-dialog";
import {
  ContextSupport,
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
import { VideoStudioStarters } from "./video-studio-starters";

const MAX_REFERENCE_IMAGES = 3;
const DEFAULT_PLACEHOLDER =
  "Slow push-in on a matte serum, hard side light, steam in the beam…";

function getSubmitShortcutLabel() {
  if (typeof navigator === "undefined") return "⌘↵";
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? navigator.userAgent)
    ? "⌘↵"
    : "Ctrl↵";
}

const ASPECT_RATIOS = [
  { id: "9:16", label: "Portrait", ratio: 9 / 16 },
  { id: "16:9", label: "Landscape", ratio: 16 / 9 },
  { id: "1:1", label: "Square", ratio: 1 },
] as const satisfies ReadonlyArray<{
  id: VideoAspectRatio;
  label: string;
  ratio: number;
}>;

function VideoPromptComposer({
  models,
  initialAttachmentUrl,
}: {
  models: Model[];
  initialAttachmentUrl?: string;
}) {
  const router = useRouter();
  const [submitShortcut] = useState(getSubmitShortcutLabel);
  const { composerRef, registerPromptHandlers } = useVideoStudio();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const projectId = useProjectStore((s) => getProjectId(s.currentProject));
  const [isPending, startTransition] = useTransition();
  const [attachedImages, setAttachedImages] = useState<AttachedMedia[]>(() =>
    initialAttachmentUrl
      ? [
          {
            id: "generation-source",
            url: initialAttachmentUrl,
            kind: "image",
            source: "library",
            label: "Generated",
            name: "Generated image",
          },
        ]
      : [],
  );
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>("9:16");
  const [duration, setDuration] = useState(VIDEO_DURATION_DEFAULT);
  const [generateAudio, setGenerateAudio] = useState(true);
  const [skillId, setSkillId] = useState<string | undefined>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { textInput } = usePromptInputController();

  const visibleModels = useMemo(() => {
    const videoModels = models.filter((model) => model.modelType === ModelType.VIDEO);
    const pool = videoModels.length > 0 ? videoModels : models;
    if (attachedImages.length === 0) {
      const textToVideo = pool.filter(
        (model) => !(model.contextSupports ?? []).includes(ContextSupport.IMAGE),
      );
      return textToVideo.length > 0 ? textToVideo : pool;
    }
    const imageToVideo = pool.filter((model) =>
      (model.contextSupports ?? []).includes(ContextSupport.IMAGE),
    );
    return imageToVideo.length > 0 ? imageToVideo : pool;
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
        ...(projectId ? { projectId } : {}),
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
        <StudioInputActionTooltip label="Clip duration">
          <DropdownMenuTrigger asChild>
            <PromptInputButton
              aria-label={`Duration ${duration} seconds`}
              className={STUDIO_TOOL_BUTTON_CLASS}
              disabled={isPending}
              size="xs"
              type="button"
            >
              <span className="text-[12px] font-medium leading-none tracking-[-0.015em] tabular-nums">
                {duration}s
              </span>
              <ChevronDownIcon className={STUDIO_TOOL_CHEVRON_CLASS} />
            </PromptInputButton>
          </DropdownMenuTrigger>
        </StudioInputActionTooltip>
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
        className={cn(
          STUDIO_TOOL_BUTTON_CLASS,
          generateAudio && STUDIO_TOOL_BUTTON_ACTIVE_CLASS,
        )}
        disabled={isPending}
        onClick={() => setGenerateAudio((current) => !current)}
        size="xs"
        tooltip={
          generateAudio
            ? "Audio on — generate sound with the clip"
            : "Muted — video only, no generated audio"
        }
        type="button"
      >
        {generateAudio ? (
          <Volume2Icon className="size-3.5" />
        ) : (
          <VolumeXIcon className="size-3.5" />
        )}
        <span className="text-[12px] font-medium leading-none tracking-[-0.015em]">
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
    <div className="video-studio-prompt">
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
        submitTitle="Generate"
        submitAppearance="send"
        footerClassName="border-transparent bg-transparent px-2.5 pb-2 pt-1 sm:px-3"
        tools={tools}
        textareaRef={(node) => {
          textareaRef.current = node;
        }}
        composerRef={composerRef}
        emptyTitle="No video models yet"
        emptyDescription="Add a text-to-video or image-to-video model in the manager to start creating clips."
        surfaceClassName={STUDIO_HOME_COMPOSER_SURFACE_CLASS}
      />

      {attachedImages.length > 0 ? (
        <div className="mt-2.5 px-0.5">
          <StudioReferenceTagHint attachmentCount={attachedImages.length} />
        </div>
      ) : null}

      <div className="mt-4 flex flex-col items-center gap-4">
        <VideoStudioStarters disabled={isPending} />

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
          <VideoPromptAnatomy />
        </div>
      </div>
    </div>
  );
}

const VideoGenerationPromptInput = ({
  models,
  initialAttachmentUrl,
}: {
  models: Model[];
  initialAttachmentUrl?: string;
}) => {
  if (models.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-black/[0.08] bg-black/[0.015] px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.015]">
        <div className="mx-auto mb-4 flex size-9 items-center justify-center rounded-lg bg-black/[0.03] ring-1 ring-black/8 dark:bg-white/[0.03] dark:ring-white/10">
          <SparklesIcon className="size-3.5 text-black/48 dark:text-white/48" />
        </div>
        <p className="text-[15px] font-medium tracking-[-0.02em] text-foreground">
          No video models yet
        </p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-[1.55] tracking-[-0.01em] text-black/48 dark:text-white/48">
          Add a text-to-video or image-to-video model in the manager to start
          creating social clips.
        </p>
      </div>
    );
  }

  return (
    <PromptInputProvider>
      <VideoPromptComposer
        initialAttachmentUrl={initialAttachmentUrl}
        models={models}
      />
    </PromptInputProvider>
  );
};

export default VideoGenerationPromptInput;
