export const LANDING_NAV = [
  { href: '/#studio', label: 'Studio' },
  { href: '/#publish', label: 'Publish' },
  { href: '/#analytics', label: 'Analytics' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
] as const

export const HERO = {
  titleLine1: 'Make it. Post it.',
  titleLine2Prefix: 'See what',
  titleLine2Highlight: 'worked.',
  titleLine2Suffix: '',
  description:
    'UGC Videos, Wining Ads, Trending Carousels, and Short Videos — made, scheduled, and measured in one workspace.',
  googleCta: 'Continue with Google',
  primaryCta: 'Start for $0',
  primaryCtaWords: ['Make UGC video', 'Create AI Ad', 'Create Slideshow'] as const,
  signInCta: 'Sign in',
} as const

export const HERO_PROOF_POINTS = ['Start free', 'No card required', 'Cancel anytime'] as const

export const HERO_SOCIAL_PROOF = {
  count: '2,000+',
  label: 'businesses use Socialista',
  subline: 'Built for real content teams',
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
  title: 'Post to every channel you already run',
  description:
    'Instagram, TikTok, YouTube, LinkedIn, Facebook, Threads, Pinterest, and X — connected here, not in another tab.',
} as const

export const INFLUENCER_SECTION = {
  title: 'Create your own AI influencer',
  eyebrow:
    'Generate an influencer in seconds — then make them hold your product, show your app, and wear your clothes.',
  cta: 'Create an AI influencer',
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
      title: 'Photorealistic Quality',
      description: 'Create Hyper Realistic AI Influencers holding your product or talking with Socialista AI',
    },
    {
      id: 'consistency' as const,
      side: 'left' as const,
      title: 'Brand Presence',
      description: 'Keep the same face, vibe, and identity across every image and clip.',
    },
    {
      id: 'control' as const,
      side: 'right' as const,
      title: 'Full Creative Control',
      description: 'Appearance, style, vibe and energy — matched to your brand.',
    },
    {
      id: 'ownership' as const,
      side: 'right' as const,
      title: 'Yours, forever',
      description: 'Use your influencer across every video,image and ad freely',
    },
  ],
} as const

export type InfluencerFeatureId = (typeof INFLUENCER_SECTION.features)[number]['id']

export const ANALYTICS = {
  eyebrow: 'Analytics',
  title: 'See what worked — next to the creative that did it.',
  description:
    'Reach and engagement sit beside the post — and the generation that made it. See the number, reopen the run, ship the next version.',
  items: [
    {
      title: 'Tied to the creative',
      description: 'Performance lives next to the post and the studio run that produced it.',
    },
    {
      title: 'Every connected channel',
      description: 'Workspace totals and per-account insights, without another login.',
    },
    {
      title: 'Open the run that landed',
      description: 'Open the generation behind a winning post and iterate from there.',
    },
  ],
} as const

export const CONTEXT_SKILLS = {
  eyebrow: 'Context & skills',
  title: 'On-brand from the first run',
  description:
    'Your brand, catalog, and creative rules live in the workspace — so every generation starts on-brand, not from scratch.',
  features: [
    {
      id: 'products' as const,
      title: 'Product catalog',
      description:
        'Import your lineup once. Static ads, UGC, and studio runs pull real product names, offers, and URLs into every creative.',
    },
    {
      id: 'brands' as const,
      title: 'Brand voice',
      description:
        'Logo, colors, and tone live in one profile. The studio reads them on every run — no re-pasting the brief.',
    },
    {
      id: 'skills' as const,
      title: 'Custom skills',
      description:
        'Write reusable instructions — hooks, ad layouts, caption styles — and inject them into any generation.',
    },
  ],
} as const

export type ContextSkillsFeatureId = (typeof CONTEXT_SKILLS.features)[number]['id']

export const STUDIO_BENTO = {
  eyebrow: 'Studio',
  titleEmoji: '🔥',
  title: 'Dominate your niche',
  description: 'Make UGC Videos, Slideshows, and Winning Ads, all at one place. Post directly from Socialista.',
  usedByLabel: '👥 Used by',
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
      title: 'UGC Videos',
      description: 'Create Hyper Realistic UGC Videos holding your product or talking with Socialista AI',
    },
    {
      id: 'slideshows' as const,
      title: 'Slideshows',
      description: 'Create viral slideshow from one prompt. Hook, Content, Images all generated in the same run.',
    },
    {
      id: 'ads' as const,
      title: 'Static Ads',
      description:
        'Drop in your product and generate winning ads with headlines, offers, and CTAs locked in-frame. Scale like million dollar brands.',
    },
  ],
} as const

export type StudioBentoCardId = (typeof STUDIO_BENTO.cards)[number]['id']

export const PUBLISH = {
  title: 'Schedule from Socialista',
  description: 'One click to the accounts you connected. Caption per channel, calendar for the queue.',
  cta: 'Start for $0',
} as const

export const PRICING_SECTION = {
  title: 'Plans that scale with your output.',
  description: 'Start free. Upgrade when your team needs more credits, seats, and connected accounts.',
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
      'No. Socialista is a social content studio and workspace: generate stills, ads, carousels, UGC, and video; connect accounts; schedule; and read performance — in one place.',
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
  title: 'Start free. Make the first post today.',
  description: 'No card. Cancel anytime.',
  cta: 'Start for $0',
} as const

export const FOOTER = {
  tagline: 'Social content studio for creators, agencies, and brands.',
  columns: [
    {
      title: 'Product',
      links: [
        { href: '/#studio', label: 'Studio' },
        { href: '/#publish', label: 'Publish' },
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
        { href: '/auth/signup', label: 'Start for $0' },
        { href: '/auth/signin', label: 'Sign in' },
      ],
    },
  ],
} as const

export const PAGE_METADATA = {
  title: 'Socialista — Make it. Post it. See what worked.',
  description:
    'Generate images, ads, carousels, and UGC. Connect accounts, schedule posts, and track performance — in one workspace.',
} as const
