export const LANDING_NAV = [
  { href: '/#studio', label: 'Studio' },
  { href: '/#publish', label: 'Publish' },
  { href: '/#workspace', label: 'Workspace' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
] as const

export const HERO = {
  eyebrow: 'Social content studio',
  titleBefore: 'The fastest way to create',
  titleAccent: 'social content',
  description:
    'Generate images, ads, carousels, UGC, and video. Connect the accounts. Schedule from the same desk. See what actually landed.',
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

export const STUDIO_INDEX = {
  eyebrow: 'Studio',
  title: 'Every format, one desk',
  description: 'Images, ads, carousels, video, influencers, and UGC — without switching tools.',
} as const

export const STUDIO_CARDS = [
  {
    id: 'images' as const,
    href: '/#images',
    label: 'Images',
    title: 'Prompt studio for social',
    description: 'Channel sizes in the control row. Vibes for UGC, product, and launches.',
  },
  {
    id: 'videos' as const,
    href: '/#videos',
    label: 'Videos',
    title: 'Timeline in the browser',
    description: 'Trim, caption, and export short-form MP4s. No desktop app.',
  },
  {
    id: 'slideshows' as const,
    href: '/#slideshows',
    label: 'Slideshows',
    title: 'Carousels you would post',
    description: 'Slide-by-slide type and layout — not a template dump.',
  },
  {
    id: 'ads' as const,
    href: '/#ads',
    label: 'Static ads',
    title: 'Catalog in, frame out',
    description: 'Headlines and CTAs stay on the product, not pasted on after.',
  },
  {
    id: 'influencers' as const,
    href: '/#influencers',
    label: 'Influencers',
    title: 'Faces you own',
    description: 'Persistent on-brand talent, reused across stills and UGC.',
  },
  {
    id: 'ugc' as const,
    href: '/#ugc',
    label: 'UGC ads',
    title: 'Script to talking clip',
    description: 'Script, talent, scene stills, phone-native output.',
  },
] as const

export const FEATURE_IMAGES = {
  eyebrow: 'Images',
  title: 'Stills that already look like the feed',
  description:
    'Generate in the ratios you actually post. Product, lifestyle, and UGC vibes — not a generic image box.',
  points: [
    { title: 'Native ratios', description: 'Stories, Reels, feed, and landscape without a crop afterthought.' },
    { title: 'Brand-aware', description: 'Workspace context steers look and copy so output stays on-model.' },
  ],
} as const

export const FEATURE_VIDEOS = {
  eyebrow: 'Videos',
  title: 'Short-form, edited in the tab',
  description: 'A timeline for hooks, captions, and exports. Cut in the browser, ship as MP4.',
  points: [
    { title: 'Trim and caption', description: 'On-screen type that matches the platform, not a burned-in afterthought.' },
    { title: 'Export ready', description: '1080p MP4s sized for Reels, Shorts, and TikTok.' },
  ],
} as const

export const FEATURE_SLIDESHOWS = {
  eyebrow: 'Slideshows',
  title: 'Carousels with real typography',
  description: 'Build slide-by-slide. Tight type, consistent spacing, swipe that holds attention.',
} as const

export const FEATURE_ADS = {
  eyebrow: 'Static ads',
  title: 'Product frames that sell',
  description: 'Pull from the catalog. Headline, offer, and CTA sit in the layout — Meta-ready without a designer round-trip.',
} as const

export const FEATURE_INFLUENCERS = {
  eyebrow: 'Influencers',
  title: 'A roster you can reuse',
  description:
    'Clone talent once, then cast them in stills, ads, and UGC. Same face, same brand, every format.',
} as const

export const FEATURE_UGC = {
  eyebrow: 'UGC ads',
  title: 'Talking clips, phone-native',
  description: 'Script the hook, pick the talent, generate the scene. Output looks like it was shot on a phone — because that is the format that converts.',
} as const

export const FEATURE_ACCOUNTS = {
  eyebrow: 'Accounts',
  title: 'Connect the channels you publish to',
  description:
    'OAuth for Instagram, TikTok, LinkedIn, and the rest. Tokens stay secure; channels stay in the workspace.',
  points: [
    { title: 'One workspace', description: 'Every connected account lives next to the posts it will receive.' },
    { title: 'Status you can see', description: 'Connected, pending, or needs attention — before you hit schedule.' },
  ],
} as const

export const FEATURE_POSTS = {
  eyebrow: 'Posts',
  title: 'Write once, adapt per network',
  description:
    'A composer with per-platform variants, previews that match what ships, and a calendar in the same view.',
  points: [
    { title: 'Multi-platform', description: 'Captions and formats can differ. Previews follow each network.' },
    { title: 'Calendar', description: 'Drafts, scheduled, and published — this week, in one place.' },
  ],
} as const

export const FEATURE_ANALYTICS = {
  eyebrow: 'Analytics',
  title: 'What shipped, what moved',
  description: 'Reach and posts by account, next to the work — not buried in a third dashboard.',
  points: [
    { title: 'By channel', description: 'See which accounts carried the week without exporting a CSV.' },
    { title: 'Tied to posts', description: 'Performance sits beside the creative that produced it.' },
  ],
} as const

export const FEATURE_CONTEXT = {
  eyebrow: 'Context & skills',
  title: 'Memory the studio actually reads',
  description: 'Brand voice, catalog, and custom skills — so generation stays on-model instead of generic.',
  points: [
    { title: 'Brand voice', description: 'Tone and rules the models follow on every run.' },
    { title: 'Skills', description: 'Reusable instructions for hooks, CTAs, and format-specific jobs.' },
  ],
} as const

export const FEATURE_GENERATIONS = {
  eyebrow: 'Generations',
  title: 'Every run, still openable',
  description: 'Inputs, outputs, and status — pick up a still, ad, or clip where you left it.',
} as const

export const WORKFLOW = {
  eyebrow: 'How it works',
  title: 'Create, publish, measure',
  steps: [
    {
      n: '01',
      title: 'Create in the studio',
      description: 'Images, ads, carousels, UGC, or video — with brand context already loaded.',
    },
    {
      n: '02',
      title: 'Publish to the accounts',
      description: 'Composer, variants, and a calendar. Schedule without exporting files.',
    },
    {
      n: '03',
      title: 'See what landed',
      description: 'Analytics beside the post. Generations you can reopen and rerun.',
    },
  ],
} as const

export const SLIDESHOW_SLIDES = [
  { kicker: '01 · Hook', title: 'Stop scrolling.', caption: 'First slide earns the swipe.' },
  { kicker: '02 · Proof', title: 'What changed.', caption: 'Product in the real scene.' },
  { kicker: '03 · Offer', title: 'This week only.', caption: 'Price and constraint, not noise.' },
  { kicker: '04 · CTA', title: 'Shop the drop.', caption: 'One action. Large type.' },
] as const

export const AD_CARDS = [
  { product: 'Aero Watch', price: '$240', cta: 'Shop now' },
  { product: 'Nova Runner', price: '$160', cta: 'Buy' },
  { product: 'Pulse Audio', price: '$89', cta: 'Add to bag' },
  { product: 'Sol Glass', price: '$48', cta: 'Get yours' },
] as const

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
        { href: '/#studio', label: 'Studio' },
        { href: '/#publish', label: 'Publish' },
        { href: '/#workspace', label: 'Workspace' },
        { href: '/#pricing', label: 'Pricing' },
      ],
    },
    {
      title: 'Studio',
      links: [
        { href: '/#images', label: 'Images' },
        { href: '/#videos', label: 'Videos' },
        { href: '/#ads', label: 'Static ads' },
        { href: '/#ugc', label: 'UGC ads' },
        { href: '/#influencers', label: 'Influencers' },
        { href: '/#slideshows', label: 'Slideshows' },
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
    'Generate images, ads, carousels, and UGC. Connect accounts, schedule posts, and track performance — in one workspace.',
} as const
