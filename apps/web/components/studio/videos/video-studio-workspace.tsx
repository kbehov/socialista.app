'use client'

import { StudioHero } from '@/components/studio/images/studio-hero'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { Model, VideoSummaryResponse } from '@socialista/types'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { RecentVideosList } from './recent-videos-list'
import VideoGenerationPromptInput from './video-prompt-input'
import { VideoStudioProvider } from './video-studio-provider'

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
  workspaceName,
  initialVideos,
  initialError = null,
  initialAttachmentUrl,
}: VideoStudioWorkspaceProps) {
  return (
    <VideoStudioProvider>
      <div className="image-studio image-studio-workspace relative flex w-full flex-col">
        <StudioHero
          imageSrc="/socialista-video.webp"
          chipLabel="Video studio"
          title={'Videos\nin seconds.'}
          description="Prompt the motion. Generate a clip. Cut it in the editor."
          imagePosition="object-[50%_40%]"
          actions={
            <Button
              asChild
              size="sm"
              className="h-8 gap-1.5 rounded-lg border border-white/20 bg-black/40 px-3.5 text-[12px] font-medium text-white shadow-none backdrop-blur-sm hover:bg-black/55 hover:text-white"
            >
              <Link href={DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE}>
                <PlusIcon className="size-3.5" strokeWidth={1.75} />
                Create now
              </Link>
            </Button>
          }
        />

        <section
          id="video-studio-composer"
          aria-label="Create a video"
          className="relative z-10 mx-auto flex w-full max-w-5xl flex-col px-4 pt-5 pb-10 sm:px-6 sm:pt-6 lg:px-8"
        >
          <VideoGenerationPromptInput initialAttachmentUrl={initialAttachmentUrl} models={models} />
        </section>

        <RecentVideosList
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          initialVideos={initialVideos}
          initialError={initialError}
        />
      </div>
    </VideoStudioProvider>
  )
}
