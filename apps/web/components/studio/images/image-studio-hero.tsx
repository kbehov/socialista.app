'use client'

import { StudioDitherHero } from '@/components/studio/studio-dither-hero'

export function ImageStudioHero() {
  return (
    <StudioDitherHero
      src="/socialista-image.webp"
      chipLabel="Image studio"
      title="Stills"
      titleAccent="in seconds."
      description="Prompt the scene. Generate a set. Keep the ones that work."
      imagePosition="object-[50%_30%]"
    />
  )
}
