'use client'

import { StudioHomeHero } from '@/components/studio/studio-home-hero'
import { StudioHomeCreateButton, StudioHomeHeaderActions } from '@/components/studio/studio-home-hero-actions'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { ReactNode } from 'react'

type ImageStudioHeroProps = {
  children: ReactNode
}

export function ImageStudioHero({ children }: ImageStudioHeroProps) {
  return (
    <StudioHomeHero
      title="Images"
      gradient="image"
      backgroundSrc="/studio-image.png"
      backgroundPosition="object-[50%_53%]"
      featureCards={[]}
      onFeatureSelect={() => {}}
      headerActions={
        <StudioHomeHeaderActions>
          <StudioHomeCreateButton href={DASHBOARD_ROUTES.GENERATIONS} label="View gallery" />
        </StudioHomeHeaderActions>
      }
    >
      {children}
    </StudioHomeHero>
  )
}
