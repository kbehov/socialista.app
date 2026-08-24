import {
  clampInfluencerShotCount,
  type AspectRatio,
  type InfluencerAgeRange,
  type InfluencerAppearance,
  type InfluencerCharacterSheet,
  type InfluencerGender,
  type InfluencerHeight,
  type InfluencerPhotoStyle,
  type InfluencerShotId,
} from "@socialista/types";

export type InfluencerPromptAppearance = Pick<
  InfluencerAppearance,
  | "hairColor"
  | "hairStyle"
  | "eyeColor"
  | "skinTone"
  | "bodyShape"
  | "height"
  | "distinguishingFeatures"
  | "facialHair"
  | "makeup"
  | "accessories"
>;

export type BuildInfluencerBasePromptInput = {
  name: string;
  gender: InfluencerGender;
  ageRange: InfluencerAgeRange;
  ethnicity?: string;
  appearance: InfluencerPromptAppearance;
  /** When present, identityLock + signatureDetails drive the fragment. */
  characterSheet?: InfluencerCharacterSheet;
  /** When true, omit form hair/body append — identity comes from refs + sheet. */
  preferReferenceAppearance?: boolean;
};

const GENDER_LABEL: Record<InfluencerGender, string> = {
  female: "woman",
  male: "man",
  "non-binary": "non-binary person",
};

/** Models render age best from a specific number, not a range. */
const AGE_REPRESENTATIVE: Record<InfluencerAgeRange, number> = {
  "18-24": 21,
  "25-34": 28,
  "35-44": 38,
  "45+": 50,
};

const HEIGHT_LABEL: Record<InfluencerHeight, string> = {
  short: "shorter than average",
  average: "average height",
  tall: "tall",
};

const MAKEUP_PROMPT_LABEL: Record<string, string> = {
  natural: "natural, barely-there makeup",
  "no-makeup": "bare skin, no makeup",
  glam: "glam makeup",
  bold: "bold makeup",
};

const PHOTO_STYLE_CUE: Record<InfluencerPhotoStyle, string> = {
  "ugc-phone":
    "Casual smartphone UGC look — slight wide-angle, natural phone HDR, scroll-stopping TikTok/IG authenticity.",
  "creator-camera":
    "Creator mirrorless look — shallow depth, intentional framing, still lived-in and real.",
  "studio-polish":
    "Polished creator lighting — flattering key light with a lived-in set, not a blank backdrop.",
};

export type InfluencerScenePrompt = {
  environment: string;
  wardrobeHint?: string;
  actionCue?: string;
};

/** Concrete UGC scene expansions — IDs alone are too thin for photoreal prompts. */
export const INFLUENCER_SCENE_PROMPTS: Record<string, InfluencerScenePrompt> = {
  home: {
    environment:
      "cozy apartment living room with morning window light, plants, and soft everyday clutter",
    wardrobeHint: "elevated casual lounge layers",
  },
  "kitchen-cooking": {
    environment:
      "lived-in kitchen counter with ingredients, warm window sidelight, and a skillet softly out of focus",
    wardrobeHint: "casual kitchen clothes, maybe a soft apron",
    actionCue: "mid-cooking, natural hands-busy energy",
  },
  "bedroom-morning": {
    environment:
      "sunlit bedroom with rumpled linen bedding and soft morning window glow",
    wardrobeHint: "soft loungewear or sleep-to-day layers",
  },
  "bathroom-vanity": {
    environment:
      "bright bathroom vanity with soft mirror glow, skincare bottles softly blurred, daylight from a side window",
    wardrobeHint: "simple top that frames the face",
  },
  "coffee-shop": {
    environment:
      "neighborhood café booth with warm interior bokeh, a latte on the table, soft window sidelight",
    wardrobeHint: "everyday café-casual layers",
    actionCue: "relaxed mid-conversation energy",
  },
  restaurant: {
    environment:
      "casual restaurant table with warm ambient light, plates and glasses softly out of focus",
    wardrobeHint: "polished casual dinner outfit",
  },
  "podcast-setup": {
    environment:
      "podcast corner with a boom mic and acoustic panels softly behind, warm desk lamp key light",
    wardrobeHint: "smart-casual on-camera layers",
    actionCue: "talking into mic, engaged speaking face",
  },
  gym: {
    environment:
      "sunlit gym floor with mirrors and equipment softly blurred, realistic workout atmosphere",
    wardrobeHint: "fitted activewear without visible logos",
    actionCue: "between sets, confident athletic ease",
  },
  yoga: {
    environment:
      "yoga mat corner by a large window with warm daylight and calm plant bokeh",
    wardrobeHint: "soft mindful athleisure",
    actionCue: "grounded post-flow stillness",
  },
  "outdoor-run": {
    environment:
      "outdoor running path at golden hour with soft green and asphalt bokeh",
    wardrobeHint: "breathable running layers",
    actionCue: "post-run glow, natural stride pause",
  },
  airport: {
    environment:
      "airport terminal seating with large windows, soft travel-day light, luggage softly behind",
    wardrobeHint: "comfortable travel-ready layers",
  },
  plane: {
    environment:
      "airplane cabin window seat with soft daylight on face and aisle bokeh behind",
    wardrobeHint: "comfortable flight layers",
  },
  car: {
    environment:
      "car interior passenger or driver seat, soft daylight through windshield, candid commute vibe",
    wardrobeHint: "everyday driving layers",
    actionCue: "talking to phone camera, car-selfie energy",
  },
  "hotel-room": {
    environment:
      "hotel room with crisp bedding, warm lamp light, and city view soft in the window",
    wardrobeHint: "travel-casual layers",
  },
  beach: {
    environment:
      "sunny beach with soft ocean and sand bokeh, natural daylight, wind in hair",
    wardrobeHint: "light beach-ready clothes",
  },
  street: {
    environment:
      "city sidewalk with soft daylight and shallow storefront bokeh, real street atmosphere",
    wardrobeHint: "curated street-style outfit",
  },
  snow: {
    environment:
      "snowy outdoor path with cold daylight, soft snow fall or snow banks behind",
    wardrobeHint: "winter coat and scarf-ready layers",
  },
  "winter-city": {
    environment:
      "winter city street with cool daylight, breath in air, festive storefronts soft behind",
    wardrobeHint: "layered winter city outfit",
  },
  store: {
    environment:
      "retail aisle or boutique corner with soft overhead light and product shelves in shallow bokeh",
    wardrobeHint: "casual shopping outfit",
    actionCue: "product discovery / haul energy",
  },
  "farmers-market": {
    environment:
      "farmers-market stall with produce color, soft outdoor daylight, canvas tents softly behind",
    wardrobeHint: "weekend market casual layers",
  },
  "streaming-desk": {
    environment:
      "streamer desk with soft RGB ambient glow, monitor and mic softly behind, night creator vibe",
    wardrobeHint: "relaxed hoodie or gamer-casual tee",
  },
  "asmr-desk": {
    environment:
      "quiet desk setup with soft key light, mic close, candle or small props softly framed",
    wardrobeHint: "soft on-camera layers",
    actionCue: "intimate close speaking energy",
  },
  "mirror-ootd": {
    environment:
      "bedroom or hallway mirror corner with natural daylight and lived-in home ambience",
    wardrobeHint: "outfit-of-the-day look",
    actionCue: "mirror check pose with phone in hand",
  },
  "product-hook": {
    environment:
      "bright lived-in creator space with soft key light, plain unbranded product ready to feature",
    wardrobeHint: "clean on-camera casual",
    actionCue: "holding product toward camera, scroll-stopping hook face",
  },
  "pointing-reveal": {
    environment:
      "clean creator corner with soft daylight and enough negative space for a reveal",
    wardrobeHint: "simple layers that keep hands visible",
    actionCue:
      "pointing off-frame or at a product, surprised reveal expression",
  },
  "sitting-testimonial": {
    environment:
      "seated couch or café booth with warm interior light and soft environmental depth",
    wardrobeHint: "approachable everyday layers",
    actionCue: "leaning slightly forward mid-testimonial",
  },
  "pregnant-bump": {
    environment:
      "soft home living room with warm window light, gentle maternity-friendly framing",
    wardrobeHint: "comfortable maternity-friendly clothes",
    actionCue: "natural hand-on-bump moment, soft smile",
  },
};

/** Accessory prompt phrases locked into identity when selected. */
export const INFLUENCER_ACCESSORY_PROMPTS: Record<string, string> = {
  headphones: "over-ear headphones resting around the neck or on ears",
  glasses: "thin clear-lens eyeglasses",
  sunglasses: "stylish sunglasses",
  hat: "casual brimmed hat",
  beanie: "soft knit beanie",
  bag: "everyday shoulder bag or crossbody",
  jewelry: "subtle everyday jewelry (thin hoops or a simple necklace)",
  watch: "minimal wristwatch",
  scarf: "soft scarf loosely worn",
  candle: "holding or beside a lit candle",
  mic: "podcast or creator microphone nearby",
  phone: "smartphone in hand",
  laptop: "open laptop nearby",
  dumbbell: "small dumbbell in hand or nearby",
  "coffee-cup": "takeaway coffee cup in hand",
  "water-bottle": "reusable water bottle in hand",
  "skincare-bottle": "plain unbranded skincare bottle in hand",
  pet: "friendly pet nearby (soft focus when not the subject)",
  "shopping-bag": "paper shopping bag in hand",
};

function expandAccessories(accessories: string[] | undefined): string[] {
  if (!accessories?.length) return [];
  return accessories
    .map((id) => INFLUENCER_ACCESSORY_PROMPTS[id] ?? id.replace(/-/g, " "))
    .filter(Boolean);
}

/** Dedupe distinguishing features that overlap with accessories (e.g. glasses). */
function featuresWithoutAccessoryOverlap(
  features: string[] | undefined,
  accessories: string[] | undefined,
): string[] {
  if (!features?.length) return [];
  if (!accessories?.length) return features;
  const accessorySet = new Set(accessories.map((a) => a.toLowerCase()));
  return features.filter((feature) => {
    const lower = feature.toLowerCase();
    if (accessorySet.has(lower)) return false;
    if (
      lower.includes("glasses") &&
      (accessorySet.has("glasses") || accessorySet.has("sunglasses"))
    ) {
      return false;
    }
    return true;
  });
}

export type InfluencerNicheScene = {
  wardrobe: string[];
  environments: string[];
};

/**
 * Niche wardrobe + atmosphere cues.
 * Environments should read as a real creator’s world — not a passport studio wall.
 */
export const INFLUENCER_NICHE_SCENES: Record<string, InfluencerNicheScene> = {
  fitness: {
    wardrobe: [
      "fitted activewear with subtle branding-free details",
      "athleisure training set",
    ],
    environments: [
      "sunlit gym floor with mirrors and equipment softly blurred behind",
      "outdoor running path at golden hour",
      "home workout corner with a yoga mat and window light",
    ],
  },
  fashion: {
    wardrobe: [
      "curated street-style outfit",
      "elevated everyday layers with a statement piece",
    ],
    environments: [
      "city sidewalk with soft daylight and shallow bokeh storefronts",
      "industrial loft with concrete and large windows",
      "boutique fitting-room mirror corner with warm lamps",
    ],
  },
  beauty: {
    wardrobe: [
      "simple top that frames the face",
      "soft crewneck that keeps focus on skin and hair",
    ],
    environments: [
      "bright bathroom vanity with ring-adjacent daylight and soft mirror glow",
      "bedroom vanity table with skincare bottles softly out of focus",
      "sunlit makeup desk with a window and plants in the background",
    ],
  },
  travel: {
    wardrobe: [
      "linen travel layers",
      "comfortable travel-ready clothes with a light jacket",
    ],
    environments: [
      "scenic overlook at golden hour with distant landscape bokeh",
      "café terrace abroad with warm afternoon light",
      "cobblestone street with soft travel-day ambience",
    ],
  },
  tech: {
    wardrobe: [
      "smart-casual hoodie",
      "clean creator tee under an open overshirt",
    ],
    environments: [
      "modern desk setup with dual monitors softly glowing",
      "co-working loft with glass and plants behind",
      "home office nook with a laptop and warm desk lamp",
    ],
  },
  food: {
    wardrobe: ["casual clothes with a soft apron", "everyday kitchen casual"],
    environments: [
      "cozy kitchen counter with ingredients and warm window light",
      "sunlit dining table with plated food softly blurred",
      "farmers-market stall with produce color in the background",
    ],
  },
  gaming: {
    wardrobe: ["relaxed hoodie", "gamer-casual tee"],
    environments: [
      "RGB-lit desk setup with soft ambient glow behind",
      "living-room couch gaming corner at night",
      "streamer desk with microphone and monitor bokeh",
    ],
  },
  lifestyle: {
    wardrobe: ["elevated casual layers", "soft sweater and jeans"],
    environments: [
      "cozy apartment living room with morning window light",
      "neighborhood café with warm interior bokeh",
      "sunlit balcony with plants and city haze beyond",
    ],
  },
  business: {
    wardrobe: ["smart-casual blazer", "polished business-casual"],
    environments: [
      "modern glass office with daylight and soft skyline bokeh",
      "clean desk nook with a laptop and notebook",
      "city café meeting corner with warm interior light",
    ],
  },
  comedy: {
    wardrobe: ["expressive casual clothes", "graphic tee under an open shirt"],
    environments: [
      "lived-in living room with playful everyday clutter",
      "kitchen with everyday mess and overhead light",
      "hallway mirror corner with casual home ambience",
    ],
  },
  wellness: {
    wardrobe: ["soft loungewear", "mindful athleisure"],
    environments: [
      "sunlit bedroom morning with linen bedding soft behind",
      "calm balcony with plants and soft outdoor light",
      "yoga mat corner by a large window with warm daylight",
    ],
  },
  finance: {
    wardrobe: ["clean smart-casual", "neat sweater over a collared shirt"],
    environments: [
      "tidy home office with charts soft on a monitor",
      "modern workspace with daylight and a clean desk",
      "quiet café booth with a laptop and notebook",
    ],
  },
  parenting: {
    wardrobe: [
      "comfortable everyday parent clothes",
      "practical casual layers",
    ],
    environments: [
      "family kitchen with soft morning light",
      "lived-in living room with toys softly out of focus",
      "park bench path with green bokeh behind",
    ],
  },
  pets: {
    wardrobe: ["casual outdoor clothes", "walk-ready layers"],
    environments: [
      "park path with soft green bokeh",
      "cozy living room with a pet bed softly behind",
      "sunny backyard porch with natural light",
    ],
  },
  education: {
    wardrobe: ["approachable smart-casual", "cardigan over a simple top"],
    environments: [
      "study desk with books and warm daylight",
      "library nook with soft bookshelf bokeh",
      "classroom whiteboard soft behind a teaching desk",
    ],
  },
  diy: {
    wardrobe: ["practical making clothes", "apron over casual layers"],
    environments: [
      "workshop bench with tools softly out of focus",
      "craft table by a window with materials and warm light",
      "garage makerspace with wood and tools in soft bokeh",
    ],
  },
};

/** Short photoreal footer — positive cues only. */
export const INFLUENCER_EXCLUSIONS =
  "Photoreal UGC: shot on iPhone, handheld feel, candid framing, slight motion blur acceptable. " +
  "Unretouched skin with visible pores, natural asymmetry, no beauty filter or over-smoothing. " +
  "Ambient practical lighting (window light, kitchen downlights, car interior) — no studio seamless. " +
  "When style references are attached, preserve their scene, color palette, composition, and Pinterest-ready polish — swap only the person. " +
  "No text, watermarks, logos, branded marks, or UI. Avoid passport-photo framing, celebrity likeness, and sterile empty walls. " +
  "Prefer aspirational creator photography with believable environmental depth — never generic stock-photo blandness.";

/**
 * Locked identity prose — reused byte-identical on every shot.
 * Scene / camera / wardrobe / accessories belong in the shot prompt doc, not here.
 */
export function buildInfluencerBasePromptFragment(
  input: BuildInfluencerBasePromptInput,
): string {
  const {
    name,
    gender,
    ageRange,
    ethnicity,
    appearance,
    characterSheet,
    preferReferenceAppearance,
  } = input;
  const person = GENDER_LABEL[gender];
  const age = AGE_REPRESENTATIVE[ageRange];
  const height = appearance.height
    ? `, ${HEIGHT_LABEL[appearance.height]}`
    : "";
  const ethnicityClause = ethnicity?.trim()
    ? ` of ${ethnicity.trim()} heritage`
    : "";
  const featureList = featuresWithoutAccessoryOverlap(
    appearance.distinguishingFeatures,
    appearance.accessories,
  );
  const features = featureList.length > 0 ? `, ${featureList.join(", ")}` : "";

  const facialHair =
    appearance.facialHair && appearance.facialHair !== "none"
      ? ` Facial hair: ${appearance.facialHair}.`
      : "";
  const makeup =
    appearance.makeup && appearance.makeup !== "none"
      ? ` ${MAKEUP_PROMPT_LABEL[appearance.makeup] ?? `Makeup: ${appearance.makeup}`}.`
      : "";

  const subject = `${name} is a ${age}-year-old ${person}${ethnicityClause}, a real social-media creator.`;

  if (characterSheet) {
    const signatures =
      characterSheet.signatureDetails.length > 0
        ? ` Signature: ${characterSheet.signatureDetails.join("; ")}.`
        : "";
    const identityDetails =
      ` Hair: ${appearance.hairColor}, ${appearance.hairStyle}.` +
      ` Face: ${appearance.skinTone} skin, ${appearance.eyeColor} eyes${features}.${facialHair}${makeup}` +
      ` Body: ${appearance.bodyShape} build${height}.`;

    if (preferReferenceAppearance) {
      return (
        `${subject} ${characterSheet.identityLock}${signatures}` +
        identityDetails +
        ` References define scene, colors, and photographic world — Identity defines the person only.` +
        ` Natural skin texture, believable real-world light.`
      );
    }
    return (
      `${subject} ${characterSheet.identityLock}${signatures}` +
      ` Hair: ${appearance.hairColor}, ${appearance.hairStyle}.` +
      ` Body: ${appearance.bodyShape} build${height}.` +
      ` Natural skin texture, believable real-world light.`
    );
  }

  return (
    `${subject}` +
    ` Face: ${appearance.skinTone} skin, ${appearance.eyeColor} eyes${features}.${facialHair}${makeup}` +
    ` Hair: ${appearance.hairColor}, ${appearance.hairStyle}.` +
    ` Body: ${appearance.bodyShape} build${height}.` +
    ` Natural skin texture, believable real-world light.`
  );
}

export type InfluencerWardrobeSlot = "casual" | "onCamera" | "active";

export type InfluencerShot = {
  id: InfluencerShotId;
  label: string;
  aspectRatio: AspectRatio;
  /** Tight 1–2 sentence IG / TikTok / Pinterest camera direction. */
  promptSuffix: string;
  wardrobeSlot: InfluencerWardrobeSlot;
  /** When true, append wardrobe + setting from niche / character sheet. */
  useNicheScene?: boolean;
};

/**
 * Shot library tuned for Instagram / TikTok / Pinterest creator aesthetics.
 * Keep suffixes short — models attend better to ~2 sentences than prompt soup.
 * Cover shots still prioritize a sharp face, but place the creator in a niche world.
 */
export const INFLUENCER_SHOT_LIBRARY: InfluencerShot[] = [
  {
    id: "front-portrait",
    label: "Front portrait",
    aspectRatio: "1:1",
    promptSuffix:
      "Instagram profile portrait: tight head-and-shoulders crop, eye-level 85mm look, face fills the frame as identity anchor, calm half-smile to camera. Soft environmental depth behind — a niche-true setting, never a blank wall.",
    wardrobeSlot: "casual",
    useNicheScene: true,
  },
  {
    id: "three-quarter",
    label: "Three-quarter",
    aspectRatio: "1:1",
    promptSuffix:
      "Pinterest lifestyle portrait: chest-up three-quarter turn, candid mid-laugh, 50mm shallow depth, natural daylight with readable environment behind. Same face and features as the cover.",
    wardrobeSlot: "casual",
    useNicheScene: true,
  },
  {
    id: "full-body",
    label: "Full body",
    aspectRatio: "9:16",
    promptSuffix:
      "TikTok / Reels full-body vertical: head-to-shoes with breathing room, 35mm eye-level, relaxed weight-on-one-leg stance, environment tells the creator vibe. Same person.",
    wardrobeSlot: "casual",
    useNicheScene: true,
  },
  {
    id: "selfie-talking",
    label: "Selfie talking",
    aspectRatio: "9:16",
    promptSuffix:
      "TikTok talking-head selfie: arm's-length phone front camera, face in upper third, eyes locked to lens, mid-sentence expression with open mouth, slight wide-angle HDR phone look. Clearly NOT a studio portrait — handheld UGC energy in a lived-in niche space.",
    wardrobeSlot: "onCamera",
    useNicheScene: true,
  },
  {
    id: "product-hold",
    label: "Product hold",
    aspectRatio: "9:16",
    promptSuffix:
      "UGC product review frame: chest-up vertical, holding a plain unbranded bottle or box at chest height toward camera, friendly explainer look, soft key light, niche-relevant backdrop softly behind. Same person.",
    wardrobeSlot: "onCamera",
    useNicheScene: true,
  },
  {
    id: "seated-testimonial",
    label: "Seated testimonial",
    aspectRatio: "1:1",
    promptSuffix:
      "Instagram testimonial square: seated mid-shot with headroom for captions, leaning slightly forward mid-conversation, warm speaking expression, environment matches the creator niche. Same person.",
    wardrobeSlot: "onCamera",
    useNicheScene: true,
  },
  {
    id: "outdoor-walk",
    label: "Outdoor walk",
    aspectRatio: "9:16",
    promptSuffix:
      "TikTok day-in-the-life vertical: walking toward camera outdoors, natural stride, soft daylight, candid glance to camera, location fits the niche. Same face and body.",
    wardrobeSlot: "active",
    useNicheScene: true,
  },
  {
    id: "mirror-ootd",
    label: "Mirror OOTD",
    aspectRatio: "9:16",
    promptSuffix:
      "Instagram OOTD mirror selfie: full-length reflection, phone visible in hand, bedroom or hallway daylight, casual outfit-check pose that feels on-brand for the niche. Same person.",
    wardrobeSlot: "casual",
    useNicheScene: true,
  },
];

const INFLUENCER_GENERATION_SHOT_IDS: InfluencerShotId[] = [
  "front-portrait",
  "full-body",
  "selfie-talking",
];

const SHOT_BY_ID = new Map(
  INFLUENCER_SHOT_LIBRARY.map((shot) => [shot.id, shot]),
);

/** Ordered shots for influencer creation — portrait, full body, distinct UGC frame. */
export function getInfluencerGenerationShots(count?: number): InfluencerShot[] {
  const shots = INFLUENCER_GENERATION_SHOT_IDS.map((id) => {
    const shot = SHOT_BY_ID.get(id);
    if (!shot) throw new Error(`Unknown influencer shot: ${id}`);
    return shot;
  });
  if (count == null) return shots;
  return shots.slice(0, clampInfluencerShotCount(count));
}

/** @deprecated Use getInfluencerGenerationShots — pack is ignored. */
export function getInfluencerShotsForPack(): InfluencerShot[] {
  return getInfluencerGenerationShots();
}

/** @deprecated Prefer getInfluencerGenerationShots */
export const INFLUENCER_ANCHOR_SHOTS: InfluencerShot[] =
  getInfluencerGenerationShots();

export type InfluencerAnchorShot = InfluencerShot;

export type BuildInfluencerShotPromptContext = {
  niche?: string[];
  scenes?: string[];
  accessories?: string[];
  aestheticTags?: string[];
  characterSheet?: InfluencerCharacterSheet;
  photoStyle?: InfluencerPhotoStyle;
  /** Free-text creative direction — optional mood/outfit refine. */
  directions?: string;
  /** Rotate wardrobe/environment picks across the pack. */
  shotIndex?: number;
  /**
   * When > 0, run in lookalike mode: reference photos inspire archetype/vibe,
   * but the output must be a clearly different individual (not a pixel clone).
   */
  userReferenceCount?: number;
  /** Follow-up shots: only the cover portrait is attached — identity chain, not user refs. */
  coverChainOnly?: boolean;
};

/** Structured scene block resolved before render. */
export type InfluencerPromptScene = {
  id?: string;
  wardrobe?: string;
  environment?: string;
  action?: string;
};

/**
 * Internal structured prompt document.
 * Rendered to labeled natural language for image models — never sent as raw JSON.
 */
export type InfluencerPromptDoc = {
  identity: string;
  shot: string;
  scene?: InfluencerPromptScene;
  accessories?: string[];
  photoStyle?: string;
  aesthetics?: string[];
  directions?: string;
  /** Hybrid user-ref guidance (cover shots with attached references). */
  referenceGuidance?: string;
  quality: string;
};

function pickFromArray<T>(
  items: T[] | undefined,
  index: number,
): T | undefined {
  if (!items || items.length === 0) return undefined;
  return items[index % items.length];
}

function expandUserScene(
  sceneId: string | undefined,
): InfluencerScenePrompt | undefined {
  if (!sceneId) return undefined;
  return INFLUENCER_SCENE_PROMPTS[sceneId];
}

/** Resolve wardrobe + setting + action from sheet → user scenes → niche fallback. */
export function resolveInfluencerPromptScene(
  shot: InfluencerShot,
  ctx?: BuildInfluencerShotPromptContext,
): InfluencerPromptScene | undefined {
  const refMode = (ctx?.userReferenceCount ?? 0) > 0 || ctx?.coverChainOnly;
  // With references or cover chain: scene/colors come from images — skip niche scene text.
  if (refMode) return undefined;

  if (!shot.useNicheScene) return undefined;

  const index = ctx?.shotIndex ?? 0;
  const sheetWardrobe = ctx?.characterSheet?.wardrobe?.[shot.wardrobeSlot];
  const sheetEnv = pickFromArray(ctx?.characterSheet?.environments, index);

  // User-selected scenes rotate across the pack even in lookalike mode.
  const userScenes = ctx?.scenes?.filter(Boolean) ?? [];
  if (userScenes.length > 0) {
    const sceneId = pickFromArray(userScenes, index);
    const scene = expandUserScene(sceneId);
    if (scene) {
      return {
        id: sceneId,
        wardrobe: scene.wardrobeHint ?? sheetWardrobe,
        environment: scene.environment ?? sheetEnv,
        action: scene.actionCue,
      };
    }
  }

  if (sheetWardrobe || sheetEnv) {
    return {
      wardrobe: sheetWardrobe || undefined,
      environment: sheetEnv || undefined,
    };
  }

  const niches = ctx?.niche?.filter(Boolean) ?? [];
  const primary = niches[0];
  const secondary = niches[1];
  const primaryScene = primary ? INFLUENCER_NICHE_SCENES[primary] : undefined;
  const secondaryScene = secondary
    ? INFLUENCER_NICHE_SCENES[secondary]
    : undefined;

  const wardrobe =
    pickFromArray(primaryScene?.wardrobe, index) ??
    pickFromArray(secondaryScene?.wardrobe, index);
  const environment =
    pickFromArray(primaryScene?.environments, index) ??
    pickFromArray(secondaryScene?.environments, index);

  if (!wardrobe && !environment) return undefined;
  return { wardrobe, environment };
}

/**
 * Style-reference guidance — person replacement over reference frames.
 * Preserve scene, palette, composition, and Pinterest-grade photographic world; swap only identity.
 */
export function buildLookalikeRefInstructions(
  referenceCount: number,
  options?: { shotIndex?: number; coverChainOnly?: boolean },
): string {
  if (options?.coverChainOnly) {
    return (
      `Identity-locked follow-up: the attached cover portrait is the sole image reference. ` +
      `Same face, hair, skin, and body as the cover. Preserve the cover's color grade, lighting quality, and environmental mood. ` +
      `Follow Shot for a clearly different angle and crop — do not revert to generic backgrounds or studio seamless.`
    );
  }

  const n = Math.min(Math.max(referenceCount, 1), 3);
  const imageLabel =
    n === 1 ? "Image 1" : n === 2 ? "Images 1–2" : "Images 1–3";
  const isCover = (options?.shotIndex ?? 0) === 0;

  if (isCover) {
    return (
      `PERSON REPLACEMENT over style references (${imageLabel}). ` +
      `Treat attached photos as the creative template for everything except the human subject. ` +
      `PRESERVE from references: scene and setting (location, architecture, background depth, bokeh), ` +
      `dominant color palette and accent colors, wardrobe color family and fabric vibe (dress the Identity person in equivalent hues/textures — not a pixel copy of the reference outfit), ` +
      `camera angle, framing, crop, pose energy, prop placement (use generic unbranded equivalents — no readable logos), ` +
      `lighting direction and quality (window sidelight, golden hour, gym daylight, etc.), lens character, shallow depth of field, contrast, HDR/phone look, grain, and Pinterest-ready influencer polish. ` +
      `REPLACE ONLY: the person — render the Identity subject instead of whoever appears in the references (new face, hair, skin, body per Identity and character sheet). ` +
      `Do NOT copy reference faces, bodies, tattoos, or distinctive identity marks. ` +
      `Output must feel like the same photoshoot/frame with a different model — not a generic stock portrait.`
    );
  }

  return (
    `Same generated person as the cover portrait — consistent identity across the pack. ` +
    `Keep the photographic world from references (${imageLabel}) and the cover: same color grade, lighting quality, environmental mood, and creator aesthetic. ` +
    `Follow Shot for angle/crop variation; do not revert to bland generic backgrounds.`
  );
}

/** @deprecated Use buildLookalikeRefInstructions */
export const buildHybridCoverRefInstructions = buildLookalikeRefInstructions;

/** Adapt shot suffixes for style-reference cover — match reference frame, substitute Identity person. */
function adaptShotSuffixForRefs(
  suffix: string,
  shotIndex: number,
  coverChainOnly?: boolean,
): string {
  if (coverChainOnly) {
    return `${suffix} Same generated person as the attached cover portrait; preserve cover color grade, lighting, and environmental mood.`;
  }
  if (shotIndex === 0) {
    return (
      "Pinterest-style influencer portrait locked to the reference frame: match reference composition, camera distance, crop, and pose type, " +
      "but substitute the Identity person. Sharp face, natural skin texture with pores, aspirational yet authentic smartphone HDR — not a generic studio headshot."
    );
  }
  return `${suffix} Same generated person as the cover; preserve reference color palette, lighting world, and environmental mood.`;
}

/** Assemble the structured prompt doc from identity + shot + options. */
export function buildInfluencerPromptDoc(
  identity: string,
  shot: InfluencerShot,
  ctx?: BuildInfluencerShotPromptContext,
): InfluencerPromptDoc {
  const accessories = expandAccessories(ctx?.accessories);
  const coverChainOnly = ctx?.coverChainOnly ?? false;
  const userReferenceCount = ctx?.userReferenceCount ?? 0;
  const refMode = userReferenceCount > 0 || coverChainOnly;
  const shotIndex = ctx?.shotIndex ?? 0;
  const coverRefMode =
    userReferenceCount > 0 && shotIndex === 0 && !coverChainOnly;

  const directions = ctx?.directions?.trim() || undefined;
  // On cover with references, let attached images define grade/style — form tags fight the ref frame.
  const aesthetics = coverRefMode
    ? undefined
    : ctx?.aestheticTags?.filter(Boolean).slice(0, 2);
  const photoStyle = coverRefMode
    ? undefined
    : ctx?.photoStyle
      ? PHOTO_STYLE_CUE[ctx.photoStyle]
      : undefined;

  return {
    identity: identity.trim(),
    shot: refMode
      ? adaptShotSuffixForRefs(
          shot.promptSuffix.trim(),
          shotIndex,
          coverChainOnly,
        )
      : shot.promptSuffix.trim(),
    scene: resolveInfluencerPromptScene(shot, ctx),
    accessories: coverRefMode
      ? undefined
      : accessories.length > 0
        ? accessories
        : undefined,
    photoStyle,
    aesthetics: aesthetics && aesthetics.length > 0 ? aesthetics : undefined,
    directions,
    referenceGuidance: refMode
      ? buildLookalikeRefInstructions(userReferenceCount, {
          shotIndex,
          coverChainOnly,
        })
      : undefined,
    quality: INFLUENCER_EXCLUSIONS,
  };
}

function formatSceneSection(scene: InfluencerPromptScene): string {
  const parts = [
    scene.wardrobe ? `wearing ${scene.wardrobe}` : null,
    scene.environment ? `in ${scene.environment}` : null,
    scene.action ?? null,
  ].filter(Boolean);
  return parts.join(", ");
}

/**
 * Deterministic labeled prose for image models.
 * In reference mode, References leads — scene/colors/composition lock to attached images.
 */
export function renderInfluencerPrompt(doc: InfluencerPromptDoc): string {
  const sections: string[] = [];

  if (doc.referenceGuidance) {
    sections.push(doc.referenceGuidance);
    sections.push(`Identity: ${doc.identity}`);
    sections.push(`Shot: ${doc.shot}`);
  } else {
    sections.push(`Identity: ${doc.identity}`, `Shot: ${doc.shot}`);
  }

  if (
    doc.scene &&
    (doc.scene.wardrobe || doc.scene.environment || doc.scene.action)
  ) {
    sections.push(`Scene: ${formatSceneSection(doc.scene)}.`);
  }

  if (doc.accessories && doc.accessories.length > 0) {
    sections.push(`Accessories: ${doc.accessories.join("; ")}.`);
  }

  const styleBits = [
    doc.photoStyle,
    doc.aesthetics && doc.aesthetics.length > 0
      ? `Aesthetic vibe: ${doc.aesthetics.join(", ")}.`
      : null,
  ].filter(Boolean);
  if (styleBits.length > 0) {
    sections.push(`Style: ${styleBits.join(" ")}`);
  }

  if (doc.directions) {
    sections.push(`Direction: ${doc.directions}`);
  }

  sections.push(`Quality: ${doc.quality}`);

  return sections.join("\n");
}

/**
 * identity (fixed) + shot + scene + accessories + vibe + directions.
 * Builds a structured doc, then renders labeled natural language for the image model.
 */
export function buildInfluencerAnchorPrompt(
  basePromptFragment: string,
  shot: InfluencerShot,
  ctx?: BuildInfluencerShotPromptContext,
): string {
  return renderInfluencerPrompt(
    buildInfluencerPromptDoc(basePromptFragment, shot, ctx),
  );
}

export type BuildCloneCoverPromptInput = {
  name: string;
  promptSuffix?: string;
};

/** Cover/gallery prompts for self-clone — identity comes from reference images. */
export function buildCloneCoverPrompt(
  input: BuildCloneCoverPromptInput,
): string {
  const suffix =
    input.promptSuffix ??
    "Front-facing head-and-shoulders portrait, soft natural light, sharp face, with a lived-in creator environment softly behind — not a blank studio wall.";

  return renderInfluencerPrompt({
    identity:
      `A photoreal portrait of ${input.name}, matching the person in the reference photos exactly —` +
      ` same face, skin tone, hair, and body proportions. Real camera look: natural skin texture with visible pores, soft real-world lighting.`,
    shot: suffix,
    quality: INFLUENCER_EXCLUSIONS,
  });
}
