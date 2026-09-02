'use client'

import { StudioDitherHero } from '@/components/studio/studio-dither-hero'

export function StaticAdStudioHero() {
  return (
    <StudioDitherHero
      src="/socialista-static-ads.webp"
      chipLabel="Static ads"
      title="Ads"
      titleAccent="in seconds."
      description="One product photo. Recreate a winner. Ready to run."
      imagePosition="object-[50%_38%]"
    />
  )
}
