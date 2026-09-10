'use client'

import { VIDEO_STUDIO_STARTERS } from '@/components/studio/videos/video-studio-starters'
import { useVideoStudio } from '@/components/studio/videos/video-studio-provider'
import {
  StudioHomeCreateButton,
  StudioHomeHeaderActions,
} from '@/components/studio/studio-home-hero-actions'
import {
  StudioHomeHero,
  type StudioHomeFeatureCard,
} from '@/components/studio/studio-home-hero'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { ReactNode } from 'react'

const VIDEO_FEATURE_CARDS: StudioHomeFeatureCard[] = [
  {
    id: 'ugc',
    title: 'UGC turn',
    description: 'Native creator Reels energy',
    prompt: VIDEO_STUDIO_STARTERS[0].prompt,
    image: '/socialista-video.webp',
    imagePosition: 'object-[50%_35%]',
  },
  {
    id: 'pdp',
    title: 'Product hero',
    description: 'Slow push-in ecommerce clip',
    prompt: VIDEO_STUDIO_STARTERS[1].prompt,
    image: '/socialista-image.webp',
    imagePosition: 'object-[50%_30%]',
  },
  {
    id: 'unbox',
    title: 'Unboxing',
    description: 'Tactile launch-clip pacing',
    prompt: VIDEO_STUDIO_STARTERS[2].prompt,
    image: '/socialista-static-ads.webp',
    imagePosition: 'object-[48%_38%]',
  },
  {
    id: 'talking',
    title: 'Talking head',
    description: 'Eye-level confident delivery',
    prompt: VIDEO_STUDIO_STARTERS[3].prompt,
    image: '/socialista-video.webp',
    imagePosition: 'object-[55%_42%]',
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    description: 'Warm daylight walk-through',
    prompt: VIDEO_STUDIO_STARTERS[4].prompt,
    image: '/socialista-video.webp',
    imagePosition: 'object-[45%_50%]',
  },
]

type VideoStudioHeroProps = {
  children: ReactNode
}

export function VideoStudioHero({ children }: VideoStudioHeroProps) {
  const { setPrompt } = useVideoStudio()

  return (
    <StudioHomeHero
      title="Videos"
      gradient="video"
      backgroundSrc="/socialista-video.webp"
      backgroundPosition="object-[50%_40%]"
      featureCards={VIDEO_FEATURE_CARDS}
      onFeatureSelect={card => setPrompt(card.prompt)}
      headerActions={
        <StudioHomeHeaderActions>
          <StudioHomeCreateButton
            href={DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE}
            label="New blank project"
          />
        </StudioHomeHeaderActions>
      }
    >
      {children}
    </StudioHomeHero>
  )
}
