'use client'

import { SlideshowList } from '@/components/carousel/slideshow-list'
import { SlideshowPromptComposer } from '@/components/carousel/slideshow-prompt-composer'
import { imageStudioHomeRootClassName } from '@/components/dashboard/studio-shell'
import { SlideshowStudioProvider } from '@/components/studio/slideshows/slideshow-studio-provider'
import { SlideshowTemplatesGallery } from '@/components/studio/slideshows/slideshow-templates-gallery'
import { StudioHomeBelowSection } from '@/components/studio/studio-home-below-section'
import { StudioHomeComposerSection } from '@/components/studio/studio-home-composer-section'
import { StudioHomePromptExtras } from '@/components/studio/studio-home-prompt-extras'
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
        <StudioHomeComposerSection
          id="slideshow-studio-composer"
          ariaLabel="Create a slideshow"
          contentMaxWidth="medium"
          description="Outline the story — we’ll draft slides and captions from your prompt."
          toolbar={
            <StudioHomeCreateButton href={DASHBOARD_ROUTES.STUDIO.SLIDESHOW_CREATE} label="New blank project" />
          }
          footer={<StudioHomePromptExtras />}
        >
          <SlideshowPromptComposer models={models} textModels={textModels} />
        </StudioHomeComposerSection>

        <StudioHomeBelowSection ariaLabel="Templates and recent carousels" className="pb-10 sm:pb-12">
          <SlideshowTemplatesGallery workspaceId={workspaceId} />
          <div className="mt-10 border-t border-border/40 pt-9 sm:mt-11 sm:pt-10">
            <SlideshowList
              workspaceId={workspaceId}
              initialSlideshows={initialSlideshows}
              initialError={initialError}
              initialHasMore={initialHasMore}
              embedded
            />
          </div>
        </StudioHomeBelowSection>
      </div>
    </SlideshowStudioProvider>
  )
}
