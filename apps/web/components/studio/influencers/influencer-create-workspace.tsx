"use client";

import {
  PromptInputProvider,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import type { AttachedMedia } from "@/components/files/attach-images-dialog";
import { DASHBOARD_ROUTES } from "@/constants/app-routes";
import {
  AGE_RANGE_OPTIONS,
  ETHNICITY_OPTIONS,
  GENDER_OPTIONS,
  HAIR_COLOR_OPTIONS,
  EYE_COLOR_OPTIONS,
  INFLUENCER_PROMPT_PLACEHOLDER,
  SKIN_TONE_OPTIONS,
  labelForSwatch,
} from "@/lib/studio/influencers/options";
import { FIELD_ICONS } from "@/lib/studio/influencers/option-icons";
import {
  cloneDefaultForm,
  clonePresetForm,
  randomizeInfluencerForm,
  type InfluencerCreateFormState,
  type InfluencerPreset,
} from "@/lib/studio/influencers/presets";
import { createInfluencer } from "@/services/influencer.service";
import { getProjectId, useProjectStore } from "@/store/project.store";
import { commitHaptic } from "@/utils/haptics";
import type {
  InfluencerAgeRange,
  InfluencerGender,
  Model,
} from "@socialista/types";
import {
  INFLUENCER_DEFAULT_MODEL,
  INFLUENCER_GENERATION_SHOT_COUNT,
  INFLUENCER_GENERATION_SHOT_MAX,
  INFLUENCER_GENERATION_SHOT_MIN,
  INFLUENCER_MAX_USER_REFERENCE_IMAGES,
} from "@socialista/types";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { StudioPromptComposer } from "@/components/studio/prompt/studio-prompt-composer";
import { InfluencerCreateForm } from "./influencer-create-form";
import {
  AdvancedCollapsible,
  FieldLabel,
  OptionSegmented,
} from "./influencer-option-controls";
import { InfluencerPresetStrip } from "./influencer-preset-strip";

type InfluencerCreateWorkspaceProps = {
  workspaceId: string;
  models: Model[];
};

const FEATURE_MAX = 3;

function suggestNameFromPrompt(prompt: string): string {
  const trimmed = prompt.trim();
  if (!trimmed) return "My Influencer";
  const words = trimmed.split(/\s+/).slice(0, 3);
  const candidate = words
    .map((w) => w.replace(/[^a-zA-Z'-]/g, ""))
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  return candidate.length >= 2 ? candidate : "My Influencer";
}

export function InfluencerCreateWorkspace({
  workspaceId,
  models,
}: InfluencerCreateWorkspaceProps) {
  const router = useRouter();
  const projectId = useProjectStore((s) => getProjectId(s.currentProject));
  const [pending, startTransition] = useTransition();
  const [referenceImages, setReferenceImages] = useState<AttachedMedia[]>([]);
  const [form, setForm] = useState<InfluencerCreateFormState>(cloneDefaultForm);
  const [composerKey, setComposerKey] = useState("initial");
  const [promptSeed, setPromptSeed] = useState("");
  const [featureDraft, setFeatureDraft] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [shotCount, setShotCount] = useState(INFLUENCER_GENERATION_SHOT_COUNT);
  const [selectedModelId, setSelectedModelId] = useState(() => {
    const preferred = models.find((m) => m.value === INFLUENCER_DEFAULT_MODEL);
    return preferred?._id ?? models[0]?._id ?? "";
  });

  const selectedModel = useMemo(
    () => models.find((m) => m._id === selectedModelId) ?? models[0],
    [models, selectedModelId],
  );

  const showFacialHair = form.gender === "male";
  const showMakeup = form.gender === "female" || form.gender === "non-binary";

  function updateAppearance<
    K extends keyof InfluencerCreateFormState["appearance"],
  >(key: K, value: InfluencerCreateFormState["appearance"][K]) {
    setForm((prev) => ({
      ...prev,
      appearance: { ...prev.appearance, [key]: value },
    }));
  }

  function addFeature(raw: string) {
    const tag = raw.trim().toLowerCase();
    if (!tag) return;
    if (
      form.appearance.distinguishingFeatures.includes(tag) ||
      form.appearance.distinguishingFeatures.length >= FEATURE_MAX
    ) {
      setFeatureDraft("");
      return;
    }
    updateAppearance("distinguishingFeatures", [
      ...form.appearance.distinguishingFeatures,
      tag,
    ]);
    setFeatureDraft("");
  }

  function removeFeature(tag: string) {
    updateAppearance(
      "distinguishingFeatures",
      form.appearance.distinguishingFeatures.filter((f) => f !== tag),
    );
  }

  function applyPreset(preset: InfluencerPreset) {
    commitHaptic({});
    const next = clonePresetForm(preset);
    setForm(next);
    setPromptSeed(next.directions.trim());
    setComposerKey(preset.id);
    setSelectedPresetId(preset.id);
    toast.success(`Loaded ${preset.title}`);
  }

  function handleSurprise() {
    commitHaptic({});
    const next = randomizeInfluencerForm();
    setForm(next);
    setPromptSeed(next.directions.trim());
    setComposerKey(`surprise-${Date.now()}`);
    setSelectedPresetId("surprise");
    toast.success("Randomized — tweak anything you like");
  }

  function handleSubmit(message: PromptInputMessage) {
    const promptText = message.text.trim();
    const hasReferences = referenceImages.length > 0;
    const hasNiche = form.niche.length > 0;

    if (!promptText && !hasReferences && !hasNiche) {
      toast.error("Describe the creator, attach a reference, or pick a niche");
      return;
    }
    if (!selectedModel) {
      toast.error("Select a generation model");
      return;
    }

    const trimmedName =
      form.name.trim() ||
      (promptText ? suggestNameFromPrompt(promptText) : "My Influencer");
    const niche = hasNiche ? form.niche : hasReferences ? ["lifestyle"] : [];

    startTransition(async () => {
      commitHaptic({});
      const response = await createInfluencer({
        workspaceId,
        projectId,
        model: selectedModel.value,
        name: trimmedName,
        bio: form.bio.trim() || undefined,
        directions: promptText || form.directions.trim() || undefined,
        gender: form.gender,
        ageRange: form.ageRange,
        niche,
        scenes: form.scenes.length > 0 ? form.scenes : undefined,
        ethnicity: form.ethnicity.trim()
          ? (ETHNICITY_OPTIONS.find((o) => o.id === form.ethnicity.trim())
              ?.label ?? form.ethnicity.trim())
          : undefined,
        appearance: {
          hairColor: labelForSwatch(
            HAIR_COLOR_OPTIONS,
            form.appearance.hairColor,
          ),
          hairStyle: form.appearance.hairStyle,
          eyeColor: labelForSwatch(EYE_COLOR_OPTIONS, form.appearance.eyeColor),
          skinTone: labelForSwatch(SKIN_TONE_OPTIONS, form.appearance.skinTone),
          bodyShape: form.appearance.bodyShape,
          height: form.appearance.height,
          distinguishingFeatures: form.appearance.distinguishingFeatures,
          facialHair: showFacialHair ? form.appearance.facialHair : undefined,
          makeup: showMakeup ? form.appearance.makeup : undefined,
          accessories:
            form.appearance.accessories.length > 0
              ? form.appearance.accessories
              : undefined,
        },
        aestheticTags: form.aestheticTags,
        photoStyle: form.photoStyle,
        shotCount,
        ...(hasReferences
          ? {
              userReferenceImageUrls: referenceImages.map((image) => image.url),
            }
          : {}),
      });

      if (!response.success || !response.data?.influencer) {
        toast.error(response.message ?? "Failed to create influencer");
        return;
      }

      toast.success("Generating your influencer…");
      router.push(
        DASHBOARD_ROUTES.STUDIO.influencer(response.data.influencer._id),
      );
    });
  }

  return (
    <div className="image-studio relative flex w-full flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-140 overflow-hidden"
      >
        <div className="absolute left-1/2 -top-32 h-112 w-200 -translate-x-1/2 rounded-full bg-foreground/[0.022] blur-[100px]" />
      </div>
      <div className="relative mx-auto w-full max-w-2xl px-4 pb-16 pt-5 sm:px-6 sm:pt-8">
        <header className="mb-6">
          <Link
            href={DASHBOARD_ROUTES.STUDIO.INFLUENCERS}
            className="group mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon
              className="size-3.5 transition-transform duration-150 group-hover:-translate-x-0.5 group-active:scale-95"
              strokeWidth={1.75}
            />
            Influencers
          </Link>

          <h1 className="font-serif text-balance text-[1.75rem] font-medium leading-[1.1] tracking-[-0.022em] text-foreground sm:text-[2rem] sm:leading-[1.08]">
            Create your influencer
          </h1>
          <p className="mt-2 max-w-md text-pretty text-[14px] leading-relaxed text-muted-foreground">
            Describe the person, attach a face or style reference, then generate
            consistent portraits.
          </p>
        </header>

        <div className="mb-6">
          <InfluencerPresetStrip
            selectedId={selectedPresetId}
            onSelect={applyPreset}
            onSurprise={handleSurprise}
            disabled={pending}
          />
        </div>

        <PromptInputProvider key={composerKey} initialInput={promptSeed}>
          <StudioPromptComposer
            models={models}
            selectedModelId={selectedModelId}
            onSelectedModelChange={setSelectedModelId}
            attachments={referenceImages}
            onAttachmentsChange={setReferenceImages}
            attachSources={["upload", "library", "influencer"]}
            maxAttachments={INFLUENCER_MAX_USER_REFERENCE_IMAGES}
            workspaceId={workspaceId}
            count={{
              value: shotCount,
              min: INFLUENCER_GENERATION_SHOT_MIN,
              max: INFLUENCER_GENERATION_SHOT_MAX,
              onChange: setShotCount,
              label: "Portraits",
            }}
            placeholder={INFLUENCER_PROMPT_PLACEHOLDER}
            disabled={pending}
            pending={pending}
            onSubmit={handleSubmit}
            submitLabel={
              shotCount === 1
                ? "Generate portrait"
                : `Generate ${shotCount} portraits`
            }
            canSubmit={referenceImages.length > 0 || form.niche.length > 0}
            emptyTitle="No image models available"
            emptyDescription="Add an image generation model to create AI influencers."
          />
        </PromptInputProvider>

        <fieldset
          disabled={pending}
          className="mt-6 grid grid-cols-1 gap-4 border-0 p-0 sm:grid-cols-2 disabled:opacity-60"
        >
          <div>
            <FieldLabel icon={FIELD_ICONS.gender}>Gender</FieldLabel>
            <OptionSegmented
              aria-label="Gender"
              value={form.gender}
              options={GENDER_OPTIONS}
              onChange={(v: InfluencerGender) =>
                setForm((prev) => ({ ...prev, gender: v }))
              }
              layoutId="form-gender-indicator"
            />
          </div>
          <div>
            <FieldLabel icon={FIELD_ICONS.age}>Age</FieldLabel>
            <OptionSegmented
              aria-label="Age range"
              value={form.ageRange}
              options={AGE_RANGE_OPTIONS}
              onChange={(v: InfluencerAgeRange) =>
                setForm((prev) => ({ ...prev, ageRange: v }))
              }
              layoutId="form-age-indicator"
            />
          </div>
        </fieldset>

        <div className="mt-6">
          <AdvancedCollapsible label="Look" icon={FIELD_ICONS.skinTone}>
            <InfluencerCreateForm
              form={form}
              featureDraft={featureDraft}
              onFeatureDraftChange={setFeatureDraft}
              onFormChange={setForm}
              onUpdateAppearance={updateAppearance}
              onAddFeature={addFeature}
              onRemoveFeature={removeFeature}
              hasStyleReferences={referenceImages.length > 0}
              disabled={pending}
            />
          </AdvancedCollapsible>
        </div>
      </div>
    </div>
  );
}
