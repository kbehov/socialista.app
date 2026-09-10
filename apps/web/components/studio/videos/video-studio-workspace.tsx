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
  initialHasMore?: boolean
  initialAttachmentUrl?: string
}

export function VideoStudioWorkspace({
  models,
  workspaceId,
  initialVideos,
  initialError = null,
  initialHasMore = false,
  initialAttachmentUrl,
}: VideoStudioWorkspaceProps) {
  return (
    <VideoStudioProvider>
      <div className="image-studio image-studio-workspace image-studio-home relative flex w-full flex-1 flex-col">
        <VideoStudioHero>
          <section id="video-studio-composer" aria-label="Create a video">
            <VideoGenerationPromptInput
              initialAttachmentUrl={initialAttachmentUrl}
              models={models}
            />
          </section>
        </VideoStudioHero>

        <RecentVideosList
          workspaceId={workspaceId}
          initialVideos={initialVideos}
          initialError={initialError}
          initialHasMore={initialHasMore}
        />
      </div>
    </VideoStudioProvider>
  )
}
