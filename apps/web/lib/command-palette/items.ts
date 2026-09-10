import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import {
  ChartColumnIcon,
  HistoryIcon,
  ImagesIcon,
  LayersIcon,
  Link2Icon,
  MegaphoneIcon,
  PlusIcon,
  SendIcon,
  SmartphoneIcon,
  SparklesIcon,
  UserRoundIcon,
  VideoIcon,
  type LucideIcon,
} from 'lucide-react'

export type CommandPaletteItem = {
  id: string
  title: string
  subtitle: string
  href: string
  icon: LucideIcon
  keywords?: string[]
}

export type CommandPaletteSection = {
  heading: string
  items: CommandPaletteItem[]
}

export function commandPaletteSearchValue(item: CommandPaletteItem): string {
  return [item.title, item.subtitle, ...(item.keywords ?? [])].join(' ')
}

const QUICK_ACTIONS: CommandPaletteItem[] = [
  {
    id: 'create-image',
    title: 'Create image',
    subtitle: 'Studio · AI image generation',
    href: DASHBOARD_ROUTES.STUDIO.IMAGES,
    icon: ImagesIcon,
    keywords: ['generate', 'picture', 'photo', 'studio'],
  },
  {
    id: 'create-video',
    title: 'Create video',
    subtitle: 'Studio · AI video generation',
    href: DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE,
    icon: VideoIcon,
    keywords: ['generate', 'clip', 'motion', 'studio'],
  },
  {
    id: 'create-slideshow',
    title: 'Create slideshow',
    subtitle: 'Studio · Carousel composer',
    href: DASHBOARD_ROUTES.STUDIO.SLIDESHOW_CREATE,
    icon: LayersIcon,
    keywords: ['carousel', 'slides', 'studio'],
  },
  {
    id: 'create-ugc',
    title: 'Create UGC project',
    subtitle: 'Studio · UGC ad workflow',
    href: DASHBOARD_ROUTES.STUDIO.UGC_CREATE,
    icon: SmartphoneIcon,
    keywords: ['ugc', 'ads', 'user generated', 'studio'],
  },
  {
    id: 'create-static-ad',
    title: 'Create static ad',
    subtitle: 'Studio · Product-aware ads',
    href: DASHBOARD_ROUTES.STUDIO.STATIC_ADS,
    icon: MegaphoneIcon,
    keywords: ['advertisement', 'marketing', 'studio'],
  },
  {
    id: 'create-influencer',
    title: 'Create influencer',
    subtitle: 'Studio · AI persona',
    href: DASHBOARD_ROUTES.STUDIO.INFLUENCER_CREATE,
    icon: UserRoundIcon,
    keywords: ['persona', 'avatar', 'studio'],
  },
  {
    id: 'create-post',
    title: 'Compose post',
    subtitle: 'Publishing · Multi-platform',
    href: DASHBOARD_ROUTES.createPost(),
    icon: PlusIcon,
    keywords: ['publish', 'schedule', 'social'],
  },
  {
    id: 'connect-account',
    title: 'Connect account',
    subtitle: 'Accounts · Link a social channel',
    href: DASHBOARD_ROUTES.ACCOUNTS,
    icon: Link2Icon,
    keywords: ['oauth', 'instagram', 'tiktok', 'facebook', 'linkedin', 'threads', 'social'],
  },
]

const STUDIO: CommandPaletteItem[] = [
  {
    id: 'studio-images',
    title: 'Image studio',
    subtitle: 'Browse and generate images',
    href: DASHBOARD_ROUTES.STUDIO.IMAGES,
    icon: ImagesIcon,
    keywords: ['editor', 'gallery'],
  },
  {
    id: 'studio-videos',
    title: 'Video editor',
    subtitle: 'Timeline projects and AI video',
    href: DASHBOARD_ROUTES.STUDIO.VIDEOS,
    icon: VideoIcon,
    keywords: ['timeline', 'editor', 'projects'],
  },
  {
    id: 'studio-slideshows',
    title: 'Slideshow editor',
    subtitle: 'Carousel and slide projects',
    href: DASHBOARD_ROUTES.STUDIO.SLIDESHOWS,
    icon: LayersIcon,
    keywords: ['carousel', 'slides', 'editor'],
  },
  {
    id: 'studio-static-ads',
    title: 'Static ads',
    subtitle: 'Product catalog ads',
    href: DASHBOARD_ROUTES.STUDIO.STATIC_ADS,
    icon: MegaphoneIcon,
    keywords: ['advertisement', 'marketing'],
  },
  {
    id: 'studio-ugc',
    title: 'UGC projects',
    subtitle: 'UGC ad workspace',
    href: DASHBOARD_ROUTES.STUDIO.UGC,
    icon: SmartphoneIcon,
    keywords: ['ugc', 'ads'],
  },
  {
    id: 'studio-influencers',
    title: 'Influencers',
    subtitle: 'AI influencer personas',
    href: DASHBOARD_ROUTES.STUDIO.INFLUENCERS,
    icon: UserRoundIcon,
    keywords: ['persona', 'avatar'],
  },
]

const PLATFORM: CommandPaletteItem[] = [
  {
    id: 'platform-posts',
    title: 'Posts',
    subtitle: 'Drafts, calendar, and publishing',
    href: DASHBOARD_ROUTES.POSTS,
    icon: SendIcon,
    keywords: ['publish', 'schedule', 'calendar'],
  },
  {
    id: 'platform-accounts',
    title: 'Accounts',
    subtitle: 'Connected social channels',
    href: DASHBOARD_ROUTES.ACCOUNTS,
    icon: Link2Icon,
    keywords: ['connect', 'instagram', 'tiktok', 'social'],
  },
  {
    id: 'platform-analytics',
    title: 'Analytics',
    subtitle: 'Workspace overview',
    href: DASHBOARD_ROUTES.ROOT,
    icon: ChartColumnIcon,
    keywords: ['dashboard', 'home', 'stats'],
  },
  {
    id: 'platform-files',
    title: 'Files',
    subtitle: 'Workspace media library',
    href: DASHBOARD_ROUTES.FILES,
    icon: ImagesIcon,
    keywords: ['media', 'uploads', 'library', 'assets'],
  },
]

const WORKSPACE: CommandPaletteItem[] = [
  {
    id: 'workspace-generations',
    title: 'Generations',
    subtitle: 'AI run history',
    href: DASHBOARD_ROUTES.GENERATIONS,
    icon: HistoryIcon,
    keywords: ['history', 'runs', 'jobs'],
  },
  {
    id: 'workspace-context',
    title: 'Context & skills',
    subtitle: 'Brands, products, and skills',
    href: DASHBOARD_ROUTES.CONTEXT,
    icon: SparklesIcon,
    keywords: ['brand', 'product', 'skills'],
  },
]

export const COMMAND_PALETTE_SECTIONS: CommandPaletteSection[] = [
  { heading: 'Quick actions', items: QUICK_ACTIONS },
  { heading: 'Studio', items: STUDIO },
  { heading: 'Platform', items: PLATFORM },
  { heading: 'Workspace', items: WORKSPACE },
]
