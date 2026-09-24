'use client'

import { StudioHomeCreateButton } from '@/components/studio/studio-home-hero-actions'
import { VideoStudioProvider } from '@/components/studio/videos/video-studio-provider'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { Model, StudioTemplateCategoryDto, VideoSummaryResponse } from '@socialista/types'
import Image from 'next/image'
import { RecentVideosCarousel } from './recent-videos-carousel'
import { VideoTemplatesGallery } from './video-templates-gallery'
import VideoGenerationPromptInput from './video-prompt-input'

const STAGE_IMAGE_SIZES = '(max-width: 768px) 100vw, 1200px'

type VideoStudioWorkspaceProps = {
  models: Model[]
  workspaceId: string
  initialVideos: VideoSummaryResponse[]
  initialError?: string | null
  initialHasMore?: boolean
  initialAttachmentUrl?: string
  templateCategories: StudioTemplateCategoryDto[]
}

export function VideoStudioWorkspace({
  models,
  workspaceId,
  initialVideos,
  initialError = null,
  initialHasMore = false,
  initialAttachmentUrl,
  templateCategories,
}: VideoStudioWorkspaceProps) {
  return (
    <VideoStudioProvider>
      <div className="image-studio image-studio-workspace image-studio-home relative flex w-full flex-1 flex-col">
        <section
          id="video-studio-composer"
          aria-label="Create a video"
          className="relative px-4 pt-5 pb-7 sm:px-6 sm:pt-6 sm:pb-9 lg:px-8"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
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
          </div>

          <div className="relative z-10">
            <div className="mx-auto mb-5 flex w-full max-w-5xl justify-end sm:mb-6">
              <StudioHomeCreateButton
                href={DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE}
                label="New blank project"
              />
            </div>

            <div className="mx-auto flex w-full max-w-[48rem] flex-col items-center">
              <h1 className="mb-5 text-center text-[1.625rem] font-semibold leading-none tracking-[-0.035em] text-white [text-shadow:0_1px_18px_rgb(0_0_0/0.45)] sm:mb-6 sm:text-[1.75rem]">
                Make the video.
              </h1>
              <div className="w-full">
                <VideoGenerationPromptInput
                  initialAttachmentUrl={initialAttachmentUrl}
                  models={models}
                />
              </div>
            </div>
          </div>
        </section>

        <section
          aria-label="Recent videos"
          className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8"
        >
          <RecentVideosCarousel
            workspaceId={workspaceId}
            initialVideos={initialVideos}
            initialError={initialError}
            initialHasMore={initialHasMore}
          />
        </section>

        <section
          aria-label="Templates"
          className="relative z-10 mx-auto mt-8 w-full max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8"
        >
          <VideoTemplatesGallery models={models} templateCategories={templateCategories} />
        </section>
      </div>
    </VideoStudioProvider>
  )
}
