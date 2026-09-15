export const LANDING_NAV = [
  { href: '/#workflow', label: 'How it works' },
  { href: '/#creative', label: 'Creative studio' },
  { href: '/#analytics', label: 'Analytics' },
  { href: '/#pricing', label: 'Pricing' },
] as const

export const HERO = {
  eyebrow: 'For marketers, agencies, founders, and growth teams',
  title: 'The AI studio to dominate social media.',
  description:
    'Create and schedule UGC videos, winning ads and carousels in one place.Learn which ideas perform best to run again.',
  primaryCta: 'Start creating free',
  googleCta: 'Continue with Google',
  secondaryCta: 'See how it works',
} as const

export const HERO_PROOF_POINTS = ['Ship content fast', 'Publish to social media', 'Free to start · no card'] as const

export const UGC_ADS = {
  title: 'Create realistic UGC ads',
  titleAccent: 'with AI',
  description:
    'Forget filming talent, juggling editors, and slow turnaround. Socialista gives you everything you need to script, generate, refine, and publish UGC-style video ads with AI.',
  items: [
    {
      id: 'creator' as const,
      title: 'Choose your creator',
      description: 'Pick AI talent and voice that match your brand, offer, and channel.',
      modelLabel: 'Creator',
      modelValue: 'Jessica · UGC',
      niches: ['Fitness', 'Wellness', 'UGC'] as const,
    },
    {
      id: 'shape' as const,
      title: 'Shape your ad',
      description: 'Edit hooks, captions, extend clips, upscale, and remix variations in one place.',
      tools: ['Edit', 'Captions', 'Upscale', 'Remix'] as const,
      activeTool: 'Captions',
    },
    {
      id: 'formats' as const,
      title: 'Start from proven formats',
      description: 'Use ready-made UGC presets built for Reels, TikTok, and paid social.',
      presets: [
        { label: 'Product in hand', icon: 'hand' as const },
        { label: 'Show your app', icon: 'smartphone' as const },
        { label: 'Unboxing', icon: 'unboxing' as const },
      ],
      activePreset: 'Show your app',
    },
  ],
} as const

export const WORKFLOW = {
  title: 'From brief to live post in one loop',
  description:
    'Brand voice, offers, and campaign details stay in one workspace—from the first idea to the post that goes live, and the next one you make from the results.',
  steps: [
    {
      number: '01',
      title: 'Set your context',
      description: 'Add brand voice, offers, products, or campaign details once.',
    },
    {
      number: '02',
      title: 'Make the variations',
      description: 'Generate UGC, static ads, and swipeable carousels from the same brief.',
    },
    {
      number: '03',
      title: 'Ship what is ready',
      description: 'Adapt captions and formats, then schedule each connected channel.',
    },
    {
      number: '04',
      title: 'Make the next winner',
      description: 'Trace performance back to the creative—not just the channel stats.',
    },
  ],
} as const

export const OUTPUT_GALLERY = {
  title: 'One brief. Formats that fit the feed.',
  description:
    'Run client campaigns, launch an app, or keep a brand feed moving—without rebuilding every asset from scratch.',
  items: [
    { id: 'ugc', title: 'Creator-style UGC', description: 'Hooks that feel native on Reels and TikTok.' },
    { id: 'ad', title: 'Static and motion ads', description: 'Offers, launches, and apps held in one clear frame.' },
    { id: 'carousel', title: 'Swipeable stories', description: 'Educate, tease, or convert across a sequence.' },
  ],
} as const

export const CAPABILITIES = {
  title: 'Everything between an idea and a published post',
  description:
    'Creative, publishing, and learning in one workspace—whether you run one brand, many clients, or a product you are growing.',
  items: [
    {
      title: 'Context-aware creative',
      description: 'Brand voice, offers, and campaign details stay tied to every generation.',
    },
    {
      title: 'A shared publishing desk',
      description: 'Draft, adapt captions, schedule, and review the calendar together.',
    },
    {
      title: 'Creative that learns',
      description: 'See the posts behind the signal, then open the exact run to iterate.',
    },
  ],
} as const

export const ANALYTICS = {
  title: 'Know what to make again',
  description:
    'Tie every result back to the creative that produced it. Spot the format, hook, or angle worth repeating—across brands, clients, or channels.',
  items: [
    {
      id: 'workspace' as const,
      title: 'One clear view',
      description: 'Your workspace, channels, and posts in one place.',
    },
    { id: 'channels' as const, title: 'Results by channel', description: 'See where each idea earns attention.' },
    {
      id: 'iteration' as const,
      title: 'A faster next brief',
      description: 'Open the source creative and make the follow-up while it is fresh.',
    },
  ],
} as const

export type AnalyticsFeatureId = (typeof ANALYTICS.items)[number]['id']

export const PRICING_SECTION = {
  title: 'Start with an idea. Scale with your output.',
  description:
    'Try the studio without a card. Upgrade when your team needs more creative capacity, seats, or connected accounts.',
  fallbackTitle: 'Plans live in your workspace.',
  fallbackDescription: 'Create an account to see current pricing, credits, and team limits for your region.',
} as const

export const FAQ_SECTION = {
  title: 'The practical questions',
  description: 'Ownership, workflow, publishing, and billing.',
} as const

export const FAQ_ITEMS = [
  {
    question: 'Who is Socialista for?',
    answer:
      'Marketers, agencies, founders, and growth teams use Socialista to create and publish social creative—whether you are promoting a product, an app, a service, or a client account.',
  },
  {
    question: 'Can I save brand and campaign context?',
    answer:
      'Yes. Store brand voice, offers, products, and creative rules in your workspace, then reuse them across UGC, ads, carousels, and scheduled posts.',
  },
  {
    question: 'What can I create in Socialista?',
    answer:
      'UGC-style video, static and motion ads, images, slideshows, and channel-ready post creative—built for common social formats.',
  },
  {
    question: 'Which channels can I publish to?',
    answer:
      'Connect Instagram, TikTok, YouTube, X, LinkedIn, Pinterest, Facebook, and Threads. Adapt each post before it enters the queue.',
  },
  {
    question: 'Who owns the creative I generate?',
    answer:
      'Your workspace owns the files you generate and upload. Keep them in your library, export them, or schedule them from Socialista.',
  },
  {
    question: 'Can my team work in the same workspace?',
    answer:
      'Yes. Invite teammates to collaborate on shared context, files, creative, and publishing—useful for in-house teams and agencies alike.',
  },
  {
    question: 'Can I cancel a paid plan?',
    answer: 'Yes. You can cancel from billing and keep access through the end of the current billing period.',
  },
] as const

export const FINAL_CTA = {
  title: 'Your next campaign starts in one studio.',
  description: 'Start creating for free. No credit card required.',
} as const

export const FOOTER = {
  tagline: 'The AI social studio for teams that create, publish, and learn.',
  columns: [
    {
      title: 'Product',
      links: [
        { href: '/#workflow', label: 'How it works' },
        { href: '/#creative', label: 'Creative studio' },
        { href: '/#analytics', label: 'Analytics' },
        { href: '/#pricing', label: 'Pricing' },
      ],
    },
    {
      title: 'Create',
      links: [
        { href: '/#creative', label: 'UGC video' },
        { href: '/#creative', label: 'Static ads' },
        { href: '/#creative', label: 'Carousels' },
      ],
    },
    {
      title: 'Account',
      links: [
        { href: '/auth/signup', label: 'Start creating free' },
        { href: '/auth/signin', label: 'Sign in' },
      ],
    },
  ],
} as const

export const PAGE_METADATA = {
  title: 'Socialista — AI social studio for marketers and teams',
  description:
    'Create UGC, ads, and carousels. Publish to every major channel and learn which creative to make next—for brands, agencies, founders, and app teams.',
} as const

// Temporary compatibility data for detail components retained outside the new
// conversion path. These are not rendered by the home page.
export const PLATFORMS = [
  { id: 'instagram' as const, label: 'Instagram' },
  { id: 'tiktok' as const, label: 'TikTok' },
  { id: 'youtube' as const, label: 'YouTube' },
  { id: 'linkedin' as const, label: 'LinkedIn' },
  { id: 'facebook' as const, label: 'Facebook' },
  { id: 'threads' as const, label: 'Threads' },
  { id: 'pinterest' as const, label: 'Pinterest' },
  { id: 'twitter' as const, label: 'X' },
] as const
export type PlatformId = (typeof PLATFORMS)[number]['id']

export const PLATFORMS_SECTION = {
  title: 'One click to every channel',
  description:
    'Connect Instagram, TikTok, YouTube, LinkedIn, and the rest. Native ratios, captions per platform—queue from the same place you create.',
} as const

export const PUBLISH = {
  title: 'Schedule from Socialista',
  description: 'Adapt each post for every connected account.',
  cta: HERO.primaryCta,
} as const
export const FEATURE_MARQUEE = {
  rowA: ['UGC Studio', 'Static Ads', 'Captions'],
  rowB: ['Video Studio', 'Composer', 'Analytics'],
} as const
export const HERO_SOCIAL_PROOF = {
  lead: 'Built for the way social teams actually work',
  subline: 'Marketers · agencies · founders · mobile apps · e-commerce',
} as const
export const HERO_SLIDES = [
  {
    id: 'ugc' as const,
    layout: 'caption' as const,
    hook: 'POV: you posted today',
    line: 'without opening five tabs',
    likes: '128.0K',
    views: '410.0K',
  },
  {
    id: 'video' as const,
    layout: 'caption' as const,
    hook: 'Shot in the browser.',
    line: 'Trim, caption, export — then schedule.',
    likes: '86.4K',
    views: '275.0K',
  },
  {
    id: 'carousel' as const,
    layout: 'card' as const,
    hook: '1. Create once',
    line: 'Native ratios. A caption per channel.',
    likes: '64.2K',
    views: '198.0K',
  },
  {
    id: 'ads' as const,
    layout: 'caption' as const,
    hook: 'Brief in. Ad out.',
    line: 'Headline and CTA stay in-frame.',
    likes: '52.8K',
    views: '163.0K',
  },
  {
    id: 'talent' as const,
    layout: 'caption' as const,
    hook: 'A face your brand owns',
    line: 'Reused across stills and UGC.',
    likes: '91.5K',
    views: '312.0K',
  },
  {
    id: 'slideshow' as const,
    layout: 'card' as const,
    hook: 'Slides that swipe',
    line: 'AI carousel, ready to publish.',
    likes: '73.1K',
    views: '224.0K',
  },
  {
    id: 'influencer' as const,
    layout: 'caption' as const,
    hook: 'Your AI creator roster',
    line: 'One persona. Every format.',
    likes: '58.6K',
    views: '189.0K',
  },
] as const
export const STUDIO_BENTO = {
  eyebrow: 'Studio',
  titleEmoji: '✦',
  title: OUTPUT_GALLERY.title,
  description: OUTPUT_GALLERY.description,
  usedByLabel: 'Formats',
  usedBy: [],
  cards: OUTPUT_GALLERY.items,
} as const
export type StudioBentoCardId = (typeof STUDIO_BENTO.cards)[number]['id']
export const ADDITIONAL_FEATURES = {
  title: CAPABILITIES.title,
  description: '',
  cards: [
    { id: 'brand-profile' as const, title: 'Brand profile', description: CAPABILITIES.items[0].description },
    { id: 'post-composer' as const, title: 'Post composer', description: CAPABILITIES.items[1].description },
    { id: 'content-calendar' as const, title: 'Content calendar', description: CAPABILITIES.items[1].description },
    { id: 'video-editor' as const, title: 'Video editor', description: 'Refine video before it is ready to publish.' },
    { id: 'skills' as const, title: 'Creative rules', description: CAPABILITIES.items[0].description },
    { id: 'products' as const, title: 'Products', description: CAPABILITIES.items[0].description },
  ],
} as const
export type AdditionalFeatureId = (typeof ADDITIONAL_FEATURES.cards)[number]['id']
export const INFLUENCER_SECTION = {
  title: 'Your brand deserves',
  titleAccent: 'a face',
  eyebrow:
    'Spin up an AI creator in seconds — put them on your product, in your app, or in your fit. Same persona across every clip and still.',
  cta: 'Try an AI creator',
  mockup: {
    badge: 'Made in Socialista',
    username: '@jessica.socialista',
    caption: 'POV: your brand finally has a face it owns',
    hashtags: '#aicreator #ugc',
  },
  features: [
    {
      id: 'quality' as const,
      side: 'left' as const,
      title: 'Looks like real UGC',
      description: 'Photoreal creators on camera—or with your offer in frame—not stiff stock.',
    },
    {
      id: 'consistency' as const,
      side: 'left' as const,
      title: 'Same face everywhere',
      description: 'One persona across Reels, carousels, ads, and thumbnails.',
    },
    {
      id: 'control' as const,
      side: 'right' as const,
      title: 'You steer the vibe',
      description: 'Energy, style, and wardrobe tuned to your brand — not a random face swap.',
    },
    {
      id: 'ownership' as const,
      side: 'right' as const,
      title: 'Yours to reuse',
      description: 'Drop your creator into any video, image, or ad in the studio.',
    },
  ],
} as const
export type InfluencerFeatureId = (typeof INFLUENCER_SECTION.features)[number]['id']

export const INFLUENCER_SWIPE_CREATORS = [
  {
    id: 'maya',
    name: 'Maya',
    age: 26,
    hook: 'Wellness · talking-head UGC',
    tags: ['Warm', 'Reels-ready'] as const,
    objectPosition: '50% 12%',
  },
  {
    id: 'jordan',
    name: 'Jordan',
    age: 24,
    hook: 'Fitness · product in hand',
    tags: ['Energetic', 'Ads'] as const,
    objectPosition: '50% 18%',
  },
  {
    id: 'elena',
    name: 'Elena',
    age: 23,
    hook: 'Beauty · tutorial style',
    tags: ['Polished', 'Carousel'] as const,
    objectPosition: '50% 14%',
  },
  {
    id: 'kai',
    name: 'Kai',
    age: 27,
    hook: 'Lifestyle · street casual',
    tags: ['Relatable', 'TikTok'] as const,
    objectPosition: '50% 16%',
  },
  {
    id: 'sofia',
    name: 'Sofia',
    age: 22,
    hook: 'Fashion · try-on energy',
    tags: ['Bold', 'Short-form'] as const,
    objectPosition: '50% 10%',
  },
  {
    id: 'noah',
    name: 'Noah',
    age: 25,
    hook: 'Tech · demo friendly',
    tags: ['Clear', 'Explainers'] as const,
    objectPosition: '50% 15%',
  },
] as const
