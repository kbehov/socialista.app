'use client'

import {
  StudioHomeCreateButton,
  StudioHomeHeaderActions,
} from '@/components/studio/studio-home-hero-actions'
import {
  StudioHomeHero,
} from '@/components/studio/studio-home-hero'
import { useVideoStudio } from '@/components/studio/videos/video-studio-provider'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { mapPresetToFeatureCard } from '@/lib/studio/preset-media'
import type { Preset } from '@socialista/types'
import { useMemo, type ReactNode } from 'react'

type VideoStudioHeroProps = {
  presets: Preset[]
  children: ReactNode
}

export function VideoStudioHero({ presets, children }: VideoStudioHeroProps) {
  const { applyPreset } = useVideoStudio()
  const featureCards = useMemo(() => presets.map(mapPresetToFeatureCard), [presets])

  return (
    <StudioHomeHero
      title="Videos"
      gradient="video"
      backgroundSrc="/socialista-video.webp"
      backgroundPosition="object-[50%_40%]"
      featureCards={featureCards}
      onFeatureSelect={card => {
        const preset = presets.find(item => item._id === card.id)
        if (preset) applyPreset(preset)
      }}
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
