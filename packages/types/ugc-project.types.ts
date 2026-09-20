import type { VideoResolution } from "./video-generation.types.js";

export const UGC_PROJECT_STATUSES = [
  "draft",
  "generating",
  "ready",
  "failed",
] as const;
export type UgcProjectStatus = (typeof UGC_PROJECT_STATUSES)[number];

export const UGC_CLIP_STATUSES = [
  "idle",
  "queued",
  "generating",
  "ready",
  "failed",
] as const;
export type UgcClipStatus = (typeof UGC_CLIP_STATUSES)[number];

/** @deprecated Use UgcClipStatus. Kept for older variant-shaped documents. */
export const UGC_VARIANT_STATUSES = UGC_CLIP_STATUSES;
export type UgcVariantStatus = UgcClipStatus;

export const UGC_SCRIPT_SOURCES = ["user", "ai"] as const;
export type UgcScriptSource = (typeof UGC_SCRIPT_SOURCES)[number];

export const UGC_CLIP_TYPES = [
  "hook",
  "talking",
  "product-hold",
  "b-roll",
  "unboxing",
  "cta",
  "demo",
  "try-on",
  "review",
  "reaction",
  "before-after",
  "app-showcase",
  "custom",
] as const;
export type UgcClipType = (typeof UGC_CLIP_TYPES)[number];

export const UGC_PRODUCT_KINDS = ["physical", "app", "website"] as const;
export type UgcProductKind = (typeof UGC_PRODUCT_KINDS)[number];

export const UGC_FLOW_STEPS = [
  "product",
  "scenes",
  "avatar",
  "script",
  "stills",
  "review",
  "video",
] as const;
export type UgcFlowStep = (typeof UGC_FLOW_STEPS)[number];

export const UGC_SCENE_COUNTS = [1, 2, 3] as const;
export type UgcSceneCount = (typeof UGC_SCENE_COUNTS)[number];

export const UGC_SCENE_GROUPS = [
  "opener",
  "talking",
  "product",
  "proof",
  "close",
  "screen",
  "custom",
] as const;
export type UgcSceneGroup = (typeof UGC_SCENE_GROUPS)[number];

export const UGC_SCENE_GROUP_LABELS: Record<UgcSceneGroup, string> = {
  opener: "Openers",
  talking: "To camera",
  product: "Product",
  proof: "Proof",
  close: "Close",
  screen: "Screen",
  custom: "Custom",
};

export type UgcSceneSetting =
  | "creator"
  | "product"
  | "screenshots"
  | "script"
  | "voice"
  | "onScreenText";

export type UgcSceneDefinition = {
  type: UgcClipType;
  label: string;
  shortLabel: string;
  description: string;
  group: UgcSceneGroup;
  primary: boolean;
  defaultDurationSec: number;
  defaultSceneCount: UgcSceneCount;
  requiresCreator: boolean;
  requiresProduct: boolean;
  requiresScreenshots: boolean;
  showsScript: boolean;
  requiresScript: boolean;
  usesLipSync: boolean;
  showsOnScreenText: boolean;
};

function defineUgcScene(
  type: UgcClipType,
  definition: Omit<UgcSceneDefinition, "type">,
): UgcSceneDefinition {
  return { type, ...definition };
}

export const UGC_SCENE_CATALOG: Record<UgcClipType, UgcSceneDefinition> = {
  hook: defineUgcScene("hook", {
    label: "Hook",
    shortLabel: "Hook",
    description: "A punchy opening line to camera that stops the scroll",
    group: "opener",
    primary: true,
    defaultDurationSec: 5,
    defaultSceneCount: 1,
    requiresCreator: true,
    requiresProduct: false,
    requiresScreenshots: false,
    showsScript: true,
    requiresScript: true,
    usesLipSync: true,
    showsOnScreenText: false,
  }),
  talking: defineUgcScene("talking", {
    label: "Talking head",
    shortLabel: "Talk",
    description: "Face the camera and talk — product nearby is optional",
    group: "talking",
    primary: true,
    defaultDurationSec: 8,
    defaultSceneCount: 1,
    requiresCreator: true,
    requiresProduct: false,
    requiresScreenshots: false,
    showsScript: true,
    requiresScript: true,
    usesLipSync: true,
    showsOnScreenText: false,
  }),
  "product-hold": defineUgcScene("product-hold", {
    label: "Product in hand",
    shortLabel: "In hand",
    description: "Hold the product up and talk about it",
    group: "product",
    primary: true,
    defaultDurationSec: 8,
    defaultSceneCount: 1,
    requiresCreator: true,
    requiresProduct: true,
    requiresScreenshots: false,
    showsScript: true,
    requiresScript: true,
    usesLipSync: true,
    showsOnScreenText: false,
  }),
  "b-roll": defineUgcScene("b-roll", {
    label: "Product b-roll",
    shortLabel: "B-roll",
    description: "Product-only beauty shots — no talking to camera",
    group: "product",
    primary: true,
    defaultDurationSec: 6,
    defaultSceneCount: 1,
    requiresCreator: false,
    requiresProduct: true,
    requiresScreenshots: false,
    showsScript: true,
    requiresScript: false,
    usesLipSync: false,
    showsOnScreenText: false,
  }),
  unboxing: defineUgcScene("unboxing", {
    label: "Unboxing",
    shortLabel: "Unbox",
    description: "Open the box or mailer on camera",
    group: "product",
    primary: true,
    defaultDurationSec: 8,
    defaultSceneCount: 1,
    requiresCreator: true,
    requiresProduct: true,
    requiresScreenshots: false,
    showsScript: true,
    requiresScript: true,
    usesLipSync: true,
    showsOnScreenText: false,
  }),
  cta: defineUgcScene("cta", {
    label: "Call to action",
    shortLabel: "CTA",
    description: "Close with a clear ask to camera",
    group: "close",
    primary: true,
    defaultDurationSec: 6,
    defaultSceneCount: 1,
    requiresCreator: true,
    requiresProduct: false,
    requiresScreenshots: false,
    showsScript: true,
    requiresScript: true,
    usesLipSync: true,
    showsOnScreenText: false,
  }),
  demo: defineUgcScene("demo", {
    label: "Product demo",
    shortLabel: "Demo",
    description: "Use the product so the viewer sees how it works",
    group: "product",
    primary: false,
    defaultDurationSec: 10,
    defaultSceneCount: 1,
    requiresCreator: true,
    requiresProduct: true,
    requiresScreenshots: false,
    showsScript: true,
    requiresScript: true,
    usesLipSync: true,
    showsOnScreenText: false,
  }),
  "try-on": defineUgcScene("try-on", {
    label: "Try-on",
    shortLabel: "Try-on",
    description: "Wear, apply, or put it on on camera",
    group: "product",
    primary: false,
    defaultDurationSec: 8,
    defaultSceneCount: 1,
    requiresCreator: true,
    requiresProduct: true,
    requiresScreenshots: false,
    showsScript: true,
    requiresScript: true,
    usesLipSync: true,
    showsOnScreenText: false,
  }),
  review: defineUgcScene("review", {
    label: "Review",
    shortLabel: "Review",
    description: "Honest take with one specific result",
    group: "talking",
    primary: false,
    defaultDurationSec: 8,
    defaultSceneCount: 1,
    requiresCreator: true,
    requiresProduct: false,
    requiresScreenshots: false,
    showsScript: true,
    requiresScript: true,
    usesLipSync: true,
    showsOnScreenText: false,
  }),
  reaction: defineUgcScene("reaction", {
    label: "First reaction",
    shortLabel: "React",
    description: "First look or first use — a real reaction",
    group: "proof",
    primary: false,
    defaultDurationSec: 6,
    defaultSceneCount: 1,
    requiresCreator: true,
    requiresProduct: true,
    requiresScreenshots: false,
    showsScript: true,
    requiresScript: true,
    usesLipSync: true,
    showsOnScreenText: false,
  }),
  "before-after": defineUgcScene("before-after", {
    label: "Before & after",
    shortLabel: "Before/after",
    description: "Show the before, then the after",
    group: "proof",
    primary: false,
    defaultDurationSec: 8,
    defaultSceneCount: 1,
    requiresCreator: true,
    requiresProduct: true,
    requiresScreenshots: false,
    showsScript: true,
    requiresScript: true,
    usesLipSync: true,
    showsOnScreenText: false,
  }),
  "app-showcase": defineUgcScene("app-showcase", {
    label: "App on screen",
    shortLabel: "App",
    description: "Show the app or site on a phone",
    group: "screen",
    primary: false,
    defaultDurationSec: 8,
    defaultSceneCount: 1,
    requiresCreator: false,
    requiresProduct: false,
    requiresScreenshots: true,
    showsScript: true,
    requiresScript: false,
    usesLipSync: false,
    showsOnScreenText: false,
  }),
  custom: defineUgcScene("custom", {
    label: "Custom",
    shortLabel: "Custom",
    description: "Your own shot — look, motion, and talking are up to you",
    group: "custom",
    primary: false,
    defaultDurationSec: 8,
    defaultSceneCount: 1,
    requiresCreator: false,
    requiresProduct: false,
    requiresScreenshots: false,
    showsScript: true,
    requiresScript: false,
    usesLipSync: true,
    showsOnScreenText: false,
  }),
};

export const UGC_MAX_VARIANTS = 3;
export const UGC_MAX_SCENES = 3;
export const UGC_MAX_CLIPS = 12;
export const UGC_AD_PLAN_SCENE_MAX = 3;
export const UGC_AD_PLAN_FORMATS = [
  "problem-solution",
  "pov",
  "unboxing",
  "grwm",
  "testimonial",
  "hook-retain-reward",
  "before-after",
] as const;
export type UgcAdPlanFormat = (typeof UGC_AD_PLAN_FORMATS)[number];
export const UGC_MAX_STILL_VERSIONS = 24;
export const UGC_MAX_AUDIO_TAKES = 20;
export const UGC_MAX_VIDEO_TAKES = 12;
export const UGC_DEFAULT_SCENE_COUNT: UgcSceneCount = 1;
export const UGC_DEFAULT_ASPECT_RATIO = "9:16" as const;
export const UGC_DURATION_MIN = 5;
export const UGC_DURATION_MAX = 15;
export const UGC_DEFAULT_DURATION = 8;
export const UGC_SCRIPT_MAX_CHARS = 150;
export const UGC_TALKING_HEAD_SCRIPT_MAX_CHARS = 300;
export const UGC_SPOKEN_CHARS_PER_SEC = 12;

function catalogField<K extends keyof UgcSceneDefinition>(
  key: K,
): Record<UgcClipType, UgcSceneDefinition[K]> {
  return Object.fromEntries(
    UGC_CLIP_TYPES.map((type) => [type, UGC_SCENE_CATALOG[type][key]]),
  ) as Record<UgcClipType, UgcSceneDefinition[K]>;
}

export const UGC_CLIP_DEFAULT_SCENE_COUNT = catalogField("defaultSceneCount");
export const UGC_CLIP_TYPE_LABELS = catalogField("label");
export const UGC_CLIP_TYPE_SHORT_LABELS = catalogField("shortLabel");
export const UGC_CLIP_TYPE_DESCRIPTIONS = catalogField("description");

export const UGC_DEFAULT_CLIP_TYPE: UgcClipType = "talking";

export function ugcClipUsesTalkingHeadModel(type: UgcClipType): boolean {
  return type === "talking";
}

export const UGC_STARTER_SCENE_TYPES: UgcClipType[] = [
  "talking",
  "product-hold",
  "b-roll",
];

export const UGC_PRIMARY_SCENE_TYPES: UgcClipType[] = UGC_CLIP_TYPES.filter(
  (type) => UGC_SCENE_CATALOG[type].primary,
);

export const UGC_EXTRA_SCENE_TYPES: UgcClipType[] = UGC_CLIP_TYPES.filter(
  (type) => !UGC_SCENE_CATALOG[type].primary,
);

export const UGC_SCENE_TYPES_BY_GROUP: Array<{
  group: UgcSceneGroup;
  types: UgcClipType[];
}> = UGC_SCENE_GROUPS.map((group) => ({
  group,
  types: UGC_CLIP_TYPES.filter((type) => UGC_SCENE_CATALOG[type].group === group),
})).filter((entry) => entry.types.length > 0);

export function ugcSceneDefinition(type: UgcClipType): UgcSceneDefinition {
  return UGC_SCENE_CATALOG[type];
}

export function ugcSceneDefaultDurationSec(type: UgcClipType): number {
  return UGC_SCENE_CATALOG[type].defaultDurationSec;
}

export function ugcClipTypesWhere(
  predicate: (scene: UgcSceneDefinition) => boolean,
): UgcClipType[] {
  return UGC_CLIP_TYPES.filter((type) => predicate(UGC_SCENE_CATALOG[type]));
}

export function parseUgcClipType(value: unknown): UgcClipType | undefined {
  if (
    typeof value === "string" &&
    (UGC_CLIP_TYPES as readonly string[]).includes(value)
  ) {
    return value as UgcClipType;
  }
  return undefined;
}

/** Map a slug, label, or short label to a catalog type. */
export function coerceUgcClipType(value: unknown): UgcClipType | undefined {
  const parsed = parseUgcClipType(value);
  if (parsed) return parsed;
  if (typeof value !== "string") return undefined;
  const needle = value.trim().toLowerCase().replace(/[_]+/g, "-");
  if (!needle) return undefined;
  return UGC_CLIP_TYPES.find((type) => {
    const scene = UGC_SCENE_CATALOG[type];
    return (
      scene.label.toLowerCase() === needle ||
      scene.shortLabel.toLowerCase() === needle ||
      type.replace(/-/g, " ") === needle.replace(/-/g, " ")
    );
  });
}

export function ugcCatalogSceneName(
  type: UgcClipType,
  occurrence = 1,
): string {
  const label = UGC_CLIP_TYPE_LABELS[type];
  return occurrence > 1 ? `${label} ${occurrence}` : label;
}

export function ugcPlannableClipTypes(opts: {
  hasProduct: boolean;
  productKind?: string | null;
}): UgcClipType[] {
  const hasAppUi = opts.productKind === "app" || opts.productKind === "website";
  return UGC_CLIP_TYPES.filter((type) => {
    const scene = UGC_SCENE_CATALOG[type];
    if (scene.requiresScreenshots && !hasAppUi) return false;
    if (!opts.hasProduct && scene.requiresProduct) return false;
    return true;
  });
}

export function formatUgcSceneCatalogForPrompt(
  types: readonly UgcClipType[] = UGC_CLIP_TYPES,
): string {
  return types
    .map((type) => {
      const scene = UGC_SCENE_CATALOG[type];
      const script = scene.requiresScript
        ? "Spoken script required."
        : scene.showsScript
          ? "Optional voiceover. Empty script if silent."
          : "Empty script.";
      return `- ${type} (${scene.label}): ${scene.description}. ~${scene.defaultDurationSec}s. ${script}`;
    })
    .join("\n");
}

export const UGC_FLOW_STEP_LABELS: Record<UgcFlowStep, string> = {
  product: "Product",
  scenes: "Scenes",
  avatar: "Creator",
  script: "Script",
  stills: "Photos",
  review: "Review",
  video: "Render",
};

export const UGC_PRODUCT_KIND_LABELS: Record<UgcProductKind, string> = {
  physical: "Physical product",
  app: "App",
  website: "Website",
};

export const UGC_VOICE_PROVIDERS = ["elevenlabs"] as const;
export type UgcVoiceProvider = (typeof UGC_VOICE_PROVIDERS)[number];

export const UGC_CLIP_STORYBOARD_STATUSES = [
  "setup",
  "photos",
  "script",
  "ready",
  "generating",
] as const;
export type UgcClipStoryboardStatus =
  (typeof UGC_CLIP_STORYBOARD_STATUSES)[number];

export const UGC_CLIP_STORYBOARD_LABELS: Record<
  UgcClipStoryboardStatus,
  string
> = {
  setup: "Setup",
  photos: "Photos",
  script: "Script",
  ready: "Ready",
  generating: "Generating",
};

export const UGC_AUDIO_MODES = ["none", "lip-sync", "voiceover"] as const;
export type UgcAudioMode = (typeof UGC_AUDIO_MODES)[number];

export function ugcClipRequiresCreator(type: UgcClipType): boolean {
  return UGC_SCENE_CATALOG[type].requiresCreator;
}

export function ugcClipShowsScript(type: UgcClipType): boolean {
  return UGC_SCENE_CATALOG[type].showsScript;
}

export function ugcClipRequiresScript(type: UgcClipType): boolean {
  return UGC_SCENE_CATALOG[type].requiresScript;
}

export function ugcClipRequiresProduct(type: UgcClipType): boolean {
  return UGC_SCENE_CATALOG[type].requiresProduct;
}

export function ugcClipRequiresScreenshots(type: UgcClipType): boolean {
  return UGC_SCENE_CATALOG[type].requiresScreenshots;
}

export function ugcClipUsesLipSync(type: UgcClipType): boolean {
  return UGC_SCENE_CATALOG[type].usesLipSync;
}

export function ugcClipShowsOnScreenText(type: UgcClipType): boolean {
  return UGC_SCENE_CATALOG[type].showsOnScreenText;
}

export function ugcClipIsFreeform(type: UgcClipType): boolean {
  return UGC_SCENE_CATALOG[type].group === "custom";
}

export function ugcSceneHasSetting(
  type: UgcClipType,
  setting: UgcSceneSetting,
): boolean {
  const scene = UGC_SCENE_CATALOG[type];
  switch (setting) {
    case "creator":
      return scene.requiresCreator;
    case "product":
      return scene.requiresProduct;
    case "screenshots":
      return scene.requiresScreenshots;
    case "script":
      return scene.showsScript;
    case "voice":
      return scene.showsScript && !scene.showsOnScreenText;
    case "onScreenText":
      return scene.showsOnScreenText;
  }
}

export function ugcClipGeneratesAudio(type: UgcClipType): boolean {
  return ugcClipShowsScript(type) && !ugcClipShowsOnScreenText(type);
}

export function ugcClipAudioMode(
  type: UgcClipType,
  hasAudio: boolean,
): UgcAudioMode {
  if (!hasAudio) return "none";
  return ugcClipUsesLipSync(type) ? "lip-sync" : "voiceover";
}

export function ugcScriptMaxChars(type?: UgcClipType): number {
  return type && ugcClipUsesTalkingHeadModel(type)
    ? UGC_TALKING_HEAD_SCRIPT_MAX_CHARS
    : UGC_SCRIPT_MAX_CHARS;
}

export function ugcScriptTargetChars(
  durationSec: number,
  type?: UgcClipType,
): number {
  if (type && ugcClipUsesTalkingHeadModel(type)) {
    return UGC_TALKING_HEAD_SCRIPT_MAX_CHARS;
  }
  const spokenWindow = Math.min(10, Math.max(UGC_DURATION_MIN, durationSec));
  return Math.min(
    UGC_SCRIPT_MAX_CHARS,
    Math.round(spokenWindow * UGC_SPOKEN_CHARS_PER_SEC),
  );
}

export function clampUgcDuration(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return UGC_DEFAULT_DURATION;
  return Math.min(UGC_DURATION_MAX, Math.max(UGC_DURATION_MIN, Math.round(n)));
}

export function clampUgcScript(text: string, type?: UgcClipType): string {
  return text.slice(0, ugcScriptMaxChars(type));
}

/** Seconds to bill a talking-head render. Undefined until voiceover exists. */
export function ugcTalkingHeadBillableDurationSec(clip: {
  audioUrl?: string;
  audioDurationSec?: number;
  audioTakes?: Array<{ audioUrl?: string; durationSec?: number }>;
}): number | undefined {
  if (!clip.audioUrl) return undefined;
  const takeDuration = clip.audioTakes?.find(
    (take) => take.audioUrl === clip.audioUrl,
  )?.durationSec;
  const n =
    typeof clip.audioDurationSec === "number" &&
    Number.isFinite(clip.audioDurationSec) &&
    clip.audioDurationSec > 0
      ? clip.audioDurationSec
      : takeDuration;
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return undefined;
  return Math.max(1, Math.round(n));
}

export function estimateUgcSpokenDurationSec(text: string, speed = 1): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;
  const rate = Math.max(0.7, Math.min(1.2, speed)) * 2.5;
  return Math.max(1, Math.round((words / rate) * 10) / 10);
}

export function clampUgcSceneCount(
  value: unknown,
  fallback: UgcSceneCount = UGC_DEFAULT_SCENE_COUNT,
): UgcSceneCount {
  if (value === 1 || value === 2 || value === 3) return value;
  const n = Number(value);
  if (n === 1 || n === 2 || n === 3) return n;
  return fallback;
}

export function ugcResolvedInfluencerId(
  project: { influencerId?: string },
  clip?: { influencerId?: string },
): string | undefined {
  return clip?.influencerId ?? project.influencerId;
}

/** Defaults tuned for conversational UGC (ElevenLabs 0–100 scale). */
export const UGC_DEFAULT_VOICE: UgcClipVoice = {
  provider: "elevenlabs",
  voiceId: "21m00Tcm4TlvDq8ikWAM",
  voiceName: "Rachel",
  speed: 1.05,
  stability: 45,
  similarity: 75,
  style: 15,
  speakerBoost: true,
  enabled: true,
};

export function ugcResolvedClipVoice(
  project: { voice?: UgcClipVoice },
  clip?: { voice?: UgcClipVoice },
): UgcClipVoice {
  return {
    ...UGC_DEFAULT_VOICE,
    ...project.voice,
    ...clip?.voice,
  };
}

export const UGC_CAMPAIGN_PRESET_IDS = [
  "problem-solution",
  "unboxing-review",
  "viral-hook",
  "b-roll-showcase",
] as const;
export type UgcCampaignPresetId = (typeof UGC_CAMPAIGN_PRESET_IDS)[number];

export type UgcCampaignPresetBeat = {
  type: UgcClipType;
  durationSec: number;
  name: string;
};

export type UgcCampaignPreset = {
  id: UgcCampaignPresetId;
  label: string;
  description: string;
  beats: UgcCampaignPresetBeat[];
};

export const UGC_CAMPAIGN_PRESETS: UgcCampaignPreset[] = [
  {
    id: "problem-solution",
    label: "Problem → Solution",
    description: "Hook the pain, show the product, close with a CTA.",
    beats: [
      { type: "talking", durationSec: 6, name: "Hook" },
      { type: "product-hold", durationSec: 8, name: "Demo" },
      { type: "cta", durationSec: 6, name: "CTA" },
    ],
  },
  {
    id: "unboxing-review",
    label: "Unboxing & Review",
    description: "Open the box, show details, give a verdict.",
    beats: [
      { type: "unboxing", durationSec: 8, name: "Unbox" },
      { type: "b-roll", durationSec: 6, name: "Details" },
      { type: "review", durationSec: 7, name: "Verdict" },
    ],
  },
  {
    id: "viral-hook",
    label: "Viral Hook",
    description: "Fast opener, product showcase, punchy ask.",
    beats: [
      { type: "hook", durationSec: 5, name: "Hook" },
      { type: "product-hold", durationSec: 7, name: "Showcase" },
      { type: "cta", durationSec: 5, name: "CTA" },
    ],
  },
  {
    id: "b-roll-showcase",
    label: "Product B-roll",
    description: "Aesthetic product shots with a hold-to-camera close.",
    beats: [
      { type: "b-roll", durationSec: 6, name: "B-roll 1" },
      { type: "b-roll", durationSec: 6, name: "B-roll 2" },
      { type: "product-hold", durationSec: 6, name: "Hold" },
    ],
  },
];

export function parseUgcCampaignPresetId(
  value: unknown,
): UgcCampaignPresetId | undefined {
  if (
    typeof value === "string" &&
    (UGC_CAMPAIGN_PRESET_IDS as readonly string[]).includes(value)
  ) {
    return value as UgcCampaignPresetId;
  }
  return undefined;
}

export function parseUgcProductKind(
  value: unknown,
): UgcProductKind | undefined {
  if (
    typeof value === "string" &&
    (UGC_PRODUCT_KINDS as readonly string[]).includes(value)
  ) {
    return value as UgcProductKind;
  }
  return undefined;
}

export function parseUgcFlowStep(value: unknown): UgcFlowStep | undefined {
  if (
    typeof value === "string" &&
    (UGC_FLOW_STEPS as readonly string[]).includes(value)
  ) {
    return value as UgcFlowStep;
  }
  return undefined;
}

export function inferUgcProductKind(input: {
  url?: string;
  description?: string;
}): UgcProductKind {
  const url = input.url?.toLowerCase() ?? "";
  const text = `${url} ${input.description ?? ""}`.toLowerCase();
  if (
    url.includes("apps.apple.com") ||
    url.includes("play.google.com") ||
    text.includes(" mobile app") ||
    text.includes("ios app") ||
    text.includes("android app")
  ) {
    return "app";
  }
  if (url.startsWith("http://") || url.startsWith("https://")) return "website";
  return "physical";
}

export function ugcClipSceneCount(_clip?: {
  type: UgcClipType;
  stills: { index: number }[];
  sceneCount?: number;
}): UgcSceneCount {
  return 1;
}

export function resizeUgcStills(
  stills: UgcSceneStill[],
  sceneCount: UgcSceneCount,
): UgcSceneStill[] {
  const next = stills.map((still, index) => ({ ...still, index }));
  while (next.length < sceneCount) {
    next.push({ index: next.length });
  }
  return next;
}

export function appendUgcStills(
  existing: UgcSceneStill[],
  incoming: UgcSceneStill[],
): UgcSceneStill[] {
  const kept = existing.filter((still) => still.imageUrl);
  const added = incoming.filter((still) => still.imageUrl);
  return [...added, ...kept]
    .slice(0, UGC_MAX_STILL_VERSIONS)
    .map((still, index) => ({ ...still, index }));
}

export function appendUgcAudioTakes(
  existing: UgcClipAudioTake[],
  incoming: UgcClipAudioTake,
): UgcClipAudioTake[] {
  return [
    incoming,
    ...existing.filter((take) => take.audioUrl !== incoming.audioUrl),
  ].slice(0, UGC_MAX_AUDIO_TAKES);
}

export function ugcClipAudioTakes(clip: {
  audioTakes?: UgcClipAudioTake[];
  audioUrl?: string;
  audioDurationSec?: number;
}): UgcClipAudioTake[] {
  if (clip.audioTakes && clip.audioTakes.length > 0) return clip.audioTakes;
  if (clip.audioUrl) {
    return [
      {
        id: "current",
        audioUrl: clip.audioUrl,
        durationSec: clip.audioDurationSec,
      },
    ];
  }
  return [];
}

export function ugcClipAudioTakeForUrl(
  clips: Array<{
    audioTakes?: UgcClipAudioTake[];
    audioUrl?: string;
    audioDurationSec?: number;
  }>,
  url: string,
): UgcClipAudioTake | undefined {
  for (const clip of clips) {
    const take = ugcClipAudioTakes(clip).find((item) => item.audioUrl === url);
    if (take) return take;
  }
  return undefined;
}

export function appendUgcVideoTakes(
  existing: UgcClipVideoTake[],
  incoming: UgcClipVideoTake,
): UgcClipVideoTake[] {
  return [
    incoming,
    ...existing.filter((take) => take.videoUrl !== incoming.videoUrl),
  ].slice(0, UGC_MAX_VIDEO_TAKES);
}

export function ugcClipVideoTakes(clip: {
  videoTakes?: UgcClipVideoTake[];
  videoUrl?: string;
  thumbnailUrl?: string;
}): UgcClipVideoTake[] {
  if (clip.videoTakes && clip.videoTakes.length > 0) return clip.videoTakes;
  if (clip.videoUrl) {
    return [
      {
        id: "current",
        videoUrl: clip.videoUrl,
        thumbnailUrl: clip.thumbnailUrl,
      },
    ];
  }
  return [];
}

export function ugcClipVideoTakeForUrl(
  clips: Array<{
    videoTakes?: UgcClipVideoTake[];
    videoUrl?: string;
    thumbnailUrl?: string;
  }>,
  url: string,
): UgcClipVideoTake | undefined {
  for (const clip of clips) {
    const take = ugcClipVideoTakes(clip).find((item) => item.videoUrl === url);
    if (take) return take;
  }
  return undefined;
}

export function moveUgcStillToStart(
  stills: UgcSceneStill[],
  startFrameIndex: number,
): UgcSceneStill[] {
  if (startFrameIndex <= 0 || startFrameIndex >= stills.length) {
    return stills.map((still, index) => ({ ...still, index }));
  }
  const next = [...stills];
  const [picked] = next.splice(startFrameIndex, 1);
  if (!picked) return stills.map((still, index) => ({ ...still, index }));
  next.unshift(picked);
  return next.map((still, index) => ({ ...still, index }));
}

export function ugcClipStoryboardStatus(
  project: { productImageUrls: string[]; influencerId?: string },
  clip: UgcClip,
): UgcClipStoryboardStatus {
  if (clip.status === "generating") return "generating";
  if (clip.videoUrl) return "ready";
  if (
    ugcClipRequiresProduct(clip.type) &&
    project.productImageUrls.length === 0
  )
    return "setup";
  if (
    ugcClipRequiresCreator(clip.type) &&
    !ugcResolvedInfluencerId(project, clip)
  )
    return "setup";
  if (
    ugcClipRequiresScreenshots(clip.type) &&
    (clip.referenceImageUrls?.length ?? 0) === 0
  )
    return "setup";
  if (!clip.stills.some((still) => still.imageUrl)) return "photos";
  return "script";
}

export type UgcProjectModels = {
  image: string;
  script?: string;
  video: string;
  planner?: string;
};

export type UgcClipModels = {
  image?: string;
  script?: string;
  video?: string;
  planner?: string;
};

export function ugcResolvedClipModels(
  project: { models: UgcProjectModels },
  clip?: { models?: UgcClipModels },
): UgcProjectModels {
  return {
    image: clip?.models?.image ?? project.models.image,
    video: clip?.models?.video ?? project.models.video,
    ...((clip?.models?.script ?? project.models.script)
      ? { script: clip?.models?.script ?? project.models.script }
      : {}),
    ...((clip?.models?.planner ?? project.models.planner)
      ? { planner: clip?.models?.planner ?? project.models.planner }
      : {}),
  };
}

export type UgcProjectScript = {
  text: string;
  source: UgcScriptSource;
};

export type UgcClipVoice = {
  provider: UgcVoiceProvider;
  voiceId?: string;
  voiceName?: string;
  speed?: number;
  stability?: number;
  similarity?: number;
  style?: number;
  speakerBoost?: boolean;
  enabled?: boolean;
};

export type UgcVoiceLabels = {
  language?: string;
  gender?: string;
  age?: string;
  accent?: string;
  useCase?: string;
};

export type UgcVoice = {
  id: string;
  name: string;
  previewUrl?: string;
  description?: string;
  labels: UgcVoiceLabels;
};

export type SearchUgcVoicesQuery = {
  search?: string;
  language?: string;
  gender?: string;
  age?: string;
  accent?: string;
  category?: string;
};

export type SearchUgcVoicesResponse = {
  voices: UgcVoice[];
  hasMore?: boolean;
  nextPageToken?: string;
};

export const UGC_VOICE_GENDERS = ["female", "male", "neutral"] as const;
export type UgcVoiceGender = (typeof UGC_VOICE_GENDERS)[number];

export const UGC_VOICE_AGES = ["young", "middle_aged", "old"] as const;
export type UgcVoiceAge = (typeof UGC_VOICE_AGES)[number];

export const UGC_VOICE_LANGUAGES = [
  { id: "en", label: "🇺🇸 English" },
  { id: "es", label: "🇪🇸 Spanish" },
  { id: "fr", label: "🇫🇷 French" },
  { id: "de", label: "🇩🇪 German" },
  { id: "it", label: "🇮🇹 Italian" },
  { id: "pt", label: "🇵🇹 Portuguese" },
  { id: "pl", label: "🇵🇱 Polish" },
  { id: "bg", label: "🇧🇬 Bulgarian" },
  { id: "hi", label: "🇮🇳 Hindi" },
  { id: "ja", label: "🇯🇵 Japanese" },
  { id: "zh", label: "🇨🇳 Chinese" },
  { id: "ko", label: "🇰🇷 Korean" },
  { id: "ar", label: "🇸🇦 Arabic" },
] as const;

export const UGC_VOICE_ACCENTS = [
  { id: "american", label: "American" },
  { id: "british", label: "British" },
  { id: "australian", label: "Australian" },
  { id: "indian", label: "Indian" },
  { id: "irish", label: "Irish" },
  { id: "african", label: "African" },
] as const;

export type UgcSceneStill = {
  index: number;
  imageUrl?: string;
  generationId?: string;
  enhancedPrompt?: string;
};

export type UgcClipAudioTake = {
  id: string;
  audioUrl: string;
  durationSec?: number;
  scriptText?: string;
};

export type UgcClipVideoTake = {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  durationSec?: number;
  prompt?: string;
};

export type UgcClip = {
  id: string;
  type: UgcClipType;
  name?: string;
  status: UgcClipStatus;
  durationSec: number;
  sceneCount: UgcSceneCount;
  influencerId?: string;
  script?: UgcProjectScript;
  voice?: UgcClipVoice;
  models?: UgcClipModels;
  scenePrompt?: string;
  directions?: string;
  imagePrompt?: string;
  referenceImageUrls?: string[];
  stills: UgcSceneStill[];
  plannedPrompt?: string;
  negativePrompt?: string;
  audioUrl?: string;
  audioDurationSec?: number;
  audioTakes?: UgcClipAudioTake[];
  videoUrl?: string;
  thumbnailUrl?: string;
  videoTakes?: UgcClipVideoTake[];
  generationId?: string;
  composedVideoId?: string;
  stillsRunId?: string;
  videoRunId?: string;
  audioRunId?: string;
  approved?: boolean;
  error?: string;
};

/** @deprecated Older influencer-variant shape. Prefer UgcClip. */
export type UgcVariant = {
  id: string;
  influencerId: string;
  status: UgcVariantStatus;
  stills: UgcSceneStill[];
  plannedPrompt?: string;
  negativePrompt?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  generationId?: string;
  composedVideoId?: string;
  error?: string;
};

export type UgcProject = {
  id: string;
  name: string;
  status: UgcProjectStatus;
  workspaceId: string;
  projectId?: string;
  createdBy: string;
  productId?: string;
  productImageUrls: string[];
  productName?: string;
  productDescription?: string;
  productUrl?: string;
  productKind?: UgcProductKind;
  influencerId?: string;
  voice?: UgcClipVoice;
  aspectRatio: string;
  videoResolution: VideoResolution;
  models: UgcProjectModels;
  flowStep?: UgcFlowStep;
  clips: UgcClip[];
  assembledVideoUrl?: string;
  assembledRunId?: string;
  composedProjectVideoId?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UgcProjectSummary = Pick<
  UgcProject,
  | "id"
  | "name"
  | "status"
  | "workspaceId"
  | "projectId"
  | "productImageUrls"
  | "createdAt"
  | "updatedAt"
> & {
  clipCount: number;
  readyCount: number;
  previewImageUrl?: string;
};

export type CreateUgcProjectPayload = {
  workspaceId: string;
  projectId?: string;
  name?: string;
  productId?: string;
  productImageUrls?: string[];
  productName?: string;
  productDescription?: string;
  productUrl?: string;
  productKind?: UgcProductKind;
  influencerId?: string;
  aspectRatio?: string;
  models?: Partial<UgcProjectModels>;
  flowStep?: UgcFlowStep;
};

export type UpdateUgcProjectPayload = {
  name?: string;
  productId?: string | null;
  productImageUrls?: string[];
  productName?: string;
  productDescription?: string | null;
  productUrl?: string | null;
  productKind?: UgcProductKind | null;
  influencerId?: string | null;
  voice?: UgcClipVoice | null;
  aspectRatio?: string;
  videoResolution?: VideoResolution;
  models?: Partial<UgcProjectModels>;
  clipOrder?: string[];
  flowStep?: UgcFlowStep;
};

export type CreateUgcClipPayload = {
  type?: UgcClipType;
  durationSec?: number;
  sceneCount?: UgcSceneCount;
  influencerId?: string;
  name?: string;
};

export type ExtendUgcClipPayload = {
  lastFrameUrl: string;
};

export type UpdateUgcClipPayload = {
  name?: string;
  type?: UgcClipType;
  durationSec?: number;
  sceneCount?: UgcSceneCount;
  startFrameIndex?: number;
  influencerId?: string | null;
  script?: Partial<UgcProjectScript>;
  voice?: UgcClipVoice | null;
  scenePrompt?: string | null;
  directions?: string | null;
  imagePrompt?: string | null;
  referenceImageUrls?: string[];
  plannedPrompt?: string | null;
  models?: Partial<UgcClipModels>;
  approved?: boolean;
  stills?: UgcSceneStill[];
  audioUrl?: string | null;
  videoUrl?: string | null;
};

export type OpenUgcEditorResponse = {
  videoId: string;
};

export type GenerateUgcScriptPayload = {
  model?: string;
};

export type ApplyUgcCampaignPresetPayload = {
  presetId: UgcCampaignPresetId;
};

export type UgcAdPlanScene = {
  name: string;
  type: UgcClipType;
  goal: string;
  script: string;
  imagePrompt: string;
  videoPrompt: string;
  durationSec: number;
};

export type UgcAdPlan = {
  concept: string;
  format: string;
  targetAudience: string;
  scenes: UgcAdPlanScene[];
};

export type GetUgcProjectsResponse = {
  projects: UgcProjectSummary[];
};
