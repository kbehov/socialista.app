export const LANDING_NAV = [
  { href: '/#studio', label: 'Studio' },
  { href: '/#publish', label: 'Publish' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
] as const

export const HERO = {
  titleLine1: 'Create It. Post It. Measure It.',
  titleLine2Prefix: 'One',
  titleLine2Highlight: 'Workspace',
  titleLine2Suffix: 'for all',
  description: 'Create winning ads, UGC videos and viral slideshows — schedule to every channel from one workspace.',
  googleCta: 'Continue with Google',
  primaryCta: 'Start creating free',
  primaryCtaWords: ['Create AI Ad', 'Make UGC video', 'Create Influencer'] as const,
  signInCta: 'Sign in',
} as const

export const HERO_PROOF_POINTS = ['Start free', 'Fast results', 'Cancel anytime'] as const

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
  title: 'Connect to all trending social media channels',
  description:
    'Every major channel, built into one workspace — create, schedule, and publish without jumping between tools.',
} as const

export const PROBLEM = {
  title: 'Your calendar is empty because creation lives in five other tabs.',
  description:
    'Most teams stitch together a design tool, an image generator, a video editor, a scheduler, and a spreadsheet. Every handoff costs time and brand consistency.',
  items: [
    {
      title: 'Exports and resizing',
      description: 'Native ratios and platform previews — create once, adapt per channel.',
    },
    {
      title: 'Brand-blind generations',
      description: 'Voice, catalog, and reusable skills load into every studio run.',
    },
    {
      title: 'Performance in another app',
      description: 'Reach and engagement sit beside the post and the generation that made them.',
    },
  ],
} as const

export const LOOP = {
  title: 'Create, publish, and measure in one desk.',
  description: 'The studio, the composer, and analytics share the same workspace — and the same brand context.',
  steps: [
    {
      id: 'create' as const,
      title: 'Create',
      description:
        'Stills, static ads, carousels, short video, influencers, and UGC — in the ratios you actually post.',
    },
    {
      id: 'publish' as const,
      title: 'Publish',
      description: 'Per-platform captions, live previews, and a calendar. No re-upload to a second tool.',
    },
    {
      id: 'measure' as const,
      title: 'Measure',
      description: 'See what landed next to the creative. Reopen any generation and rerun.',
    },
  ],
} as const

export const STUDIO = {
  title: 'Every format. One studio.',
  description: 'From product stills to talking-head UGC — generate with brand context already loaded.',
  tabs: [
    {
      id: 'images' as const,
      label: 'Images',
      title: 'Feed-ready stills',
      description: 'UGC, product, and lifestyle — in Stories, Reels, and feed ratios.',
    },
    {
      id: 'ads' as const,
      label: 'Static ads',
      title: 'Catalog in. Ad out.',
      description: 'Headlines, offers, and CTAs stay in-frame — ready for Meta, TikTok, and more.',
    },
    {
      id: 'slideshows' as const,
      label: 'Slideshows',
      title: 'Carousels built to hold a swipe',
      description: 'Slide-by-slide layout and typography for Instagram and LinkedIn.',
    },
    {
      id: 'videos' as const,
      label: 'Video',
      title: 'Short-form in the browser',
      description: 'Trim, caption, and export MP4 — then schedule without leaving the workspace.',
    },
    {
      id: 'influencers' as const,
      label: 'Influencers',
      title: 'A face the brand owns',
      description: 'Persistent on-brand talent, reused across stills and UGC.',
    },
    {
      id: 'ugc' as const,
      label: 'UGC',
      title: 'Script to talking clip',
      description: 'Phone-native output that looks shot on device.',
    },
  ],
} as const

export type StudioTabId = (typeof STUDIO.tabs)[number]['id']

export const UGC_REEL = {
  title: 'Talking clips that look shot on a phone.',
  description: 'Script, talent, and a native vertical take — without a shoot day.',
} as const

export const GALLERY = {
  title: 'Ads that look like ads, not prompts.',
  description: 'Drop in your catalog and generate on-brand static ads with the offer locked in-frame.',
  cta: 'Create static ads',
} as const

export const PUBLISH = {
  title: 'Write once. Ship native.',
  description:
    'Per-platform variants, live previews, and one calendar. Instagram, TikTok, YouTube, LinkedIn, Facebook, Threads, Pinterest, and X.',
} as const

export const CONTEXT = {
  title: 'Brand memory on every run.',
  description:
    'Voice, product catalog, and reusable skills injected into images, ads, carousels, and UGC — so output stays on-brand.',
} as const

export const MEASURE = {
  title: 'See the number next to the thing that made it.',
  description: 'Workspace and per-channel analytics tied to the posts and generations that produced them.',
} as const

export const AUDIENCE = {
  title: 'Built for the people who have to ship.',
  description: 'Same studio. Different jobs.',
  personas: [
    {
      id: 'creators' as const,
      title: 'Creators',
      description: 'Ship daily without a production team — stills, clips, and a calendar in one place.',
    },
    {
      id: 'agencies' as const,
      title: 'Agencies',
      description: 'Client brands, shared catalogs, and one composer your team can actually hand off.',
    },
    {
      id: 'growth' as const,
      title: 'Growth teams',
      description: 'Ads and organic from the same context — then see which creative moved the number.',
    },
  ],
} as const

export const WORKFLOW = {
  title: 'Three steps to shipped content.',
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
      title: 'Read the number, rerun',
      description: 'See reach and engagement beside the creative. Reopen any generation and iterate.',
    },
  ],
} as const

export const COMPARE = {
  title: 'The five-tab stack, collapsed.',
  description:
    'You do not need a design tool, a generator, an editor, a scheduler, and a spreadsheet to post this week.',
  rows: [
    {
      label: 'Time to a live post',
      old: 'Export, resize, re-upload, rewrite the caption in the scheduler.',
      next: 'Generate in the studio. Schedule from the same composer.',
    },
    {
      label: 'Brand consistency',
      old: 'Each tool forgets your voice, catalog, and last winning ad.',
      next: 'Brand, products, and skills load into every run.',
    },
    {
      label: 'Closed loop',
      old: 'Analytics live in another login, disconnected from the asset.',
      next: 'Performance sits next to the post and the generation.',
    },
  ],
} as const

export const PRICING_SECTION = {
  title: 'Plans that scale with your output.',
  description: 'Start free. Upgrade when your team needs more credits, seats, and connected accounts.',
  fallbackTitle: 'Plans live in your workspace.',
  fallbackDescription: 'Create an account to see current pricing, credits, and team limits for your region.',
} as const

export const FAQ_SECTION = {
  title: 'Questions, answered.',
  description: 'Platforms, credits, seats, and what you own.',
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
  title: 'Ship the first post from the studio.',
  description: 'Free workspace. No card. Generate in minutes.',
  cta: 'Start creating free',
} as const

export const FOOTER = {
  tagline: 'The social content studio for creators, agencies, and brands.',
  columns: [
    {
      title: 'Product',
      links: [
        { href: '/#studio', label: 'Studio' },
        { href: '/#publish', label: 'Publish' },
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
        { href: '/#ugc', label: 'UGC' },
        { href: '/#studio', label: 'Influencers' },
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
  title: 'Socialista — Make it. Post it. See what worked.',
  description:
    'Generate images, ads, carousels, and UGC. Connect accounts, schedule posts, and track performance — in one workspace.',
} as const
