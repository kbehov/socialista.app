export const LANDING_NAV = [
  { href: '#studio', label: 'Studio' },
  { href: '#publish', label: 'Publish' },
  { href: '#measure', label: 'Measure' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
] as const

export const HERO = {
  eyebrow: 'Social content studio',
  title: 'The studio that ships the post.',
  description:
    'Generate images, ads, carousels, and UGC. Connect the accounts. Schedule from the same desk. See what actually landed.',
} as const

export const HERO_PROOF_POINTS = ['Free to start', 'No credit card', 'Works in your browser'] as const

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

export const STUDIO_TABS = [
  {
    id: 'images' as const,
    label: 'Images',
    title: 'Prompt studio for social',
    description:
      'Channel sizes in the control row. Vibes tuned for UGC, product shots, and launches — not a generic image box.',
  },
  {
    id: 'ads' as const,
    label: 'Static ads',
    title: 'Catalog in, Meta-ready frame out',
    description:
      'Pull products from your catalog. Headlines and CTAs stay on the product, not pasted on as an afterthought.',
  },
  {
    id: 'slideshows' as const,
    label: 'Slideshows',
    title: 'Carousels you would actually post',
    description: 'Slide-by-slide type and layout. Precise typography and spacing, not a template dump.',
  },
  {
    id: 'video' as const,
    label: 'Videos',
    title: 'Timeline in the browser',
    description: 'Trim, caption, and export short-form MP4s. No render farm, no desktop app.',
  },
  {
    id: 'influencers' as const,
    label: 'Influencers',
    title: 'Faces you own, not rent',
    description:
      'Persistent on-brand talent reused across stills and UGC. Clone once, use everywhere in the studio.',
  },
  {
    id: 'ugc' as const,
    label: 'UGC ads',
    title: 'Script to talking clip',
    description:
      'Script, talent, scene stills, phone-native output. Same influencer, same product, one flow.',
  },
] as const

export type StudioTabId = (typeof STUDIO_TABS)[number]['id']

export const PUBLISH_CHAPTER = {
  eyebrow: 'Publish',
  title: 'From draft to live post',
  description:
    'Connect Instagram, TikTok, LinkedIn, and the rest. One composer, per-platform variants, a calendar that lives in the same workspace.',
  points: [
    {
      title: 'Connected accounts',
      description: 'OAuth for the channels you publish to. Tokens stay secure; channels stay in sync.',
    },
    {
      title: 'Multi-platform composer',
      description: 'Write once, adapt per network. Previews match what ships — captions, media, and format.',
    },
    {
      title: 'Content calendar',
      description: 'Queue drafts, schedule ahead, and see what is going out this week without a separate tool.',
    },
  ],
} as const

export const MEASURE_CHAPTER = {
  eyebrow: 'Measure & memory',
  title: 'Context that compounds',
  description:
    'Analytics next to the work. Generation history you can reopen. Brand, catalog, and skills the studio actually reads.',
  points: [
    {
      title: 'Analytics',
      description: 'What shipped, what moved, by account. Not buried in a third dashboard.',
    },
    {
      title: 'Generations',
      description: 'Every AI run logged with inputs and outputs. Pick up where you left off.',
    },
    {
      title: 'Context & skills',
      description: 'Brand voice, products, and custom skills — so output stays on-model, not generic.',
    },
  ],
} as const

export const PRICING_SECTION = {
  eyebrow: 'Pricing',
  title: 'Plans that scale with your output',
  description: 'Start free. Upgrade when your team and volume need more credits, seats, and connected accounts.',
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
      'AI generation uses workspace credits. Plans set monthly limits for credits, team members, connected accounts, and scheduled posts. Upgrade anytime from your workspace settings.',
  },
  {
    question: 'Can my team collaborate?',
    answer:
      'Yes. Workspaces support multiple members, shared files, products, and brand context. Invite teammates from settings.',
  },
  {
    question: 'What happens to my data?',
    answer:
      'Your content, accounts, and workspace data belong to you. We do not sell your data or use your creatives to train public models.',
  },
] as const

export const FINAL_CTA = {
  title: 'Open the studio',
  description: 'Create your workspace and ship your first post today.',
} as const

export const FOOTER = {
  tagline: 'Social content studio for creators, agencies, and brands.',
  columns: [
    {
      title: 'Product',
      links: [
        { href: '#studio', label: 'Studio' },
        { href: '#publish', label: 'Publish' },
        { href: '#measure', label: 'Measure' },
        { href: '#pricing', label: 'Pricing' },
      ],
    },
    {
      title: 'Studio',
      links: [
        { href: '#studio', label: 'Images' },
        { href: '#studio', label: 'Static ads' },
        { href: '#studio', label: 'UGC' },
        { href: '#studio', label: 'Video' },
      ],
    },
    {
      title: 'Account',
      links: [
        { href: '/auth/signup', label: 'Get started' },
        { href: '/auth/signin', label: 'Sign in' },
        { href: '#faq', label: 'FAQ' },
      ],
    },
  ],
} as const

export const PAGE_METADATA = {
  title: 'Socialista — The studio that ships the post',
  description:
    'Generate images, ads, carousels, and UGC. Connect accounts, schedule posts, and track performance — in one workspace.',
} as const
