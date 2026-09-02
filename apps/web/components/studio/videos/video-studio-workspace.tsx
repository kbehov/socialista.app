'use client'

import { VideoStudioProvider } from '@/components/studio/videos/video-studio-provider'
import type { Model, VideoSummaryResponse } from '@socialista/types'
import { RecentVideosList } from './recent-videos-list'
import { VideoStudioHero } from './video-studio-hero'
import VideoGenerationPromptInput from './video-prompt-input'

type VideoStudioWorkspaceProps = {
  models: Model[]
  workspaceId: string
  workspaceName: string
  initialVideos: VideoSummaryResponse[]
  initialError?: string | null
  initialAttachmentUrl?: string
}

export function VideoStudioWorkspace({
  models,
  workspaceId,
  initialVideos,
  initialError = null,
  initialAttachmentUrl,
}: VideoStudioWorkspaceProps) {
  return (
    <VideoStudioProvider>
      <div className="image-studio image-studio-workspace image-studio-home relative flex w-full flex-1 flex-col">
        <VideoStudioHero />

        <section
          id="video-studio-composer"
          aria-label="Create a video"
          className="relative z-10 mx-auto flex w-full max-w-[48rem] flex-col px-4 pb-6 sm:px-6 lg:px-8 -mt-7 sm:-mt-8"
        >
          <VideoGenerationPromptInput initialAttachmentUrl={initialAttachmentUrl} models={models} />
        </section>

        <RecentVideosList
          workspaceId={workspaceId}
          initialVideos={initialVideos}
          initialError={initialError}
        />
      </div>
    </VideoStudioProvider>
  )
}
