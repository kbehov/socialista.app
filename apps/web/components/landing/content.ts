export const LANDING_NAV = [
  { href: '/#outcomes', label: 'Why Socialista' },
  { href: '/#studio', label: 'Studio' },
  { href: '/#platform', label: 'Platform' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
] as const

export const HERO = {
  title: {
    line1: {
      prefix: 'The',
      emphasis: 'fastest',
      suffix: 'way to',
    },
    line2: {
      prefix: 'create',
      sparkles: 'social content',
    },
  },
  titleLine1: 'The fastest way to',
  titleLine2: 'create social content.',
  description:
    'Generate stills, ads, carousels, and UGC — then schedule to every channel from one workspace. No exports. No extra tools.',
  googleCta: 'Continue with Google',
  primaryCta: 'Start creating free',
} as const

export const HERO_PROOF_POINTS = ['Free to start', 'No credit card', 'Cancel anytime'] as const

export const HERO_AUDIENCE = {
  title: 'Built for real content teams',
  subtitle: 'Founders, creators, and growth marketers.',
} as const

export const HERO_SLIDES = [
  {
    id: 'ugc',
    layout: 'caption' as const,
    hook: 'POV: you posted today',
    line: 'without opening five tabs',
    likes: '128.0K',
    views: '410.0K',
  },
  {
    id: 'video',
    layout: 'caption' as const,
    hook: 'Shot in the browser.',
    line: 'Trim, caption, export — then schedule.',
    likes: '86.4K',
    views: '275.0K',
  },
  {
    id: 'carousel',
    layout: 'card' as const,
    hook: '1. Create once',
    line: 'Native ratios. A caption per channel.',
    likes: '64.2K',
    views: '198.0K',
  },
  {
    id: 'ads',
    layout: 'caption' as const,
    hook: 'Catalog in. Ad out.',
    line: 'Headline and CTA stay in-frame.',
    likes: '52.8K',
    views: '163.0K',
  },
  {
    id: 'talent',
    layout: 'caption' as const,
    hook: 'A face your brand owns',
    line: 'Reused across stills and UGC.',
    likes: '91.5K',
    views: '312.0K',
  },
] as const

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

export const PLATFORMS_BEAM = {
  eyebrow: 'Distribution',
  title: 'Trending social media channels',
  description:
    'Create once, then publish natively to every major network — with per-platform previews and scheduling built in.',
  layout: {
    top: ['instagram', 'youtube', 'facebook'] as const,
    middle: ['tiktok', 'linkedin'] as const,
    bottom: ['threads', 'pinterest', 'twitter'] as const,
  },
} as const

export const STATIC_ADS_SECTION = {
  eyebrow: 'Static ads',
  title: 'Rapidly create high-converting static ads that win',
  description:
    'Drop in your product catalog and generate on-brand ads with headlines, offers, and CTAs locked in-frame — ready for Meta, TikTok, and more.',
  cta: 'Create static ads',
} as const

export const FEATURE_MARQUEE_MODELS = [
  { id: 'gpt-image-2', label: 'GPT Image 2' },
  { id: 'nano-banana-2', label: 'Nano Banana 2' },
  { id: 'seedance-2-5', label: 'Seedance 2.5' },
  { id: 'flux-pro', label: 'Flux Pro' },
  { id: 'kling-video', label: 'Kling Video' },
  { id: 'veo-3', label: 'Veo 3' },
  { id: 'imagen-4', label: 'Imagen 4' },
  { id: 'ideogram-3', label: 'Ideogram 3' },
] as const

export const FEATURE_MARQUEE_FEATURES = [
  { id: 'ugc-studio', label: 'UGC Studio' },
  { id: 'captions', label: 'Captions' },
  { id: 'voice-overs', label: 'Voice Overs' },
  { id: 'static-ads', label: 'Static Ads' },
  { id: 'slideshows', label: 'Slideshows' },
  { id: 'ai-influencers', label: 'AI Influencers' },
  { id: 'video-studio', label: 'Video Studio' },
  { id: 'brand-voice', label: 'Brand Voice' },
] as const

export const PAIN_POINTS = {
  eyebrow: 'The problem',
  title: 'Social teams are drowning in tools',
  description:
    'Most teams stitch together Canva, a scheduler, an AI image app, and a spreadsheet. Every handoff costs time, money, and consistency.',
  items: [
    {
      pain: 'Hours lost to exports and reformatting',
      solution: 'Native ratios and platform previews — create once, adapt per channel.',
    },
    {
      pain: '$400+ per month across disconnected tools',
      solution: 'Studio, composer, and analytics in one subscription.',
    },
    {
      pain: 'Generic AI that ignores your brand',
      solution: 'Brand voice, catalog, and skills loaded into every generation.',
    },
    {
      pain: 'No idea what actually drove results',
      solution: 'Performance sits beside the creative that produced it.',
    },
  ],
} as const

export const OUTCOMES = {
  eyebrow: 'The outcome',
  title: 'More output. Less overhead.',
  description: 'Teams use Socialista to ship faster, spend less, and keep creative on-brand at scale.',
  stats: [
    {
      value: '10+',
      unit: 'hrs',
      label: 'saved per week',
      description: 'No more exporting, resizing, and re-uploading between apps.',
    },
    {
      value: '3×',
      unit: '',
      label: 'faster to publish',
      description: 'From prompt to scheduled post in one flow — not five tabs.',
    },
    {
      value: '50+',
      unit: '',
      label: 'assets per session',
      description: 'Bulk-generate images, ads, and carousels with brand context loaded.',
    },
    {
      value: '1',
      unit: '',
      label: 'workspace for everything',
      description: 'Replace your stack of creation, scheduling, and reporting tools.',
    },
  ],
} as const

export const BENTO = {
  eyebrow: 'Platform',
  title: 'Everything you need to win on social',
  description: 'Create in the studio. Publish to every channel. Measure what moves the needle.',
  cells: [
    {
      id: 'create',
      label: 'Create',
      title: 'AI studio for every format',
      description: 'Images, static ads, carousels, UGC, and short-form video — sized for the feed, not a crop later.',
      span: 'large' as const,
    },
    {
      id: 'publish',
      label: 'Publish',
      title: 'Write once, ship everywhere',
      description: 'Per-platform variants, live previews, and a calendar in the same composer.',
      span: 'medium' as const,
    },
    {
      id: 'measure',
      label: 'Measure',
      title: 'See what landed',
      description: 'Reach and engagement by channel, tied to the post that produced it.',
      span: 'medium' as const,
    },
    {
      id: 'brand',
      label: 'Brand',
      title: 'Context that sticks',
      description: 'Voice, catalog, and reusable skills so every run stays on-model.',
      span: 'small' as const,
    },
    {
      id: 'team',
      label: 'Team',
      title: 'Built for collaboration',
      description: 'Shared workspaces, files, and products — invite your whole team.',
      span: 'small' as const,
    },
  ],
} as const

export const STUDIO_INDEX = {
  eyebrow: 'Studio',
  title: 'Every format. One desk.',
  description: 'From product stills to talking-head UGC — generate in the ratios you actually post.',
} as const

export const STUDIO_CARDS = [
  {
    id: 'images' as const,
    href: '/#studio',
    label: 'Images',
    title: 'Feed-ready stills',
    description: 'UGC, product, and lifestyle — in Stories, Reels, and feed ratios.',
  },
  {
    id: 'videos' as const,
    href: '/#studio',
    label: 'Videos',
    title: 'Short-form in the browser',
    description: 'Trim, caption, and export MP4s. No desktop app required.',
  },
  {
    id: 'slideshows' as const,
    href: '/#studio',
    label: 'Slideshows',
    title: 'Carousels that convert',
    description: 'Slide-by-slide typography and layout — built to hold attention.',
  },
  {
    id: 'ads' as const,
    href: '/#studio',
    label: 'Static ads',
    title: 'Catalog to creative',
    description: 'Pull product data in. Headlines and CTAs stay in the frame.',
  },
  {
    id: 'influencers' as const,
    href: '/#studio',
    label: 'Influencers',
    title: 'Talent you own',
    description: 'Persistent on-brand faces, reused across stills and UGC.',
  },
  {
    id: 'ugc' as const,
    href: '/#studio',
    label: 'UGC ads',
    title: 'Script to talking clip',
    description: 'Phone-native output that looks shot on device — because it converts.',
  },
] as const

export const WORKFLOW = {
  eyebrow: 'How it works',
  title: 'Three steps to shipped content',
  description: 'No exports. No re-uploads. No context switching.',
  steps: [
    {
      n: '01',
      title: 'Create in the studio',
      description: 'Generate images, ads, carousels, or video with your brand context already loaded.',
    },
    {
      n: '02',
      title: 'Schedule from the composer',
      description: 'Adapt captions per platform, preview what ships, and queue from one calendar.',
    },
    {
      n: '03',
      title: 'Measure and iterate',
      description: 'See reach and engagement beside the creative. Reopen any generation and rerun.',
    },
  ],
} as const

export const PRICING_SECTION = {
  eyebrow: 'Pricing',
  title: 'Plans that scale with your output',
  description: 'Start free. Upgrade when your team needs more credits, seats, and connected accounts.',
  fallbackTitle: 'Plans live in your workspace',
  fallbackDescription: 'Create an account to see current pricing, credits, and team limits for your region.',
} as const

export const FAQ_ITEMS = [
  {
    question: 'What is Socialista?',
    answer:
      'A social content studio and workspace. Generate images, static ads, carousels, UGC, and video; connect social accounts; schedule posts; and track performance — in one place.',
  },
  {
    question: 'Which platforms do you support?',
    answer:
      "Instagram, TikTok, YouTube, X, LinkedIn, Pinterest, Facebook, and Threads for publishing. Creation formats follow each channel's native specs.",
  },
  {
    question: 'How much time can I save?',
    answer:
      'Teams typically cut 10+ hours per week by eliminating exports between creation tools, schedulers, and analytics dashboards. Everything lives in one workspace.',
  },
  {
    question: 'Does Socialista include scheduling?',
    answer:
      'Yes. Queue posts from the same composer where you create them. Calendar views show drafts, scheduled, and published work.',
  },
  {
    question: 'How do credits and plans work?',
    answer:
      'AI generation uses workspace credits. Plans set monthly limits for credits, team members, connected accounts, and scheduled posts. Upgrade anytime from your workspace settings.',
  },
  {
    question: 'Can my team collaborate?',
    answer:
      'Yes. Workspaces support multiple members, shared files, products, and brand context. Invite teammates from settings.',
  },
] as const

export const FINAL_CTA = {
  title: 'Ship your first post today',
  description: 'Create your free workspace. No credit card. Start generating in under two minutes.',
  cta: 'Get started free',
} as const

export const FOOTER = {
  tagline: 'The social content studio for creators, agencies, and brands who ship at scale.',
  columns: [
    {
      title: 'Product',
      links: [
        { href: '/#outcomes', label: 'Why Socialista' },
        { href: '/#studio', label: 'Studio' },
        { href: '/#platform', label: 'Platform' },
        { href: '/#pricing', label: 'Pricing' },
      ],
    },
    {
      title: 'Studio',
      links: [
        { href: '/#studio', label: 'Images' },
        { href: '/#studio', label: 'Videos' },
        { href: '/#studio', label: 'Static ads' },
        { href: '/#studio', label: 'UGC ads' },
      ],
    },
    {
      title: 'Account',
      links: [
        { href: '/auth/signup', label: 'Get started' },
        { href: '/auth/signin', label: 'Sign in' },
        { href: '/#faq', label: 'FAQ' },
      ],
    },
  ],
} as const

export const PAGE_METADATA = {
  title: 'Socialista — The fastest way to create social content',
  description:
    'Generate images, ads, carousels, and UGC. Connect accounts, schedule posts, and track ROI — in one workspace. Save time, cut tool costs, ship faster.',
} as const
