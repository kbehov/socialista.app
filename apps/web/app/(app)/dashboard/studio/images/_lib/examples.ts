export const VIBE_IDS = [
  'all',
  'ugc',
  'product',
  'founder',
  'launch',
  'ecommerce',
  'carousel',
  'linkedin',
  'tiktok',
] as const

export type VibeId = (typeof VIBE_IDS)[number]

export type IndustryId = 'agency' | 'saas' | 'ecommerce' | 'business'

export type AspectRatioId = '1:1' | '16:9' | '9:16' | '4:3'

export type ImageExample = {
  id: string
  vibe: Exclude<VibeId, 'all'>
  industry?: IndustryId
  title: string
  hook: string
  prompt: string
  negativePrompt?: string
  aspectRatio: AspectRatioId
  modelHint?: string
  imageUrl: string
  copyPromptLabel: string
  trending?: boolean
}

export const VIBE_LABELS: Record<VibeId, string> = {
  all: 'All vibes',
  ugc: 'UGC',
  product: 'Product',
  founder: 'Founder',
  launch: 'Launch',
  ecommerce: 'E-commerce',
  carousel: 'Carousel',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok hook',
}

export const VIBE_PLACEHOLDERS: Record<Exclude<VibeId, 'all'>, string> = {
  ugc: 'Describe a UGC selfie moment — who, where, and what they are feeling…',
  product: 'Describe your product in a lifestyle scene — setting, props, and mood…',
  founder: 'Describe a founder talking-head moment — tone, setting, and energy…',
  launch: 'Describe a launch visual — product hero, gradient, and space for headline…',
  ecommerce: 'Describe a shoppable flat lay or lifestyle shot for your store…',
  carousel: 'Describe a carousel slide background — colors, shapes, and text space…',
  linkedin: 'Describe a professional carousel or thought-leadership visual…',
  tiktok: 'Describe a scroll-stopping hook frame — reaction, gesture, and energy…',
}

const IPHONE_SELFIE_FRAMING =
  'first-person POV, front-facing iPhone camera selfie, arm slightly visible at the edge of frame, natural iPhone front-camera wide-angle lens distortion'

export const IMAGE_EXAMPLES: ImageExample[] = [
  {
    id: 'ugc-bedroom-selfie',
    vibe: 'ugc',
    industry: 'agency',
    title: 'Gen-Z bedroom selfie',
    hook: 'Authentic UGC that stops the scroll',
    prompt: `A young Gen-Z girl taking a casual iPhone selfie in her bedroom, ${IPHONE_SELFIE_FRAMING}, wearing a casual everyday outfit, natural relaxed expression, soft window light, slightly messy authentic background, UGC creator aesthetic, not staged`,
    aspectRatio: '9:16',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=711&fit=crop',
    copyPromptLabel: 'Copy UGC selfie prompt',
    trending: true,
  },
  {
    id: 'ugc-gym-selfie',
    vibe: 'ugc',
    industry: 'business',
    title: 'Gym selfie',
    hook: 'Fitness influencer energy in one frame',
    prompt: `A fit young woman right after a workout at the gym, ${IPHONE_SELFIE_FRAMING}, wearing a matching athletic set, confident natural expression, fluorescent gym lighting in the background, authentic fitness influencer UGC style`,
    aspectRatio: '9:16',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=711&fit=crop',
    copyPromptLabel: 'Copy gym UGC prompt',
  },
  {
    id: 'product-kitchen-demo',
    vibe: 'product',
    industry: 'ecommerce',
    title: 'Kitchen product demo',
    hook: 'Testimonial-style product hold',
    prompt: `A young man filming himself in his kitchen, ${IPHONE_SELFIE_FRAMING}, holding a skincare bottle toward the camera with a genuine excited expression, natural daylight, authentic UGC testimonial style, shallow depth of field`,
    aspectRatio: '9:16',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=711&fit=crop',
    copyPromptLabel: 'Copy product demo prompt',
    trending: true,
  },
  {
    id: 'product-flatlay',
    vibe: 'product',
    industry: 'ecommerce',
    title: 'Lifestyle flat lay',
    hook: 'Instagram-ready product story',
    prompt:
      'A minimalist Instagram flat lay of wireless earbuds, a coffee cup, notebook and sunglasses on a marble countertop, soft morning sunlight, muted neutral tones, lifestyle product photography for a social feed',
    aspectRatio: '1:1',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    copyPromptLabel: 'Copy flat lay prompt',
  },
  {
    id: 'founder-talking-head',
    vibe: 'founder',
    industry: 'saas',
    title: 'Talking-head clip',
    hook: 'Founder story in 3 seconds',
    prompt: `A confident female founder in her late 20s recording herself in a bright home office, ${IPHONE_SELFIE_FRAMING}, natural smile, smart casual outfit, plants and laptop in background, authentic startup founder aesthetic`,
    aspectRatio: '9:16',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=711&fit=crop',
    copyPromptLabel: 'Copy founder prompt',
    trending: true,
  },
  {
    id: 'launch-saas',
    vibe: 'launch',
    industry: 'saas',
    title: 'SaaS announcement',
    hook: 'Launch post with headline space',
    prompt:
      'Clean SaaS product launch social post visual, floating laptop mockup showing a dashboard UI, soft purple and white gradient background, modern startup aesthetic, plenty of negative space for headline text overlay',
    aspectRatio: '1:1',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',
    copyPromptLabel: 'Copy launch prompt',
  },
  {
    id: 'ecommerce-hero',
    vibe: 'ecommerce',
    industry: 'ecommerce',
    title: 'Shop hero banner',
    hook: 'Conversion-ready product hero',
    prompt:
      'E-commerce hero banner for a premium skincare brand, single product bottle centered on soft beige gradient, subtle shadow, clean minimal aesthetic, space on the left for promotional copy, high-end DTC brand photography',
    aspectRatio: '16:9',
    imageUrl: 'https://images.unsplash.com/photo-1620916564558-4facafa5d63b?w=711&h=400&fit=crop',
    copyPromptLabel: 'Copy e-commerce hero prompt',
  },
  {
    id: 'carousel-slide',
    vibe: 'carousel',
    industry: 'agency',
    title: 'Carousel slide',
    hook: 'Swipeable slide backgrounds',
    prompt:
      'Professional carousel slide background, abstract soft blue gradient with subtle geometric shapes, clean corporate aesthetic, large empty center area reserved for bold white headline text',
    aspectRatio: '1:1',
    imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=400&fit=crop',
    copyPromptLabel: 'Copy carousel prompt',
  },
  {
    id: 'linkedin-thought',
    vibe: 'linkedin',
    industry: 'business',
    title: 'Thought-leadership slide',
    hook: 'LinkedIn-native authority',
    prompt:
      'Professional LinkedIn carousel slide background, abstract soft blue gradient with subtle geometric shapes, clean corporate aesthetic, large empty center area reserved for bold white headline text',
    aspectRatio: '1:1',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop',
    copyPromptLabel: 'Copy LinkedIn prompt',
  },
  {
    id: 'tiktok-reaction',
    vibe: 'tiktok',
    industry: 'agency',
    title: 'Reaction hook shot',
    hook: 'Stop the scroll in 0.5s',
    prompt: `A creator mid-reaction, ${IPHONE_SELFIE_FRAMING}, eyes wide with surprise, pointing at something off-camera, bold colorful bedroom background, ring light reflection in eyes, vertical TikTok thumbnail energy, high contrast, scroll-stopping`,
    aspectRatio: '9:16',
    imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=711&fit=crop',
    copyPromptLabel: 'Copy TikTok hook prompt',
    trending: true,
  },
  {
    id: 'ugc-unboxing',
    vibe: 'ugc',
    industry: 'ecommerce',
    title: 'Unboxing moment',
    hook: 'First-impression product reveal',
    prompt: `A creator unboxing a package at their desk, ${IPHONE_SELFIE_FRAMING}, genuine excitement, natural indoor lighting, authentic unboxing UGC style, product visible in hands, casual home setting`,
    aspectRatio: '9:16',
    imageUrl: 'https://images.unsplash.com/photo-1607083206869-4c7d745fa673?w=400&h=711&fit=crop',
    copyPromptLabel: 'Copy unboxing prompt',
  },
  {
    id: 'launch-waitlist',
    vibe: 'launch',
    industry: 'saas',
    title: 'Waitlist teaser',
    hook: 'Build hype before launch day',
    prompt:
      'Minimal waitlist launch teaser visual, dark gradient background with glowing accent orb, modern SaaS aesthetic, centered negative space for "Join the waitlist" headline, subtle grain texture, premium tech brand feel',
    aspectRatio: '1:1',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop',
    copyPromptLabel: 'Copy waitlist prompt',
  },
]

export function filterExamplesByVibe(vibe: VibeId): ImageExample[] {
  if (vibe === 'all') return IMAGE_EXAMPLES
  return IMAGE_EXAMPLES.filter(example => example.vibe === vibe)
}

export function getVibePlaceholder(vibe: VibeId): string {
  if (vibe === 'all') {
    return 'Describe your image — first-person iPhone selfie, product demo, carousel slide…'
  }
  return VIBE_PLACEHOLDERS[vibe]
}
