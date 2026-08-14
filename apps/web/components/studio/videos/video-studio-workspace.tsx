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
}

export function VideoStudioWorkspace({
  models,
  workspaceId,
  workspaceName,
  initialVideos,
  initialError = null,
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
              className="h-8 gap-1.5 rounded-full border-white/15 bg-black/35 px-3.5 text-[12px] font-medium text-white shadow-none backdrop-blur-md backdrop-saturate-150 hover:bg-black/50 hover:text-white"
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
          className="relative z-10 mx-auto flex w-full max-w-3xl flex-col px-4 pb-10 sm:px-6 lg:px-8"
        >
          <div className="image-studio-composer relative -mt-[3.25rem] sm:-mt-[4.25rem] lg:-mt-[4.5rem]">
            <div
              aria-hidden
              className="image-studio-composer-lift pointer-events-none absolute -inset-x-3 -top-5 bottom-6 sm:-inset-x-5 motion-reduce:hidden"
            />
            <div className="relative">
              <VideoGenerationPromptInput models={models} />
            </div>
          </div>
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
