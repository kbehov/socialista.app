'use client'

import { useImageStudio } from '@/components/studio/images/image-studio-provider'
import {
  StudioHomeCreateButton,
  StudioHomeHeaderActions,
} from '@/components/studio/studio-home-hero-actions'
import {
  StudioHomeHero,
  type StudioHomeFeatureCard,
} from '@/components/studio/studio-home-hero'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { Preset } from '@socialista/types'
import { useMemo, type ReactNode } from 'react'

type ImageStudioHeroProps = {
  presets: Preset[]
  children: ReactNode
}

function mapPresetToFeatureCard(preset: Preset): StudioHomeFeatureCard {
  return {
    id: preset._id,
    title: preset.name,
    description: preset.description,
    prompt: preset.prompt,
    image: preset.image,
  }
}

export function ImageStudioHero({ presets, children }: ImageStudioHeroProps) {
  const { applyPreset } = useImageStudio()
  const featureCards = useMemo(() => presets.map(mapPresetToFeatureCard), [presets])

  return (
    <StudioHomeHero
      title="Images"
      gradient="image"
      backgroundSrc="/socialista-image.webp"
      backgroundPosition="object-[50%_30%]"
      featureCards={featureCards}
      onFeatureSelect={card => {
        const preset = presets.find(item => item._id === card.id)
        if (preset) applyPreset(preset)
      }}
      headerActions={
        <StudioHomeHeaderActions>
          <StudioHomeCreateButton
            href={DASHBOARD_ROUTES.GENERATIONS}
            label="View gallery"
          />
        </StudioHomeHeaderActions>
      }
    >
      {children}
    </StudioHomeHero>
  )
}
