import type { StaticAdAspectRatio } from './types'

export type StaticAdFormatPreset = {
  id: string
  label: string
  description: string
  prompt: string
  aspectRatio: StaticAdAspectRatio
  trending: boolean
}

/**
 * Format starters for Meta performance creatives.
 * UGC presets must force phone-native authenticity — never cinematic AI commercials.
 * Screenshot/UI presets must force real-app authenticity — never illustrated or "AI-clean" chrome.
 */
export const STATIC_AD_FORMAT_PRESETS = [
  // ── UGC / PHONE-NATIVE ─────────────────────────────────────────────
  {
    id: 'ugc-hold',
    label: 'UGC hold',
    description: 'Real creator phone hold — not studio',
    trending: true,
    aspectRatio: '9:16' as const,
    prompt:
      "UGC: real creator holding the product toward an iPhone camera at arm's length, product large and label-readable in foreground, casual real room (visible clutter, real furniture), available window or indoor light only, mild phone grain, natural skin with visible pores — NOT cinematic, NOT studio, NOT luxury rim light, NOT airbrushed. Bold simple social headline + Shop now CTA in native Instagram-caption-style type. Meta Stories native creator still, slight handheld tilt.",
  },
  {
    id: 'ugc-fitness',
    label: 'Fitness UGC',
    description: 'Phone gym selfie / mid-workout hold',
    trending: true,
    aspectRatio: '9:16' as const,
    prompt:
      'Fitness UGC (true phone content, NOT a fitness commercial): creator in a real gym or home-gym corner taking an iPhone selfie or holding the product to camera mid-session, fluorescent or phone available light, slight sweat OK, ordinary athlete build not hyper-retouched campaign model, product close to lens and readable, vertical Stories crop, punchy social headline + CTA. Ban cinematic rim light, dark moody warehouse-gym hero lighting, golden halo, smoke, and Nike-ad posing.',
  },
  {
    id: 'ugc-selfie',
    label: 'Selfie UGC',
    description: 'First-person iPhone selfie',
    trending: true,
    aspectRatio: '9:16' as const,
    prompt:
      'UGC iPhone front-camera selfie: first-person POV, creator holding the product close to the lens, real bathroom or bedroom background slightly soft, vanity or window light only, mild wide-angle selfie distortion, natural skin texture, pack sharp and readable, simple bold headline + Shop now CTA — native Meta ad, zero studio polish, zero symmetric beauty lighting.',
  },
  {
    id: 'reaction-hook',
    label: 'Reaction hook',
    description: 'Phone reaction, not stock shock face',
    trending: true,
    aspectRatio: '9:16' as const,
    prompt:
      'UGC reaction hook: creator on an iPhone mid genuine curiosity or amusement while showing the product (NOT exaggerated stock O-face, NOT stock-photo shock), product large and readable, real room, available light, oversized simple headline + CTA — Meta Stories native, first-frame scroll-stopper.',
  },
  {
    id: 'testimonial-ugc',
    label: 'Talking head',
    description: 'Creator facing camera on phone',
    trending: false,
    aspectRatio: '9:16' as const,
    prompt:
      'Talking-head UGC: creator facing iPhone camera with product in frame, bright real room, phone-video-still energy (slight motion blur on hands OK), natural expression mid-sentence, desire headline without invented claims, clear CTA — not a studio interview set, not a podcast-mic setup.',
  },
  {
    id: 'grwm',
    label: 'Get ready with me',
    description: 'Mirror or vanity routine moment',
    trending: true,
    aspectRatio: '9:16' as const,
    prompt:
      'GRWM UGC: creator captured mid-routine at a bathroom mirror or vanity, product held or in use as one step of the routine, real countertop clutter (other products, tissues, hair ties), phone propped or handheld angle, morning or bathroom-bulb lighting, candid unposed expression, short relatable headline like a caption hook + CTA — not a glam-squad beauty shoot, not ring-light perfect symmetry.',
  },

  // ── UNBOXING / DEMO ─────────────────────────────────────────────────
  {
    id: 'unboxing',
    label: 'Unboxing',
    description: 'Real desk/bed phone unboxing',
    trending: true,
    aspectRatio: '1:1' as const,
    prompt:
      'UGC unboxing: phone photo of hands opening a real package on a desk or bed, product emerging readable, messy-real not styled set (crumpled packing paper, real desk objects nearby), available indoor light, conversion headline + CTA — avoid cinematic luxury reveal, velvet, gold halo, and stock tissue-paper cliché.',
  },
  {
    id: 'demo-use',
    label: 'Demo in use',
    description: 'Most satisfying mid-action freeze',
    trending: true,
    aspectRatio: '1:1' as const,
    prompt:
      'Product demo peak moment — hands pouring, applying, opening, or using the product mid-action with real physics and a touch of imperfection (a drip, a fold, a spark), tight social crop, pack readable when visible, conversion headline + CTA. Photoreal and specific to this exact product — not glossy generic AI liquid-splash templates.',
  },

  // ── STATIC / GRAPHIC ────────────────────────────────────────────────
  {
    id: 'flat-lay',
    label: 'Flat lay',
    description: 'Asymmetric top-down, not luxury void',
    trending: false,
    aspectRatio: '1:1' as const,
    prompt:
      'Flat lay: product as hero with 2–3 niche-true props on a tactile real surface (wood, linen, countertop — never seamless void), soft daylight, intentional asymmetry and slight overlap, conversion headline + optional CTA — ban measuring tape, black velvet, marble pedestal, and centered catalog grid.',
  },
  {
    id: 'lifestyle-ritual',
    label: 'Lifestyle ritual',
    description: 'Lived-in daily moment',
    trending: false,
    aspectRatio: '1:1' as const,
    prompt:
      'Lifestyle ritual: product in a specific real daily moment (morning counter, nightstand, desk), lived-in and believable with authentic surrounding clutter, soft available light, intimate crop, desire headline + CTA — not aspirational AI luxury-apartment stock, not a staged real-estate listing.',
  },
  {
    id: 'product-hero',
    label: 'Product hero',
    description: 'Bold pack + one unexpected set piece',
    trending: false,
    aspectRatio: '1:1' as const,
    prompt:
      'Product-hero Meta ad: exact product dominating the frame fused with ONE unexpected category-true set piece (not velvet curtains, not gold halo, not black void pedestal). High thumbnail contrast, conversion headline + Shop now CTA, lean UI, no clutter competing with the pack.',
  },
  {
    id: 'direct-response',
    label: 'Direct response',
    description: 'Big type + product + clear offer',
    trending: false,
    aspectRatio: '1:1' as const,
    prompt:
      'Direct-response Meta feed: product large and clear, bold 2–6 word conversion headline, optional short subline only if it clarifies value, strong Shop now CTA, high-contrast thumbnail silhouette, lean graphic layout — not black-and-gold luxury poster, not stock-agency typography.',
  },
  {
    id: 'before-after-safe',
    label: 'Problem → solution',
    description: 'Visual tension then product hero',
    trending: false,
    aspectRatio: '1:1' as const,
    prompt:
      'Problem→solution Meta ad: visual tension suggests everyday friction without fake medical before/after or body claims, product is the clear solution hero, tight social crop, conversion headline + CTA, claim-safe — no measuring tape body tropes, no clinical split-screen.',
  },
  {
    id: 'before-after',
    label: 'Before / after',
    description: 'Labeled split-frame transformation',
    trending: true,
    aspectRatio: '1:1' as const,
    prompt:
      'Before/after split static ad: clean vertical or horizontal divide with small legible "Before" and "After" labels, same camera angle and environment on both sides for believability. BEFORE side shows everyday friction (messy counter, dull flat color, clutter, worn surface, stale look — category-true to this product). AFTER side shows the improved result with the exact product visible as the transformation hero (clean, organized, vibrant, refreshed — photoreal, not exaggerated). Bold conversion headline + Shop now CTA in open negative space. Classic Meta performance split creative. CLAIM-SAFE: no human bodies, no skin close-ups, no weight-loss or medical transformation, no measuring tape, no clinical patient imagery, no invented timelines or results.',
  },
  {
    id: 'statistic-callout',
    label: 'Stat callout',
    description: 'Bold number/data-point hook',
    trending: true,
    aspectRatio: '1:1' as const,
    prompt:
      'Statistic-hook static ad: one oversized bold number or short data-point ("9 out of 10", "73% faster") as the dominant visual element, product placed clearly beside or below it, clean 2-color background matching brand palette, small supporting line only if needed, strong CTA — feels like a scroll-stopping infographic card, not a corporate slide, no invented or unverifiable stats.',
  },
  {
    id: 'spec-callout',
    label: 'Spec breakdown',
    description: 'Ingredient/feature label-style graphic',
    trending: false,
    aspectRatio: '1:1' as const,
    prompt:
      'Spec/ingredient breakdown ad: product shot with 3–5 short callout lines and leader lines pointing to real features, materials, or ingredients on the pack, clean editorial layout on a simple background, small legible sans-serif labels, conversion headline + CTA — reads like a premium spec sheet, not a cluttered infomercial diagram.',
  },
  {
    id: 'countdown-urgency',
    label: 'Sale urgency',
    description: 'Bold countdown / limited-time banner',
    trending: true,
    aspectRatio: '1:1' as const,
    prompt:
      'Urgency/sale static ad: product hero shot paired with a bold discount or countdown callout ("48 HOURS ONLY", "30% OFF"), high-contrast color block or ribbon graphic, punchy short headline, strong CTA button styling — energetic but on-brand, not a garish yellow-red clip-art sale banner.',
  },

  // ── SOCIAL PROOF / SCREENSHOT-STYLE ─────────────────────────────────
  {
    id: 'review-screenshot',
    label: 'Review screenshot',
    description: 'Star review or quote overlay on product',
    trending: true,
    aspectRatio: '1:1' as const,
    prompt:
      'Social-proof static ad: realistic 5-star review card or short customer-quote bubble (styled like an authentic app review, avatar + name + stars) overlaid in a corner of a clean product lifestyle shot, product still the visual hero, conversion headline + CTA below — the review UI must look like a real screenshot element, not a glossy 3D badge or fake gold seal.',
  },
  {
    id: 'text-message',
    label: 'Text message ad',
    description: 'iMessage-style conversation screenshot',
    trending: true,
    aspectRatio: '9:16' as const,
    prompt:
      'Text-message-style static ad: realistic iMessage/SMS conversation UI (correct bubble shapes, timestamp, contact name, status bar) recommending or reacting to the product between two friends, product image inline or as a shared photo bubble, native phone-screenshot look with accurate iOS chrome, small caption + CTA beneath the screenshot — must read as an authentic screen capture, not a stylized illustration.',
  },
  {
    id: 'search-bar',
    label: 'Search bar hook',
    description: 'Google/search-result style curiosity ad',
    trending: true,
    aspectRatio: '1:1' as const,
    prompt:
      'Search-engine-style hook ad: realistic search bar UI at top with a relevant typed query, one or two believable result snippets below referencing the problem the product solves, product shot placed beneath as the "answer", clean native browser chrome and system font, short CTA — must look like an authentic search screenshot, not a fantasy or over-styled UI.',
  },
  {
    id: 'comparison-vs',
    label: 'Comparison / VS',
    description: 'Us vs. them split-frame',
    trending: true,
    aspectRatio: '1:1' as const,
    prompt:
      'Comparison static ad: clean vertical or diagonal split frame, one side showing the old/frustrating way (generic, not a competitor logo or trademark), other side showing the product as the upgrade, bold "VS" or arrow divider, 2–3 short comparison labels, strong CTA — punchy infographic energy, never depicting or naming a real competitor brand.',
  },

  // ── APPAREL / E-COMMERCE ─────────────────────────────────────────────
  {
    id: 'haul-tryon',
    label: 'Try-on haul',
    description: 'Phone mirror try-on, apparel-focused',
    trending: true,
    aspectRatio: '9:16' as const,
    prompt:
      'Apparel try-on UGC: creator in a real bedroom mirror taking an iPhone photo/video-still wearing the featured item, natural stance mid-twirl or adjusting fit, real room in background (bed, hangers, laundry basket OK), soft window light, honest fabric drape and true-to-life color, short size/fit caption + Shop now CTA — not a studio lookbook shot, not a runway pose.',
  },
  {
    id: 'outfit-flatlay',
    label: 'Outfit flat lay',
    description: 'Styled outfit layout, not catalog grid',
    trending: false,
    aspectRatio: '1:1' as const,
    prompt:
      'Outfit flat lay: garment laid out with 2–3 styling pieces (shoes, bag, accessory) on a textured real surface, natural creased fabric (not steamed-flat catalog perfection), soft daylight, slightly asymmetric arrangement, short styling caption + CTA — editorial and lived-in, not e-commerce product-grid sterile.',
  },

  // ── STORY / BRAND ────────────────────────────────────────────────────
  {
    id: 'founder-story',
    label: 'Founder / behind-the-brand',
    description: 'Founder holding product, personal note',
    trending: false,
    aspectRatio: '1:1' as const,
    prompt:
      'Founder-story static ad: real person (founder-styled, approachable, not a stock model) holding or standing near the product in an authentic workspace or home setting, warm natural light, short handwritten-style or clean caption sharing a personal "why we made this" line, subtle CTA — builds trust, not a corporate headshot or boardroom photo.',
  },
  {
    id: 'meme-format',
    label: 'Relatable meme',
    description: 'Meme-style text over relatable photo',
    trending: true,
    aspectRatio: '1:1' as const,
    prompt:
      'Meme-format static ad: relatable everyday photo (candid, slightly imperfect framing) paired with bold top/bottom meme-style caption text calling out a real pain point or in-joke the audience shares, product woven in naturally or shown at the bottom with a small CTA — must feel like an organic meme a friend would share, not a corporate "how do you do fellow kids" attempt, and never uses a copyrighted meme template or character.',
  },
] as const satisfies readonly StaticAdFormatPreset[]

export type StaticAdFormatPresetId = (typeof STATIC_AD_FORMAT_PRESETS)[number]['id']
