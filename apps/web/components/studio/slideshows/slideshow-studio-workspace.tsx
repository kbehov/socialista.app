'use client'

import { SlideshowList } from '@/components/carousel/slideshow-list'
import { SlideshowPromptComposer } from '@/components/carousel/slideshow-prompt-composer'
import { SlideshowStudioHero } from '@/components/studio/slideshows/slideshow-studio-hero'
import { SlideshowStudioProvider } from '@/components/studio/slideshows/slideshow-studio-provider'
import type { Model, Preset, SlideshowSummaryResponse } from '@socialista/types'

type SlideshowStudioWorkspaceProps = {
  models: Model[]
  textModels: Model[]
  presets: Preset[]
  workspaceId: string
  initialSlideshows: SlideshowSummaryResponse[]
  initialError?: string | null
  initialHasMore?: boolean
}

export function SlideshowStudioWorkspace({
  models,
  textModels,
  presets,
  workspaceId,
  initialSlideshows,
  initialError = null,
  initialHasMore = false,
}: SlideshowStudioWorkspaceProps) {
  return (
    <SlideshowStudioProvider>
      <div className="image-studio image-studio-workspace image-studio-home relative flex w-full flex-1 flex-col">
        <SlideshowStudioHero presets={presets}>
          <section id="slideshow-studio-composer" aria-label="Create a slideshow">
            <SlideshowPromptComposer models={models} textModels={textModels} presets={presets} />
          </section>
        </SlideshowStudioHero>

        <SlideshowList
          workspaceId={workspaceId}
          initialSlideshows={initialSlideshows}
          initialError={initialError}
          initialHasMore={initialHasMore}
        />
      </div>
    </SlideshowStudioProvider>
  )
}
