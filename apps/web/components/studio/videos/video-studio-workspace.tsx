'use client'

import { imageStudioHomeRootClassName } from '@/components/dashboard/studio-shell'
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
        <section
          id="video-studio-composer"
          aria-label="Create a video"
          className="relative px-4 pt-5 pb-7 sm:px-6 sm:pt-6 sm:pb-9 lg:px-8"
        >
          {/* <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <Image
              src="/socialista-video.webp"
              alt=""
              fill
              priority
              quality={80}
              sizes={STAGE_IMAGE_SIZES}
              className="object-cover object-[50%_28%] select-none"
            />
            <div className="image-studio-prompt-stage-scrim absolute inset-0" />
          </div> */}

          <div className="relative z-10">
            <div className="mx-auto mb-5 flex w-full max-w-5xl justify-end sm:mb-6">
              <StudioHomeCreateButton href={DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE} label="New blank project" />
            </div>

            <div className="mx-auto flex w-full max-w-2xl flex-col items-center ">
              <h1 className="text-xl font-medium mb-5">🎥 What would you like to create today?</h1>
              <div className="w-full">
                <VideoGenerationPromptInput initialAttachmentUrl={initialAttachmentUrl} models={models} />
              </div>
            </div>
          </div>
        </section>

        <section
          aria-label="Recent videos and templates"
          className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8"
        >
          <Tabs defaultValue="recent" className="w-full gap-4">
            <TabsList
              variant="line"
              className="h-9 w-full justify-start gap-1 px-0 [&_[data-slot=tabs-trigger]]:h-8 [&_[data-slot=tabs-trigger]]:px-2.5 [&_[data-slot=tabs-trigger]]:text-[13px] [&_[data-slot=tabs-trigger]]:font-medium [&_[data-slot=tabs-trigger]]:tracking-[-0.015em] [&_[data-slot=tabs-trigger]]:after:bottom-[-4px]"
            >
              <TabsTrigger value="recent">Recent videos</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
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
              <VideoTemplatesGallery
                models={models}
                templateCategories={templateCategories}
                hideTitle
              />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </VideoStudioProvider>
  )
}
