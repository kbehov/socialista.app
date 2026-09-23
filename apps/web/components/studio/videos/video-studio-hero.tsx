'use client'

import {
  StudioHomeCreateButton,
  StudioHomeHeaderActions,
} from '@/components/studio/studio-home-hero-actions'
import { StudioHomeHero } from '@/components/studio/studio-home-hero'
import { RecentVideosCarousel } from '@/components/studio/videos/recent-videos-carousel'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { VideoSummaryResponse } from '@socialista/types'
import type { ReactNode } from 'react'

type VideoStudioHeroProps = {
  children: ReactNode
  workspaceId: string
  initialVideos: VideoSummaryResponse[]
  initialError?: string | null
  initialHasMore?: boolean
}

export function VideoStudioHero({
  children,
  workspaceId,
  initialVideos,
  initialError = null,
  initialHasMore = false,
}: VideoStudioHeroProps) {
  return (
    <StudioHomeHero
      title="Videos"
      gradient="video"
      backgroundSrc="/socialista-video.webp"
      backgroundPosition="object-[50%_40%]"
      featureCards={[]}
      onFeatureSelect={() => {}}
      headerActions={
        <StudioHomeHeaderActions>
          <StudioHomeCreateButton
            href={DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE}
            label="New blank project"
          />
        </StudioHomeHeaderActions>
      }
      afterBanner={
        <RecentVideosCarousel
          workspaceId={workspaceId}
          initialVideos={initialVideos}
          initialError={initialError}
          initialHasMore={initialHasMore}
        />
      }
    >
      {children}
    </StudioHomeHero>
  )
}
