export type InfluencerScenePrompt = {
  environment: string
  wardrobeHint?: string
  actionCue?: string
}

export type InfluencerNicheScene = {
  wardrobe: string[]
  environments: string[]
}

/** Scene expansions. Each one should look like a frame this creator already posts. */
export const INFLUENCER_SCENE_PROMPTS: Record<string, InfluencerScenePrompt> = {
  home: {
    environment:
      "apartment living room in warm neutrals, morning window light, a linen sofa, a plant, and a ceramic mug",
    wardrobeHint: "elevated lounge layers in a neutral palette",
  },
  "kitchen-cooking": {
    environment:
      "kitchen counter mid-recipe, wood or stone surface, window sidelight, a skillet and a linen towel",
    wardrobeHint: "casual kitchen clothes and a simple apron",
    actionCue: "mid-cook, hands busy, talking to the phone propped nearby",
  },
  "bedroom-morning": {
    environment:
      "bedroom with lived-in linen bedding, warm morning window light, a phone on the nightstand",
    wardrobeHint: "sleep-to-day lounge set in one calm color",
  },
  "bathroom-vanity": {
    environment:
      "pale bathroom vanity, window sidelight and mirror bounce, a small tray of plain bottles, the mirror they film in",
    wardrobeHint: "simple top, face and hair are the post",
  },
  "coffee-shop": {
    environment:
      "café window seat, one drink on a small table, daylight on the face, warm interior behind",
    wardrobeHint: "café outfit with a jacket or knit, the kind they post",
    actionCue: "paused with the drink, mid-conversation to camera",
  },
  restaurant: {
    environment:
      "restaurant table at dusk, warm lamps, a ceramic plate and a glass, candid dinner light",
    wardrobeHint: "dinner outfit they would post, polished and wearable",
  },
  "podcast-setup": {
    environment:
      "the podcast corner they record in, warm lamp, a mic in frame, shelves or panels behind",
    wardrobeHint: "smart-casual layers they wear on the show",
    actionCue: "talking into the mic, engaged, mid-sentence",
  },
  gym: {
    environment:
      "bright boutique gym, mirror wall catching window light, a rack and a mat behind, clean but in use",
    wardrobeHint: "matching unbranded activewear in one clean color",
    actionCue: "paused between sets, phone propped, casual confidence",
  },
  yoga: {
    environment:
      "light wood floor by a tall window, a mat and one plant, calm morning light",
    wardrobeHint: "matching athleisure in a calm color",
    actionCue: "settled on the mat after the flow, easy stillness",
  },
  "outdoor-run": {
    environment:
      "tree-lined path at golden hour, park or city depth behind, the light of a posted run photo",
    wardrobeHint: "matching unbranded run set",
    actionCue: "paused on the path, phone in hand, post-run ease",
  },
  airport: {
    environment:
      "airport window seat, a carry-on at their feet, cool daylight, a travel-day still",
    wardrobeHint: "travel outfit with a light jacket, comfortable and considered",
  },
  plane: {
    environment:
      "airplane window seat, daylight on the face, the aisle behind, a creator travel still",
    wardrobeHint: "easy flight layers in a neutral color",
  },
  car: {
    environment:
      "car front seat, daylight through the windshield, the angle of a commute selfie they post",
    wardrobeHint: "everyday layers, a jacket on the seat",
    actionCue: "talking to the phone camera, candid car vlog",
  },
  "hotel-room": {
    environment:
      "hotel room, white bedding, a city window, warm lamp, a suitcase half-open",
    wardrobeHint: "trip-day outfit, polished and packable",
  },
  beach: {
    environment:
      "shoreline in late-day sun, sand and water behind, wind in the hair, a walk rather than a swim set",
    wardrobeHint: "light beach layers, a shirt or cover-up over simple clothes",
  },
  street: {
    environment:
      "downtown sidewalk, the outfit is the subject, storefront color behind, daylight",
    wardrobeHint: "one considered street-style outfit",
  },
  snow: {
    environment:
      "snowy path, cold daylight, coat and scarf readable, breath in the air",
    wardrobeHint: "winter coat and scarf in a clean color story",
  },
  "winter-city": {
    environment:
      "winter city sidewalk, shop-window glow, cool daylight, a posted cold-weather frame",
    wardrobeHint: "layered city coat outfit",
  },
  store: {
    environment:
      "boutique aisle, shelves behind, haul-video light, one item in hand",
    wardrobeHint: "shopping-day outfit, casual and camera-ready",
    actionCue: "finding something on the shelf, haul energy",
  },
  "farmers-market": {
    environment:
      "market stall, produce color, canvas shade, weekend morning sun",
    wardrobeHint: "weekend market outfit, easy layers",
  },
  "streaming-desk": {
    environment:
      "the night desk they stream from, monitor glow, a mic, hoodie in frame",
    wardrobeHint: "the hoodie or tee they wear on stream",
  },
  "asmr-desk": {
    environment:
      "close desk they whisper to camera from, warm lamp, a mic and one small prop",
    wardrobeHint: "quiet on-camera layers in a muted color",
    actionCue: "close to the mic, quiet speaking energy",
  },
  "mirror-ootd": {
    environment:
      "full-length mirror in a bedroom or hallway, daylight, the outfit-check spot they film",
    wardrobeHint: "the outfit of the post, head to shoes readable",
    actionCue: "phone in hand, checking the outfit in the mirror",
  },
  "product-hook": {
    environment:
      "their usual filming corner, window light, a plain unbranded product held up",
    wardrobeHint: "clean on-camera top that does not compete with the product",
    actionCue: "holding the product toward camera, hook-face energy",
  },
  "pointing-reveal": {
    environment:
      "their filming corner with open space beside them, daylight, room for a reveal",
    wardrobeHint: "simple layers, hands free",
    actionCue: "pointing just off-frame at a product, surprised reveal",
  },
  "sitting-testimonial": {
    environment:
      "the couch or café booth they talk from, warm practical light, a posted sit-down frame",
    wardrobeHint: "approachable everyday layers",
    actionCue: "leaning in mid-story, talking to camera",
  },
  "pregnant-bump": {
    environment:
      "home living room, warm window light, a quiet daytime frame",
    wardrobeHint: "comfortable clothes that read clearly on camera",
    actionCue: "a natural hand-on-bump moment, easy smile",
  },
  library: {
    environment:
      "library table, warm lamp, a stack of books, study-with-me light",
    wardrobeHint: "cardigan or knit over a simple top",
    actionCue: "explaining a note, book in hand",
  },
  classroom: {
    environment:
      "classroom, whiteboard behind, daylight from high windows, teaching from the desk",
    wardrobeHint: "approachable teacher layers",
    actionCue: "mid-lesson, talking to camera as if to the class",
  },
  "study-desk": {
    environment:
      "the study desk they film at, open notebook, a mug, warm lamp",
    wardrobeHint: "comfortable study layers",
    actionCue: "leaning in over a note, study-with-me",
  },
  "home-office": {
    environment:
      "home office they record explainers in, laptop open, daylight, a bookshelf behind",
    wardrobeHint: "smart-casual work-from-home layers",
    actionCue: "mid-explainer at the desk",
  },
  "grocery-store": {
    environment:
      "grocery aisle, shelves behind, cool overhead light, a product in hand, errand-vlog frame",
    wardrobeHint: "errand-day casual",
    actionCue: "picking something off the shelf, talking to camera",
  },
  park: {
    environment:
      "park path, green behind, daylight, paused mid-walk",
    wardrobeHint: "outdoor layers they would post",
    actionCue: "stopped on the path, talking to camera",
  },
  balcony: {
    environment:
      "apartment balcony, plants, city behind, morning light, coffee in hand",
    wardrobeHint: "elevated lounge layers",
    actionCue: "coffee on the balcony, relaxed and posted",
  },
  "unboxing-desk": {
    environment:
      "the desk they film at, an open mailer, packing paper, window light",
    wardrobeHint: "clean on-camera casual",
    actionCue: "lifting a plain product out of the box toward camera",
  },
  grwm: {
    environment:
      "the vanity they get ready at, window light, plain bottles and a mirror, mid-routine",
    wardrobeHint: "simple get-ready top, face is the focus",
    actionCue: "mid get-ready routine, talking to the mirror camera",
  },
  playground: {
    environment:
      "edge of a neighborhood playground, equipment behind, daylight, a parent paused with the phone",
    wardrobeHint: "practical everyday clothes",
    actionCue: "a short outdoor pause, talking to camera",
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
  books: "open book or a small stack of books in hand or nearby",
  notebook: "notebook or journal nearby, maybe a pen in hand",
  backpack: "everyday backpack worn or resting nearby",
};

/** On-camera energy / demeanor — independent of visual aesthetic. */
export const INFLUENCER_VIBE_PROMPTS: Record<string, string> = {
  energetic:
    "high-energy talking-to-camera presence, animated eyebrows, big genuine smile",
  calm: "grounded, unhurried presence, soft smile, steady eye contact",
  confident:
    "assured talking-head energy, relaxed posture, direct eye contact without stiffness",
  playful: "light teasing energy, easy laugh, slightly raised brows, candid grin",
  warm: "approachable kindness, genuine smile that reaches the eyes, inviting eye contact",
  authoritative:
    "calm authority, measured expression, slight lean-in as if explaining a tip",
  quirky: "offbeat charm, mischievous half-smile, expressive micro-expressions",
  aspirational:
    "polished-but-real creator glow, composed smile, the ease of someone whose feed already looks like this",
};

/**
 * Niche wardrobe + atmosphere when the user did not pick a scene.
 * Same bar as the scene list: a place this creator already films.
 */
export const INFLUENCER_NICHE_SCENES: Record<string, InfluencerNicheScene> = {
  fitness: {
    wardrobe: [
      "matching unbranded activewear in one clean color",
      "athleisure set they would post",
    ],
    environments: [
      "bright boutique gym, mirror wall and window light, a rack and mat behind, clean but in use",
      "tree-lined path at golden hour, the light of a posted run photo",
      "home workout corner, a mat by a tall window, morning light",
    ],
  },
  fashion: {
    wardrobe: [
      "one considered street-style outfit",
      "elevated everyday layers with one statement piece",
    ],
    environments: [
      "downtown sidewalk, the outfit is the subject, storefront color behind, daylight",
      "loft with concrete and a large window, outfit-check light",
      "boutique mirror, warm lamps, a fitting-room still they would post",
    ],
  },
  beauty: {
    wardrobe: [
      "simple top, face and hair are the post",
      "plain crewneck that keeps the frame on skin and hair",
    ],
    environments: [
      "pale bathroom vanity, window sidelight and mirror bounce, a tray of plain bottles",
      "bedroom vanity, morning light, plain bottles in use",
      "makeup desk by a window, a plant behind, get-ready light",
    ],
  },
  travel: {
    wardrobe: [
      "linen travel layers",
      "travel outfit with a light jacket, comfortable and considered",
    ],
    environments: [
      "scenic overlook at golden hour, landscape behind, a posted trip frame",
      "café terrace, warm afternoon light, one drink, travel-day outfit",
      "cobblestone street, daylight, carry-on or a small bag, a walk through the city",
    ],
  },
  tech: {
    wardrobe: [
      "the hoodie they wear on camera",
      "creator tee under an open overshirt",
    ],
    environments: [
      "desk they record at, a monitor glow, warm lamp, plants or shelves behind",
      "co-working loft, glass and plants, daylight, laptop open",
      "home office nook, laptop and a notebook, the explainer setup",
    ],
  },
  food: {
    wardrobe: ["casual kitchen clothes and a simple apron", "everyday kitchen layers"],
    environments: [
      "kitchen counter mid-recipe, window sidelight, a skillet and a linen towel",
      "dining table, daylight, one plated dish, a posted recipe still",
      "market stall, produce color, canvas shade, weekend morning",
    ],
  },
  gaming: {
    wardrobe: ["the hoodie they stream in", "casual tee from their usual setup"],
    environments: [
      "night desk they stream from, monitor glow and a mic",
      "living-room couch at night, a controller nearby, screen glow",
      "streamer desk, mic and monitor behind, their actual setup",
    ],
  },
  lifestyle: {
    wardrobe: ["elevated casual layers in a neutral palette", "knit and jeans, a posted everyday outfit"],
    environments: [
      "apartment living room in warm neutrals, morning window light, a plant and a mug",
      "café window seat, one drink, daylight on the face",
      "apartment balcony, plants, city behind, morning coffee",
    ],
  },
  business: {
    wardrobe: ["smart-casual blazer over a simple top", "polished business-casual they post in"],
    environments: [
      "glass office, daylight, skyline behind, a working portrait",
      "clean desk, laptop and notebook, explainer light",
      "city café corner, warm interior, a meeting that looks posted",
    ],
  },
  comedy: {
    wardrobe: ["expressive casual clothes", "graphic tee under an open shirt"],
    environments: [
      "lived-in living room they joke to camera from, daylight, real furniture",
      "kitchen they film bits in, overhead light, a counter in use",
      "hallway mirror, casual home, a quick posted bit",
    ],
  },
  wellness: {
    wardrobe: ["lounge set in one calm color", "matching athleisure in a calm color"],
    environments: [
      "bedroom with lived-in linen, warm morning window light",
      "balcony with plants, calm outdoor light, a quiet morning post",
      "mat by a tall window, light wood floor, morning light",
    ],
  },
  finance: {
    wardrobe: ["clean smart-casual", "neat sweater over a collared shirt"],
    environments: [
      "home office they explain from, a monitor with charts, daylight",
      "tidy workspace, clean desk, laptop open",
      "quiet café booth, laptop and notebook, a posted work session",
    ],
  },
  parenting: {
    wardrobe: ["comfortable everyday clothes", "practical casual layers"],
    environments: [
      "family kitchen, morning window light, a real breakfast counter",
      "living room, toys out of the main focus, daytime light",
      "park path, green behind, a parent paused mid-walk",
    ],
  },
  pets: {
    wardrobe: ["walk-ready casual layers", "outdoor clothes they post in"],
    environments: [
      "park path, green behind, daylight, a walk",
      "living room, a pet bed nearby, afternoon window light",
      "backyard porch, natural light, an everyday pet moment",
    ],
  },
  education: {
    wardrobe: ["approachable smart-casual", "cardigan over a simple top"],
    environments: [
      "study desk, books and warm daylight, study-with-me",
      "library table, warm lamp, a stack of books",
      "classroom, whiteboard behind, teaching from the desk",
    ],
  },
  diy: {
    wardrobe: ["practical making clothes", "apron over casual layers"],
    environments: [
      "workshop bench, tools nearby, window light, a project in progress",
      "craft table by a window, materials out, warm light",
      "garage bench, wood and tools behind, a maker still they would post",
    ],
  },
};
