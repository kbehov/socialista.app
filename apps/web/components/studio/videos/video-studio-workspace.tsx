'use client'

import { imageStudioHomeRootClassName } from '@/components/dashboard/studio-shell'
import { StudioHomeBelowSection } from '@/components/studio/studio-home-below-section'
import { StudioHomeComposerSection } from '@/components/studio/studio-home-composer-section'
import { StudioHomePromptExtras } from '@/components/studio/studio-home-prompt-extras'
import { StudioHomeCreateButton } from '@/components/studio/studio-home-hero-actions'
import { VideoStudioProvider } from '@/components/studio/videos/video-studio-provider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { Model, StudioTemplateCategoryDto, VideoSummaryResponse } from '@socialista/types'
import { VideoGrid } from './video-grid'
import VideoGenerationPromptInput from './video-prompt-input'
import { VideoTemplatesGallery } from './video-templates-gallery'

type VideoStudioWorkspaceProps = {
  models: Model[]
  workspaceId: string
  initialVideos: VideoSummaryResponse[]
  initialError?: string | null
  initialHasMore?: boolean
  initialTotal?: number
  initialAttachmentUrl?: string
  templateCategories: StudioTemplateCategoryDto[]
}

export function VideoStudioWorkspace({
  models,
  workspaceId,
  initialVideos,
  initialError = null,
  initialHasMore = false,
  initialTotal,
  initialAttachmentUrl,
  templateCategories,
}: VideoStudioWorkspaceProps) {
  return (
    <VideoStudioProvider>
      <div className={imageStudioHomeRootClassName}>
        <StudioHomeComposerSection
          id="video-studio-composer"
          ariaLabel="Create a video"
          description="Describe motion and mood — add a reference frame to guide the shot."
          toolbar={
            <StudioHomeCreateButton href={DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE} label="New blank project" />
          }
          footer={<StudioHomePromptExtras />}
        >
          <VideoGenerationPromptInput initialAttachmentUrl={initialAttachmentUrl} models={models} />
        </StudioHomeComposerSection>

        <StudioHomeBelowSection ariaLabel="Recent videos and templates">
          <Tabs defaultValue="recent" className="w-full gap-4">
            <TabsList
              variant="line"
              className="h-9 w-full justify-start gap-1 px-0 [&_[data-slot=tabs-trigger]]:h-8 [&_[data-slot=tabs-trigger]]:px-2.5 [&_[data-slot=tabs-trigger]]:text-[13px] [&_[data-slot=tabs-trigger]]:font-medium [&_[data-slot=tabs-trigger]]:tracking-[-0.015em] [&_[data-slot=tabs-trigger]]:after:bottom-[-4px]"
            >
              <TabsTrigger value="recent">Recent videos</TabsTrigger>
              <TabsTrigger value="templates">Inspirations</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-0 pt-1">
              <VideoGrid
                workspaceId={workspaceId}
                initialVideos={initialVideos}
                initialError={initialError}
                initialHasMore={initialHasMore}
                initialTotal={initialTotal}
              />
            </TabsContent>

            <TabsContent value="templates" className="mt-0 pt-1">
              <VideoTemplatesGallery models={models} templateCategories={templateCategories} />
            </TabsContent>
          </Tabs>
        </StudioHomeBelowSection>
      </div>
    </VideoStudioProvider>
  )
}
