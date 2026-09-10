import {
  ImagesIcon,
  LayersIcon,
  MegaphoneIcon,
  SmartphoneIcon,
  UserRoundIcon,
  VideoIcon,
} from 'lucide-react'

import type { MockupNavItem } from './product-mockup'

export const STUDIO_MOCKUP_NAV: MockupNavItem[] = [
  { id: 'images', label: 'Images', icon: ImagesIcon },
  { id: 'ads', label: 'Static ads', icon: MegaphoneIcon },
  { id: 'slideshows', label: 'Slideshows', icon: LayersIcon },
  { id: 'video', label: 'Videos', icon: VideoIcon },
  { id: 'influencers', label: 'Influencers', icon: UserRoundIcon },
  { id: 'ugc', label: 'UGC ads', icon: SmartphoneIcon },
]
