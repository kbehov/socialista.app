export const LANDING_NAV = [
  { href: '/#ugc-ads', label: 'UGC ads' },
  { href: '/#influencers', label: 'AI creators' },
  { href: '/#features', label: 'Features' },
  { href: '/#pricing', label: 'Pricing' },
] as const

export const HERO = {
  eyebrow: 'AI studio for social',
  title: 'Make content that',
  titleAccent: 'actually ships.',
  description:
    'UGC, ads, and carousels in one place—create, schedule, and see what hits without juggling five tabs.',
  primaryCta: 'Start creating for free',
  googleCta: 'Continue with Google',
} as const

export const HERO_PROOF_POINTS = ['Create in minutes', 'Publish everywhere', 'Free to start · no card'] as const

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

export const STATIC_ADS = {
  title: 'Make',
  titleAccent: 'Winning Ads',
  description:
    'Turn one product photo into a static ad that can actually run. Pick a proven layout, drop in your offer, and generate a frame built for paid social.',
  items: [
    {
      id: 'product' as const,
      step: '01',
      title: 'Add your product',
      description: 'Upload a product shot. Keep the bottle, the app, or the SKU in-frame—no reshoot required.',
    },
    {
      id: 'template' as const,
      step: '02',
      title: 'Select template',
      description: 'Start from layouts that already convert. Swap the product, keep the winning structure.',
    },
    {
      id: 'create' as const,
      step: '03',
      title: 'Create the ad',
      description: 'Generate a static ad in seconds. Headline, offer, and CTA locked in one clear frame.',
    },
  ],
} as const

export type StaticAdsStepId = (typeof STATIC_ADS.items)[number]['id']

export const SLIDESHOWS = {
  eyebrow: 'Slideshow studio',
  title: 'Create',
  titleAccent: 'viral slideshows',
  description:
    'Faceless TikTok slideshows that feel native—hooks, slides, and captions in one flow.',
  cta: 'Create slideshow',
} as const

export const IMAGE_TEMPLATES_SECTION = {
  eyebrow: 'Image inspirations',
  title: 'Never run out of ideas',
  titleAccent: 'for your next post.',
  description:
    'Start from studio templates—product shots, lifestyle frames, and ad-ready stills you can recreate in one tap.',
  cta: 'Browse templates',
  ctaHref: '/auth/signup',
} as const

export const VIDEOS_SECTION = {
  eyebrow: 'Video studio',
  title: 'Create videos',
  titleAccent: 'in minutes.',
  description:
    'Recreate a template or clone a video you already like, then trim, caption, and finish it in the editor.',
  cta: 'Create a video',
  ctaHref: '/auth/signup',
  recreate: 'Recreate',
  clone: 'Clone',
} as const

export const PUBLISH_SECTION = {
  eyebrow: 'Publishing',
  title: 'One creative,',
  titleAccent: 'every channel.',
  description:
    'Native ratios and captions per connected account—publish now or hand off to your queue without leaving the studio.',
} as const

export const SCHEDULING_SECTION = {
  eyebrow: 'Scheduling',
  title: 'Your calendar 📅,',
  titleAccent: 'not a spreadsheet.',
  description:
    'Queue posts per channel, preview captions, and ship on your calendar—not someone else’s.',
} as const

export const ANALYTICS_SECTION = {
  eyebrow: 'Analytics',
  title: 'See what spikes',
  titleAccent: 'before the recap.',
  description:
    'Reach, engagement, and the creatives behind the spike—without exporting spreadsheets.',
} as const

export const FEATURES_BENTO = {
  eyebrow: 'Studio tools',
  title: 'Carousels and context',
  titleAccent: 'in one workspace.',
  description:
    'Stack slides and keep brand rules attached—everything that happens before you hit publish.',
  items: [
    {
      id: 'slideshow-editor' as const,
      title: 'Slideshow editor',
      description: 'Stack slides, set pacing, and export carousels built for the feed.',
    },
    {
      id: 'context-skills' as const,
      title: 'Context and skills',
      description: 'Brands, products, and creative rules stay attached to every run.',
    },
  ],
} as const

export type FeatureBentoId = (typeof FEATURES_BENTO.items)[number]['id']

export const PRICING_SECTION = {
  title: 'Start with an idea.',
  titleAccent: 'Scale with your output.',
  description:
    'Try the studio without a card. Upgrade when your team needs more creative capacity, seats, or connected accounts.',
  cta: 'Get Started',
  footnote: 'Start free. Cancel anytime.',
  fallbackTitle: 'Plans live in your workspace.',
  fallbackDescription: 'Create an account to see current pricing, credits, and team limits for your region.',
  enterprise: {
    eyebrow: 'Need more seats or credits?',
    description: 'We’ll help you find a plan that fits how you work.',
    cta: 'Talk to us',
    href: 'mailto:sales@socialista.app?subject=Socialista%20Enterprise',
  },
  trust: [
    'Secure checkout',
    'Cancel anytime',
    'No card to start',
    'You own your creatives',
    'Shared team workspaces',
    'Instant studio access',
  ] as const,
} as const

export const FAQ_SECTION = {
  title: 'Before you try it',
  description: 'Real UGC, paid ads, ownership, and billing.',
} as const

export const FAQ_ITEMS = [
  {
    question: 'Does the UGC look real, or like AI?',
    answer:
      'Socialista is built for native UGC—talking-head clips, product-in-hand shots, and ad-ready vertical video. You pick the creator, shape hooks and captions, and refine until it matches your brand.',
  },
  {
    question: 'Can I run creatives as Meta or TikTok ads?',
    answer:
      'Yes. Export ad-ready vertical video and static frames sized for paid social, or schedule organic posts to connected accounts from the same studio.',
  },
  {
    question: 'What else can I make besides UGC?',
    answer:
      'Static and motion ads, slideshows and carousels, AI images, short-form video, and channel-ready posts—plus scheduling, publishing, and analytics in one workspace.',
  },
  {
    question: 'Who owns the files I generate?',
    answer:
      'Your workspace owns the creative you generate and upload. Keep it in your library, export it, or schedule it from Socialista.',
  },
  {
    question: 'Who is Socialista for?',
    answer:
      'Anyone shipping social creative—solo founders, small teams, and studios who want UGC, ads, and publishing in one place.',
  },
  {
    question: 'Can my team work in the same workspace?',
    answer:
      'Yes. Invite teammates to collaborate on shared context, files, creative, and publishing—useful for in-house teams and agencies alike.',
  },
  {
    question: 'Can I cancel a paid plan?',
    answer: 'Yes. Cancel from billing and keep access through the end of the current billing period.',
  },
] as const

export const FINAL_CTA = {
  title: 'Start creating today.',
  titleAccent: 'No card.',
  description: 'UGC, ads, carousels, and publishing—free to start.',
} as const

export const FOOTER = {
  tagline: 'Create, publish, and learn what hits—all in one studio.',
  columns: [
    {
      title: 'Product',
      links: [
        { href: '/#ugc-ads', label: 'UGC ads' },
        { href: '/#features', label: 'Features' },
        { href: '/#channels', label: 'Channels' },
        { href: '/#pricing', label: 'Pricing' },
      ],
    },
    {
      title: 'Create',
      links: [
        { href: '/#ugc-ads', label: 'UGC video' },
        { href: '/#static-ads', label: 'Static ads' },
        { href: '/#image-templates', label: 'Image templates' },
        { href: '/#videos', label: 'Videos' },
        { href: '/#slideshows', label: 'Slideshows' },
      ],
    },
    {
      title: 'Account',
      links: [
        { href: '/auth/signup', label: 'Start creating for free' },
        { href: '/auth/signin', label: 'Sign in' },
      ],
    },
  ],
} as const

export const PAGE_METADATA = {
  title: 'Socialista — AI studio for social',
  description:
    'Create UGC video, ads, and carousels in one studio. Publish to every major channel and learn what to make next.',
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
  title: 'Post to every channel',
  titleAccent: 'from one studio',
  description:
    'Connect Instagram, TikTok, YouTube, LinkedIn, and more. Export native sizes and captions per platform, then schedule without switching tools.',
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
  lead: 'Built for people who post every day',
  subline: 'Indie apps · brands · studios · e‑commerce',
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
export const INFLUENCER_SECTION = {
  title: 'Your brand deserves',
  titleAccent: 'a face',
  eyebrow:
    'Spin up an AI creator in seconds — put them on your product, in your app, or in your fit. Same persona across every clip and still.',
  cta: 'Try an AI creator',
  mockup: {
    badge: 'Made In Socialista',
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
