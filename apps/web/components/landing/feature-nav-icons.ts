import {
  CalendarDays,
  Clapperboard,
  GalleryHorizontalEnd,
  ImageIcon,
  LineChart,
  Megaphone,
  ScanFace,
  type LucideIcon,
} from 'lucide-react'

import type { FeatureSlug } from './features'

export const FEATURE_NAV_ICONS: Record<FeatureSlug, LucideIcon> = {
  'ai-influencers': ScanFace,
  'ai-ugc-video': Clapperboard,
  'ai-slideshows': GalleryHorizontalEnd,
  'ai-meta-ads': Megaphone,
  'ai-images': ImageIcon,
  'ai-videos': Clapperboard,
  'social-scheduling': CalendarDays,
  'social-analytics': LineChart,
}
