'use client'

import { VideoCard } from '@/components/cards/video-card'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { dashboardSurface } from '@/components/dashboard'
import { PageHeader } from '@/components/headers/page-header'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useVideosList } from '@/hooks/use-videos-list'
import type { VideoSummaryResponse } from '@socialista/types'
import { Loader2Icon, PlusIcon, VideoIcon } from 'lucide-react'
import Link from 'next/link'
import InfiniteScroll from 'react-infinite-scroll-component'

/** Matches `id` on dashboard `<main>` — same scroll root as files infinite scroll. */
const SCROLL_TARGET_ID = 'dashboard-scroll'

function CreateVideoButton() {
  return (
    <Button asChild size="sm" className={dashboardSurface.createCta}>
      <Link href={DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE}>
        <PlusIcon className="size-4" strokeWidth={1.75} />
        Create video
      </Link>
    </Button>
  )
}

type VideoLibraryProps = {
  workspaceId: string
  workspaceName: string
  initialVideos: VideoSummaryResponse[]
  initialError?: string | null
  initialHasMore?: boolean
  initialTotal?: number
}

function ScrollLoader() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-[12px] text-muted-foreground">
      <Loader2Icon className="size-3.5 animate-spin" />
      Loading more
    </div>
  )
}

export function VideoLibrary({
  workspaceId,
  workspaceName,
  initialVideos,
  initialError = null,
  initialHasMore = false,
  initialTotal,
}: VideoLibraryProps) {
  const {
    videos,
    error,
    isLoading,
    hasMore,
    total,
    deleteTarget,
    isDeleting,
    duplicatingId,
    setDeleteTarget,
    loadVideos,
    fetchMore,
    handleDelete,
    handleDuplicate,
  } = useVideosList({
    workspaceId,
    initialVideos,
    initialError,
    initialHasMore,
    initialTotal,
  })

  const headerDescription =
    isLoading && videos.length === 0
      ? 'Loading drafts…'
      : `${total === 1 ? '1 video' : `${total.toLocaleString()} videos`} in ${workspaceName}`

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="All videos"
        description={headerDescription}
        backHref={DASHBOARD_ROUTES.STUDIO.VIDEOS}
        actions={<CreateVideoButton />}
      />

      {error && videos.length === 0 ? (
        <ErrorState
          title={error}
          description="Try again or refresh the page."
          className="flex-1 rounded-xl"
          action={
            <Button size="sm" variant="outline" onClick={() => void loadVideos()}>
              Retry
            </Button>
          }
        />
      ) : isLoading && videos.length === 0 ? (
        <LoadingState message="Loading videos…" className="flex-1" />
      ) : videos.length === 0 ? (
        <EmptyState
          icon={VideoIcon}
          title="Start your first video"
          description="Build short-form videos entirely in your browser — import, trim, overlay text, export MP4."
          minHeight="lg"
          variant="hero"
          className="flex-1"
          iconClassName={dashboardSurface.emptyIcon}
          action={<CreateVideoButton />}
        />
      ) : (
        <InfiniteScroll
          dataLength={videos.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={<ScrollLoader />}
          scrollableTarget={SCROLL_TARGET_ID}
          scrollThreshold={0.9}
          className="!overflow-visible pb-10"
          style={{ overflow: 'visible' }}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {videos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                onDelete={setDeleteTarget}
                onDuplicate={item => void handleDuplicate(item)}
                isDuplicating={duplicatingId === video.id}
              />
            ))}
          </div>
        </InfiniteScroll>
      )}

      <DeleteConfirmDialog
        open={deleteTarget != null}
        onOpenChange={open => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete video?"
        description={
          deleteTarget
            ? `“${deleteTarget.name}” will be permanently removed. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete video"
        isDeleting={isDeleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}
