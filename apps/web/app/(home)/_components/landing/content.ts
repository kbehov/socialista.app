export const WAITLIST_FORM_ID = 'waitlist'

export const LANDING_NAV = [
  { href: '#product', label: 'Product' },
  { href: '#features', label: 'Features' },
  { href: '#audiences', label: 'Audiences' },
  { href: '#faq', label: 'FAQ' },
] as const

export const HERO = {
  eyebrow: 'Early access · Pre-launch',
  title: 'The social content studio you actually want to open',
  description:
    'Generate images and ads, design carousels, edit short video, and schedule everything — from one workspace built for creators, agencies, and brands.',
  reassurance: 'No credit card. No spam. Launch updates only.',
} as const

export const HERO_PROOF_POINTS = ['Free to join', 'Launch updates only', 'No credit card'] as const

export const PLATFORMS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'x', label: 'X' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'pinterest', label: 'Pinterest' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'threads', label: 'Threads' },
] as const

export type PlatformId = (typeof PLATFORMS)[number]['id']

export const STATS = [
  { value: '8+', label: 'Platforms supported' },
  { value: '5', label: 'Content formats' },
  { value: 'AI', label: 'Native generation' },
  { value: '1', label: 'Workspace for your team' },
] as const

export const PROBLEM = {
  eyebrow: 'The problem',
  title: '5 tabs. 3 logins. 0 brand consistency.',
  description:
    'Most teams still bounce between Canva, Notion, Meta Business Suite, Drive, and a scheduling tool — losing context, time, and craft along the way.',
  tools: ['Canva', 'Notion', 'Meta Business', 'Drive', 'Scheduler'],
  solution: 'Socialista replaces the stack with one studio.',
} as const

export const SHOWCASE_TABS = [
  {
    id: 'images',
    label: 'AI images',
    title: 'Prompt studio tuned for social',
    description:
      'Generate channel-ready visuals with vibes for UGC, product shots, launches, and lifestyle — without leaving the workspace.',
  },
  {
    id: 'ads',
    label: 'Static ads',
    title: 'Product-aware ad generation',
    description:
      'Turn catalog products into Meta-ready static ads with headlines, CTAs, and on-brand layouts in minutes.',
  },
  {
    id: 'carousels',
    label: 'Carousels',
    title: 'Multi-slide post editor',
    description:
      'Design swipeable carousels with precise typography, spacing, and slide-by-slide control.',
  },
  {
    id: 'video',
    label: 'Video',
    title: 'Browser-native video editor',
    description:
      'Import clips, trim timelines, overlay text, and export short-form MP4s without leaving the app.',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    title: 'Content calendar built in',
    description:
      'Plan and queue posts alongside your drafts — so publishing never falls off the calendar.',
  },
] as const

export type ShowcaseTabId = (typeof SHOWCASE_TABS)[number]['id']

export const WORKFLOW_STEPS = [
  {
    step: '01',
    title: 'Ideate',
    description: 'Start from a prompt, product URL, or blank canvas with channel-ready formats in mind.',
  },
  {
    step: '02',
    title: 'Create',
    description: 'Generate images and ads, compose carousels, and edit short-form video in the browser.',
  },
  {
    step: '03',
    title: 'Adapt',
    description: 'Resize and refine for Instagram, TikTok, LinkedIn, and more without rebuilding from scratch.',
  },
  {
    step: '04',
    title: 'Schedule',
    description: 'Queue posts to your calendar and ship on time — creative and publishing in one flow.',
  },
] as const

export const FEATURES = [
  {
    id: 'images',
    title: 'AI image studio',
    description: 'Generate channel-ready visuals from a prompt with vibes tuned for social.',
    span: 'lg' as const,
    tag: 'Generate',
    icon: 'sparkles' as const,
  },
  {
    id: 'ads',
    title: 'Product-aware ads',
    description: 'Turn catalog products into Meta-ready static ads in minutes.',
    span: 'md' as const,
    tag: 'Convert',
    icon: 'megaphone' as const,
  },
  {
    id: 'carousels',
    title: 'Carousel editor',
    description: 'Design multi-slide posts with precise typography and layout control.',
    span: 'md' as const,
    tag: 'Design',
    icon: 'layers' as const,
  },
  {
    id: 'video',
    title: 'Browser video editor',
    description: 'Import, trim, overlay text, and export short-form MP4s without leaving the app.',
    span: 'lg' as const,
    tag: 'Edit',
    icon: 'clapperboard' as const,
  },
  {
    id: 'schedule',
    title: 'Content calendar',
    description: 'Queue posts across channels and keep your publishing rhythm on track.',
    span: 'sm' as const,
    tag: 'Ship',
    icon: 'calendar' as const,
  },
  {
    id: 'teams',
    title: 'Team workspaces',
    description: 'Collaborate with members, limits, and shared creative context in one place.',
    span: 'sm' as const,
    tag: 'Collaborate',
    icon: 'users' as const,
  },
] as const

export const AUDIENCES = [
  {
    id: 'creators',
    label: 'Creators',
    title: 'Ship more content without juggling five apps',
    description:
      'Generate, edit, and schedule from one studio so you stay consistent across Instagram, TikTok, and YouTube — without losing your creative flow.',
    points: ['AI images & vibes for UGC', 'Short-form video editor', 'Multi-platform calendar'],
  },
  {
    id: 'agencies',
    label: 'Agencies',
    title: 'Run client brands without the chaos',
    description:
      'Spin up workspaces per client, keep assets and products aligned, and move from brief to scheduled post without context-switching.',
    points: ['Brand workspaces', 'Shared assets & products', 'Team collaboration'],
  },
  {
    id: 'ecommerce',
    label: 'Ecommerce',
    title: 'Turn your catalog into scroll-stopping ads',
    description:
      'Pull products into the studio, generate static ads and carousels that stay catalog-true, and schedule launches without leaving the workspace.',
    points: ['Product-aware ad generation', 'Catalog-connected creatives', 'Launch calendars'],
  },
  {
    id: 'business',
    label: 'Business owners',
    title: 'Professional presence without a full social team',
    description:
      'Create on-brand posts, schedule ahead, and keep your channels alive — even when you are running the rest of the business.',
    points: ['All-in-one studio', 'Simple scheduling', 'Consistent brand output'],
  },
] as const

export type AudienceId = (typeof AUDIENCES)[number]['id']

export const ROADMAP = {
  eyebrow: 'What is launching',
  title: 'Everything you need to create and ship',
  description:
    'Socialista ships as a complete studio — not a half-built MVP. Here is what you get at release.',
  items: [
    { title: 'AI image generation', status: 'shipping' as const },
    { title: 'Product-aware static ads', status: 'shipping' as const },
    { title: 'Carousel editor', status: 'shipping' as const },
    { title: 'Browser video editor', status: 'shipping' as const },
    { title: 'Content calendar & scheduling', status: 'shipping' as const },
    { title: 'Team workspaces', status: 'shipping' as const },
    { title: 'Product catalog', status: 'shipping' as const },
    { title: 'Cloud file storage', status: 'shipping' as const },
  ],
} as const

export const FAQ_ITEMS = [
  {
    question: 'What is Socialista?',
    answer:
      'Socialista is a social media content studio and workspace. Create AI images, product ads, carousels, and short videos, schedule posts, and keep everything organized with your team — in one place.',
  },
  {
    question: 'Which platforms will you support?',
    answer:
      'We are building for Instagram, TikTok, YouTube, X, LinkedIn, Pinterest, Facebook, and Threads. Creation formats and scheduling expand with each release.',
  },
  {
    question: 'Does Socialista include scheduling?',
    answer:
      'Yes. Socialista connects creation and publishing — so you can queue content to a calendar from the same workspace where you make it.',
  },
  {
    question: 'Who is early access for?',
    answer:
      'Creators, agencies, ecommerce brands, and business owners who want one place to produce and manage social creative — instead of stitching together separate tools.',
  },
  {
    question: 'When do you launch?',
    answer:
      'We are putting the finishing touches on the studio. Join the waitlist and you will hear from us as soon as seats open.',
  },
  {
    question: 'Is joining the waitlist free?',
    answer: 'Yes. Joining is free and only takes your email. We will reach out when it is your turn.',
  },
  {
    question: 'Will there be a free plan?',
    answer:
      'We are designing plans for solo creators and teams. Waitlist members hear about pricing and plan details first.',
  },
  {
    question: 'Will I get marketing emails forever?',
    answer:
      'No. We use your email to share launch access and important product updates. You can opt out anytime. We never sell your data.',
  },
] as const

export const FINAL_CTA = {
  title: 'Ready when you are',
  description: 'Join the waitlist for early access. Be first in line when Socialista opens.',
  reassurance: 'No spam. Unsubscribe anytime. Launch updates only.',
} as const

export const FOOTER = {
  tagline: 'The on-the-go social content studio for creators, agencies, and brands.',
  columns: [
    {
      title: 'Product',
      links: [
        { href: '#product', label: 'Studio' },
        { href: '#features', label: 'Features' },
        { href: `#${WAITLIST_FORM_ID}`, label: 'Waitlist' },
      ],
    },
    {
      title: 'Audiences',
      links: [
        { href: '#audiences', label: 'Creators' },
        { href: '#audiences', label: 'Agencies' },
        { href: '#audiences', label: 'Ecommerce' },
        { href: '#audiences', label: 'Business' },
      ],
    },
    {
      title: 'Company',
      links: [
        { href: '#faq', label: 'FAQ' },
        { href: '/auth/signin', label: 'Sign in' },
      ],
    },
  ],
} as const
