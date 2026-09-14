export const LANDING_NAV = [
  { href: '/#studio', label: 'Studio' },
  { href: '/#features', label: 'Features' },
  { href: '/#channels', label: 'Publish' },
  { href: '/#analytics', label: 'Analytics' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
] as const

export const HERO = {
  titleLine1: 'Make it. Post it.',
  titleLine2Prefix: 'Know what',
  titleLine2Highlight: 'hits.',
  titleLine2Suffix: '',
  description:
    'UGC, winning ads, carousels, and Shorts — generate, schedule, and read performance without the tab circus. Free to start in minutes.',
  googleCta: 'Continue with Google',
  primaryCta: 'Try it free',
  primaryCtaWords: ['Make UGC today', 'Ship an AI ad', 'Drop a carousel'] as const,
  signInCta: 'Sign in',
} as const

export const HERO_PROOF_POINTS = ['Free to start', 'No credit card', 'Live in minutes'] as const

export const HERO_SOCIAL_PROOF = {
  lead: 'Made for teams that post.',
  subline: 'Creators, brands, and agencies',
} as const

export const FEATURE_MARQUEE = {
  rowA: [
    'UGC Studio',
    'Static Ads',
    'Kling',
    'Captions',
    'Slideshows',
    'GPT Image',
    'Influencers',
    'Seedream',
    'Image Studio',
  ],
  rowB: [
    'Seedance',
    'Unboxing',
    'Video Studio',
    'Composer',
    'Brand Voice',
    'Flux',
    'Talking Clips',
    'Analytics',
    'Sora',
  ],
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
    hook: 'Catalog in. Ad out.',
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
    'Connect Instagram, TikTok, YouTube, LinkedIn, and the rest. Native ratios, captions per platform, queue from the same place you create.',
} as const

export const INFLUENCER_SECTION = {
  title: 'Your brand deserves a face',
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
      description: 'Photoreal creators holding your product or talking to camera — not stiff stock.',
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

export const ANALYTICS = {
  title: 'Double down while it’s still hot',
  description:
    'Views, likes, and comments on every post — tied to the generation behind it. Find the winner and ship the sequel today.',
  items: [
    {
      id: 'workspace' as const,
      title: 'One dashboard',
      description: 'Workspace totals and per-post stats — no exports, no second tool.',
    },
    {
      id: 'channels' as const,
      title: 'Every account connected',
      description: 'TikTok, Instagram, LinkedIn, and more in the same view you publish from.',
    },
    {
      id: 'iteration' as const,
      title: 'Remix what worked',
      description: 'Open the exact AI run behind a spike and iterate in one click.',
    },
  ],
} as const

export type AnalyticsFeatureId = (typeof ANALYTICS.items)[number]['id']

export const STUDIO_BENTO = {
  eyebrow: 'Studio',
  titleEmoji: '🔥',
  title: 'Where your feed gets made',
  description: 'UGC, slideshows, and static ads in one flow — generate, tweak, and post without leaving.',
  usedByLabel: 'Built for',
  usedBy: [
    { emoji: '🚀', label: 'Founders' },
    { emoji: '📣', label: 'Marketers' },
    { emoji: '🛒', label: 'E-commerce brands' },
    { emoji: '🎬', label: 'Content creators' },
    { emoji: '📱', label: 'App teams' },
    { emoji: '🏢', label: 'Agencies' },
  ],
  cards: [
    {
      id: 'ugc' as const,
      title: 'UGC videos',
      description: 'Talking-head and product clips that feel native to TikTok — from one prompt.',
    },
    {
      id: 'slideshows' as const,
      title: 'Slideshows',
      description: 'Hook, slides, and visuals in a single run. Built to swipe.',
    },
    {
      id: 'ads' as const,
      title: 'Static ads',
      description: 'Product in, ad out — headline, offer, and CTA locked in frame like the brands you admire.',
    },
  ],
} as const

export type StudioBentoCardId = (typeof STUDIO_BENTO.cards)[number]['id']

export const ADDITIONAL_FEATURES = {
  title: 'Everything your next post needs',
  description: 'Your brief, creative tools, publishing flow, and shared playbook — all in one place.',
  cards: [
    {
      id: 'brand-profile' as const,
      title: 'Brand profile',
      description: 'We analyze your product and market to build a tailored growth profile for every generation.',
    },
    {
      id: 'post-composer' as const,
      title: 'Post composer',
      description: 'Write captions, attach media, and publish or schedule to every connected account from one flow.',
    },
    {
      id: 'content-calendar' as const,
      title: 'Content calendar',
      description: 'Plan, schedule, and review drafts, queued posts, and what already went live.',
    },
    {
      id: 'video-editor' as const,
      title: 'Video editor',
      description: 'Trim, caption, and export in the browser — then drop straight into the composer.',
    },
    {
      id: 'skills' as const,
      title: 'Skills',
      description: 'Reusable creative instructions — hook style, pacing, and format rules your whole team shares.',
    },
    {
      id: 'products' as const,
      title: 'Products',
      description: 'Catalog shots, offers, and URLs saved once — pulled into ads, UGC, and carousels automatically.',
    },
  ],
} as const

export type AdditionalFeatureId = (typeof ADDITIONAL_FEATURES.cards)[number]['id']

export const PUBLISH = {
  title: 'Schedule from Socialista',
  description: 'One click to the accounts you connected. Caption per channel, calendar for the queue.',
  cta: 'Start for $0',
} as const

export const PRICING_SECTION = {
  title: 'Start free. Scale when you ship more.',
  description: 'No card to try it. Upgrade when you need more credits, seats, and connected accounts.',
  fallbackTitle: 'Plans live in your workspace.',
  fallbackDescription: 'Create an account to see current pricing, credits, and team limits for your region.',
} as const

export const FAQ_SECTION = {
  title: 'Credits, teams, and what you own',
  description: 'Platforms, billing, collaboration, and your files.',
} as const

export const FAQ_ITEMS = [
  {
    question: 'Is this just another AI image app?',
    answer:
      'No — it’s a social studio. You generate UGC, ads, and carousels, connect accounts, schedule, and read what hit — without juggling five tools.',
  },
  {
    question: 'Which platforms do you support?',
    answer:
      'Instagram, TikTok, YouTube, X, LinkedIn, Pinterest, Facebook, and Threads for publishing. Creation formats follow each channel’s native specs.',
  },
  {
    question: 'Does Socialista include scheduling?',
    answer:
      'Yes. Queue posts from the same composer where you create them. Calendar views show drafts, scheduled, and published work.',
  },
  {
    question: 'How do credits and plans work?',
    answer:
      'AI generation uses workspace credits. Plans set monthly limits for credits, team members, connected accounts, and scheduled posts. Upgrade anytime from workspace settings.',
  },
  {
    question: 'Can my team collaborate?',
    answer:
      'Yes. Workspaces support multiple members, shared files, products, and brand context. Invite teammates from settings.',
  },
  {
    question: 'Who owns the files I generate?',
    answer:
      'Your workspace owns the assets you generate and upload. Export them, schedule them, or keep them in the file library.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes. Start free, no credit card. Paid plans can be canceled from billing — you keep access through the current period.',
  },
] as const

export const FINAL_CTA = {
  title: 'Try it today — first post in minutes.',
  description: 'Free to start. No credit card. Cancel anytime.',
  cta: 'Try it free',
} as const

export const FOOTER = {
  tagline: 'The AI social studio for teams that post for real.',
  columns: [
    {
      title: 'Product',
      links: [
        { href: '/#studio', label: 'Studio' },
        { href: '/#channels', label: 'Publish' },
        { href: '/#features', label: 'Features' },
        { href: '/#analytics', label: 'Analytics' },
        { href: '/#pricing', label: 'Pricing' },
        { href: '/#faq', label: 'FAQ' },
      ],
    },
    {
      title: 'Studio',
      links: [
        { href: '/#studio', label: 'Images' },
        { href: '/#studio', label: 'Video' },
        { href: '/#studio', label: 'Static ads' },
        { href: '/#influencers', label: 'UGC' },
        { href: '/#influencers', label: 'Influencers' },
      ],
    },
    {
      title: 'Account',
      links: [
        { href: '/auth/signup', label: 'Try it free' },
        { href: '/auth/signin', label: 'Sign in' },
      ],
    },
  ],
} as const

export const PAGE_METADATA = {
  title: 'Socialista — Make it. Post it. Know what hits.',
  description:
    'UGC, ads, carousels, and Shorts — generate, schedule, and measure performance in one AI-native workspace. Free to start.',
} as const
