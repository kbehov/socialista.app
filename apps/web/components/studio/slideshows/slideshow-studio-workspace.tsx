'use client'

import { SlideshowList } from '@/components/carousel/slideshow-list'
import { SlideshowPromptComposer } from '@/components/carousel/slideshow-prompt-composer'
import { SlideshowStudioHero } from '@/components/studio/slideshows/slideshow-studio-hero'
import { SlideshowStudioProvider } from '@/components/studio/slideshows/slideshow-studio-provider'
import type { Model, SlideshowSummaryResponse } from '@socialista/types'

type SlideshowStudioWorkspaceProps = {
  models: Model[]
  textModels: Model[]
  workspaceId: string
  initialSlideshows: SlideshowSummaryResponse[]
  initialError?: string | null
}

export function SlideshowStudioWorkspace({
  models,
  textModels,
  workspaceId,
  initialSlideshows,
  initialError = null,
}: SlideshowStudioWorkspaceProps) {
  return (
    <SlideshowStudioProvider>
      <div className="image-studio image-studio-workspace image-studio-home relative flex w-full flex-1 flex-col">
        <SlideshowStudioHero />

        <section
          id="slideshow-studio-composer"
          aria-label="Create a slideshow"
          className="relative z-10 mx-auto flex w-full max-w-[48rem] flex-col px-4 pb-6 sm:px-6 lg:px-8 -mt-7 sm:-mt-8"
        >
          <SlideshowPromptComposer models={models} textModels={textModels} />
        </section>

        <SlideshowList
          workspaceId={workspaceId}
          initialSlideshows={initialSlideshows}
          initialError={initialError}
        />
      </div>
    </SlideshowStudioProvider>
  )
}
