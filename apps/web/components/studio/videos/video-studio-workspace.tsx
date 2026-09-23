'use client'

import { VideoStudioProvider } from '@/components/studio/videos/video-studio-provider'
import type { Model, StudioTemplateCategoryDto, VideoSummaryResponse } from '@socialista/types'
import { VideoStudioHero } from './video-studio-hero'
import VideoGenerationPromptInput from './video-prompt-input'
import { VideoTemplatesGallery } from './video-templates-gallery'

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
        <VideoStudioHero
          workspaceId={workspaceId}
          initialVideos={initialVideos}
          initialError={initialError}
          initialHasMore={initialHasMore}
        >
          <section id="video-studio-composer" aria-label="Create a video">
            <VideoGenerationPromptInput
              initialAttachmentUrl={initialAttachmentUrl}
              models={models}
            />
          </section>
        </VideoStudioHero>

        <section
          aria-label="Browse video inspirations"
          className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-12 pt-3 sm:px-6 sm:pb-14 sm:pt-5 lg:px-8"
        >
          <VideoTemplatesGallery models={models} templateCategories={templateCategories} />
        </section>
      </div>
    </VideoStudioProvider>
  )
}
