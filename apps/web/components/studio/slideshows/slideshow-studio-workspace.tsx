'use client'

import { SlideshowList } from '@/components/carousel/slideshow-list'
import { SlideshowPromptComposer } from '@/components/carousel/slideshow-prompt-composer'
import { imageStudioHomeRootClassName } from '@/components/dashboard/studio-shell'
import { SlideshowStudioProvider } from '@/components/studio/slideshows/slideshow-studio-provider'
import { SlideshowTemplatesGallery } from '@/components/studio/slideshows/slideshow-templates-gallery'
import { StudioHomeCreateButton } from '@/components/studio/studio-home-hero-actions'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { Model, SlideshowSummaryResponse } from '@socialista/types'

type SlideshowStudioWorkspaceProps = {
  models: Model[]
  textModels: Model[]
  workspaceId: string
  initialSlideshows: SlideshowSummaryResponse[]
  initialError?: string | null
  initialHasMore?: boolean
}

export function SlideshowStudioWorkspace({
  models,
  textModels,
  workspaceId,
  initialSlideshows,
  initialError = null,
  initialHasMore = false,
}: SlideshowStudioWorkspaceProps) {
  return (
    <SlideshowStudioProvider>
      <div className={imageStudioHomeRootClassName}>
        <section
          id="slideshow-studio-composer"
          aria-label="Create a slideshow"
          className="relative px-4 pt-5 pb-7 sm:px-6 sm:pt-6 sm:pb-9 lg:px-8"
        >
          <div className="relative z-10">
            <div className="mx-auto mb-5 flex w-full max-w-5xl justify-end sm:mb-6">
              <StudioHomeCreateButton href={DASHBOARD_ROUTES.STUDIO.SLIDESHOW_CREATE} label="New blank project" />
            </div>

            <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
              <h1 className="text-xl font-medium mb-5"> 🎞️ Describe in simple words what you want to create </h1>
              <div className="w-full">
                <SlideshowPromptComposer models={models} textModels={textModels} />
              </div>
            </div>
          </div>
        </section>

        <SlideshowTemplatesGallery workspaceId={workspaceId} />

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
