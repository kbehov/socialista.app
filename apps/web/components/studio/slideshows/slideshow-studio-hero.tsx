'use client'

import { SLIDESHOW_STUDIO_STARTERS } from '@/components/studio/slideshows/slideshow-studio-starters'
import { useSlideshowStudio } from '@/components/studio/slideshows/slideshow-studio-provider'
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

const SLIDESHOW_FEATURE_CARDS: StudioHomeFeatureCard[] = [
  {
    id: 'story',
    title: '30-day story',
    description: 'First-person transformation arc',
    prompt: SLIDESHOW_STUDIO_STARTERS[0].prompt,
    image: '/socialista-static-ads.webp',
    imagePosition: 'object-[50%_30%]',
  },
  {
    id: 'list',
    title: 'Listicle',
    description: 'Numbered hooks per slide',
    prompt: SLIDESHOW_STUDIO_STARTERS[1].prompt,
    image: '/socialista-image.webp',
    imagePosition: 'object-[52%_35%]',
  },
  {
    id: 'myth',
    title: 'Myth bust',
    description: 'Contrarian carousel energy',
    prompt: SLIDESHOW_STUDIO_STARTERS[2].prompt,
    image: '/socialista-static-ads.webp',
    imagePosition: 'object-[45%_40%]',
  },
  {
    id: 'routine',
    title: 'Routine',
    description: 'Habit-stack with exact times',
    prompt: SLIDESHOW_STUDIO_STARTERS[3].prompt,
    image: '/socialista-image.webp',
    imagePosition: 'object-[58%_42%]',
  },
  {
    id: 'guide',
    title: 'How-to',
    description: 'Step-by-step save for later',
    prompt: SLIDESHOW_STUDIO_STARTERS[4].prompt,
    image: '/socialista-static-ads.webp',
    imagePosition: 'object-[50%_48%]',
  },
]

type SlideshowStudioHeroProps = {
  children: ReactNode
}

export function SlideshowStudioHero({ children }: SlideshowStudioHeroProps) {
  const { setPrompt } = useSlideshowStudio()

  return (
    <StudioHomeHero
      title="Slideshows"
      gradient="slideshow"
      backgroundSrc="/socialista-static-ads.webp"
      backgroundPosition="object-[50%_28%]"
      featureCards={SLIDESHOW_FEATURE_CARDS}
      onFeatureSelect={card => setPrompt(card.prompt)}
      headerActions={
        <StudioHomeHeaderActions>
          <StudioHomeCreateButton
            href={DASHBOARD_ROUTES.STUDIO.SLIDESHOW_CREATE}
            label="New blank project"
          />
        </StudioHomeHeaderActions>
      }
    >
      {children}
    </StudioHomeHero>
  )
}
