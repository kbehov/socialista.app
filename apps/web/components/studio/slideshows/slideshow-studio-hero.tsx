'use client'

import {
  StudioHomeCreateButton,
  StudioHomeHeaderActions,
} from '@/components/studio/studio-home-hero-actions'
import {
  StudioHomeHero,
} from '@/components/studio/studio-home-hero'
import { useSlideshowStudio } from '@/components/studio/slideshows/slideshow-studio-provider'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { mapPresetToFeatureCard } from '@/lib/studio/preset-media'
import type { Preset } from '@socialista/types'
import { useMemo, type ReactNode } from 'react'

type SlideshowStudioHeroProps = {
  presets: Preset[]
  children: ReactNode
}

export function SlideshowStudioHero({ presets, children }: SlideshowStudioHeroProps) {
  const { applyPreset } = useSlideshowStudio()
  const featureCards = useMemo(() => presets.map(mapPresetToFeatureCard), [presets])

  return (
    <StudioHomeHero
      title="Slideshows"
      gradient="slideshow"
      backgroundSrc="/socialista-static-ads.webp"
      backgroundPosition="object-[50%_28%]"
      featureCards={featureCards}
      onFeatureSelect={card => {
        const preset = presets.find(item => item._id === card.id)
        if (preset) applyPreset(preset)
      }}
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
