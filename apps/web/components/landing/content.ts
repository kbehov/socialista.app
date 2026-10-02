export const LANDING_NAV = [
  { href: '/#ugc-ads', label: 'UGC ads' },
  { href: '/#influencers', label: 'AI creators' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#pricing', label: 'Pricing' },
] as const

export const SIGNUP_HREF = '/auth/signup'

export const HERO = {
  eyebrow: 'New',
  eyebrowLabel: 'AI creators that hold your product',
  eyebrowHref: '/#influencers',
  title: 'Realistic UGC ads.',
  titleAccent: 'No creators needed.',
  description:
    'Pick an AI creator, drop in your product, and get scroll-stopping video ads in minutes. Then publish to every channel from the same studio.',
  primaryCta: 'Create your first ad free',
  compactCta: 'Start free',
  googleCta: 'Continue with Google',
  microline: ['Free to start', 'No credit card', 'Cancel anytime'],
  marqueeCaption: 'Made in Socialista',
} as const

/** Connect providers Socialista can actually publish to — keep in sync with `ConnectProvider`. */
export const LANDING_CHANNELS = [
  { id: 'instagram' as const, label: 'Instagram' },
  { id: 'tiktok' as const, label: 'TikTok' },
  { id: 'facebook' as const, label: 'Facebook' },
  { id: 'threads' as const, label: 'Threads' },
  { id: 'linkedin' as const, label: 'LinkedIn' },
  { id: 'twitter' as const, label: 'X' },
] as const
export type PlatformId = (typeof LANDING_CHANNELS)[number]['id']

export const PLATFORMS_SECTION = {
  eyebrow: 'Channels',
  title: 'Post to every channel',
  titleAccent: 'from one studio.',
  description:
    'Connect Instagram, TikTok, Facebook, Threads, LinkedIn, and X. Export native sizes and a caption per channel, then schedule without switching tools.',
} as const

export const MODELS_SECTION = {
  titleLead: 'One plan.',
  titleRest: 'AI models included.',
  /** Display "30+" when the catalog reaches this size */
  countThreshold: 30,
} as const

export const HERO_CHANNELS_LABEL = 'Publishes to'

/** Real numbers only — the stat line renders nothing while empty. */
export const PROOF_STATS: readonly { value: string; label: string }[] = []

export type Testimonial = {
  quote: string
  name: string
  role: string
  avatar?: string
}

/** Real customer quotes only — the testimonials section is hidden while empty. */
export const TESTIMONIALS: readonly Testimonial[] = []

export const TESTIMONIALS_SECTION = {
  eyebrow: 'Loved by creators',
  title: 'Teams shipping',
  titleAccent: 'more with less.',
} as const

export const UGC_ADS = {
  eyebrow: 'UGC ads',
  title: 'UGC that looks real,',
  titleAccent: 'made in minutes.',
  description:
    'Skip casting, filming, and editing rounds. Script, generate, refine, and publish UGC-style video ads from one studio.',
  cta: 'Make your first UGC ad',
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
  eyebrow: 'Static ads',
  title: 'Static ads that',
  titleAccent: 'actually convert.',
  cta: 'Make a static ad',
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
  eyebrow: 'Slideshows',
  title: 'Create',
  titleAccent: 'viral slideshows',
  description: 'Faceless TikTok slideshows that feel native—hooks, slides, and captions in one flow.',
  caption: 'Made in Socialista',
  cta: 'Create a slideshow',
} as const

export const IMAGE_TEMPLATES_SECTION = {
  eyebrow: 'Image templates',
  title: 'Never run out of ideas',
  titleAccent: 'for your next post.',
  description:
    'Start from studio templates—product shots, lifestyle frames, and ad-ready stills you can recreate in one tap.',
  cta: 'Browse templates',
  ctaHref: '/auth/signup',
} as const

export const VIDEOS_SECTION = {
  eyebrow: 'Videos',
  title: 'Create videos that feel like',
  titleAccent: 'top creator content.',
  description:
    'Recreate a template or clone a video you already like, then trim, caption, and finish it in the editor.',
  cta: 'Create a video',
  ctaHref: '/auth/signup',
  recreate: 'Recreate this video',
} as const

export const HOW_IT_WORKS = {
  eyebrow: 'How it works',
  title: 'From product to posted',
  titleAccent: 'in three steps.',
  description: 'No filming, no editors, no back-and-forth. Just your product and a few clicks.',
  cta: 'Try it free',
  steps: [
    {
      id: 'creator' as const,
      step: '01',
      title: 'Pick a creator',
      description: 'Choose an AI creator and voice that fit your brand and your audience.',
    },
    {
      id: 'product' as const,
      step: '02',
      title: 'Add your product and hook',
      description: 'Upload a product shot, start from a proven format, and write or generate the hook.',
    },
    {
      id: 'publish' as const,
      step: '03',
      title: 'Generate and publish',
      description: 'Get a finished vertical ad, tweak the captions, then post or schedule it everywhere.',
    },
  ],
} as const

export type HowItWorksStepId = (typeof HOW_IT_WORKS.steps)[number]['id']

export const SHIP_IT_SECTION = {
  eyebrow: 'Publish · Schedule · Analyze',
  title: 'Make it once.',
  titleAccent: 'Ship it everywhere.',
  description: 'Publish, schedule, and measure without leaving the studio—or opening five tabs.',
  cta: 'Start publishing free',
  tabs: [
    {
      id: 'publish' as const,
      label: 'Publish',
      title: 'One creative, every channel.',
      description: 'Native ratios and a caption per connected account. Post everywhere in one click.',
      bullets: [
        'Instagram, TikTok, Facebook, Threads, LinkedIn, X',
        'A caption tuned per channel',
        'Post now or queue for later',
      ],
    },
    {
      id: 'schedule' as const,
      label: 'Schedule',
      title: 'Your calendar, not a spreadsheet.',
      description: 'See the whole week at a glance and keep every channel fed without the busywork.',
      bullets: ['Week view across all accounts', 'Preview captions before they ship', 'Reschedule in a click'],
    },
    {
      id: 'analyze' as const,
      label: 'Analyze',
      title: 'See what spikes, then make more of it.',
      description: 'Reach, engagement, and the creatives behind them—without exporting spreadsheets.',
      bullets: ['Reach and engagement per account', 'Spot your top-performing creatives', 'Know what to make next'],
    },
  ],
} as const

export type ShipItTabId = (typeof SHIP_IT_SECTION.tabs)[number]['id']

export const PRICING_SECTION = {
  eyebrow: 'Pricing',
  title: 'Start with an idea.',
  titleAccent: 'Scale with your output.',
  description:
    'Try the studio without a card. Upgrade when your team needs more creative capacity, seats, or connected accounts.',
  cta: 'Choose plan',
  freeCta: 'Start free',
  footnote: 'Start free. Cancel anytime.',
  fallbackTitle: 'Plans live in your workspace.',
  fallbackDescription: 'Create an account to see current pricing, credits, and team limits for your region.',
  enterprise: {
    eyebrow: 'Need more seats or credits?',
    description: 'We’ll help you find a plan that fits how you work.',
    cta: 'Talk to us',
    href: 'mailto:sales@socialista.app?subject=Socialista%20Enterprise',
  },
  trust: ['Secure checkout', 'Cancel anytime', 'You own your creatives'] as const,
  freeTrust: 'No card to start',
} as const

export const FAQ_SECTION = {
  eyebrow: 'FAQ',
  title: 'Questions,',
  titleAccent: 'answered.',
  description: 'Everything you need to know before your first ad.',
  contactLead: 'Still have questions?',
  contactCta: 'Email us',
  contactHref: 'mailto:sales@socialista.app?subject=Question%20about%20Socialista',
} as const

export const FAQ_ITEMS = [
  {
    question: 'Do I need to film anything?',
    answer:
      'No. Pick an AI creator, add your product, and Socialista generates the video for you. You can still bring your own images and clips whenever you want.',
  },
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
    question: 'Can I try it for free?',
    answer:
      'Yes. Start without a credit card and explore the studio. Upgrade when you need more credits, seats, or connected accounts.',
  },
  {
    question: 'Can I cancel a paid plan?',
    answer: 'Yes. Cancel from billing and keep access through the end of the current billing period.',
  },
] as const

export const FINAL_CTA = {
  title: 'Your next winning ad',
  titleAccent: 'is minutes away.',
  description: 'Pick a creator, drop in your product, and publish today.',
} as const

export type FooterLink = {
  href: string
  label: string
}

export type FooterColumn = {
  title: string
  links: readonly FooterLink[]
  /** Two-column link list for longer sections (e.g. Features) */
  splitLinks?: boolean
}

export const FOOTER = {
  tagline: 'Realistic UGC ads, made with AI—then published everywhere from one studio.',
  contactEmail: 'sales@socialista.app',
  columns: [
    {
      title: 'Features',
      splitLinks: true,
      links: [
        { href: '/#influencers', label: 'AI Influencer Generator' },
        { href: '/#ugc-ads', label: 'AI UGC Video Generator' },
        { href: '/#slideshows', label: 'AI Slideshows Generator' },
        { href: '/#static-ads', label: 'AI Meta Ads Templates' },
        { href: '/#publish', label: 'Social Media Scheduling' },
        { href: '/#channels', label: 'Social Media Analytics' },
        { href: '/#image-templates', label: 'AI Image Generation' },
        { href: '/#videos', label: 'AI Video Generation' },
      ],
    },
    {
      title: 'Compare',
      links: [
        { href: '/compare/arcads', label: 'Socialista vs Arcads' },
        { href: '/compare/makeugc', label: 'Socialista vs MakeUGC' },
        { href: '/compare/buffer', label: 'Socialista vs Buffer' },
        { href: '/compare/superscale', label: 'Socialista vs Superscale' },
        { href: '/compare/heygen', label: 'Socialista vs HeyGen' },
        { href: '/compare/creatify', label: 'Socialista vs Creatify' },
      ],
    },
    {
      title: 'Industries',
      links: [
        { href: '/industries/ecommerce', label: 'Shopify & E-commerce' },
        { href: '/industries/mobile-apps', label: 'Mobile Apps' },
        { href: '/industries/saas', label: 'SaaS' },
        { href: '/industries/dropshipping', label: 'Dropshipping' },
        { href: '/industries/agencies', label: 'Marketing Agencies' },
        { href: '/industries/creators', label: 'Content Creators' },
        { href: '/industries/founders', label: 'Founders' },
      ],
    },
    {
      title: 'Company',
      links: [
        { href: 'mailto:sales@socialista.app', label: 'Contact' },
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
      ],
    },
  ] satisfies readonly FooterColumn[],
} as const

export const PAGE_METADATA = {
  title: 'Socialista — Realistic AI UGC ads, no creators needed',
  description:
    'Create realistic UGC video ads with AI creators, plus static ads, slideshows, and videos. Publish and schedule to every channel from one studio.',
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
  eyebrow: 'AI creators',
  title: 'Your brand deserves',
  titleAccent: 'a face',
  description:
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
