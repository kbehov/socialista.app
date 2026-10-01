'use client'

import { VideoCard } from '@/components/cards/video-card'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { Button } from '@/components/ui/button'
import { useVideosList } from '@/hooks/use-videos-list'
import { cn } from '@/lib/utils'
import type { VideoSummaryResponse } from '@socialista/types'
import { ClapperboardIcon, Loader2Icon } from 'lucide-react'
import InfiniteScroll from 'react-infinite-scroll-component'

/** Matches `id` on dashboard `<main>` — same scroll root as files infinite scroll. */
const SCROLL_TARGET_ID = 'dashboard-scroll'

const GRID_CLASS =
  'grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-3.5 sm:gap-y-7 lg:grid-cols-4 lg:gap-x-4'

function ScrollLoader() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-[12px] text-muted-foreground">
      <Loader2Icon className="size-3.5 animate-spin" />
      Loading more
    </div>
  )
}

type VideoGridProps = {
  workspaceId: string
  initialVideos: VideoSummaryResponse[]
  initialError?: string | null
  initialHasMore?: boolean
  initialTotal?: number
}

export function VideoGrid({
  workspaceId,
  initialVideos,
  initialError = null,
  initialHasMore = false,
  initialTotal,
}: VideoGridProps) {
  const {
    videos,
    error,
    isLoading,
    hasMore,
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

  if (error && videos.length === 0) {
    return (
      <ErrorState
        title={error}
        description="Try again or refresh the page."
        className="rounded-xl"
        action={
          <Button size="sm" variant="outline" onClick={() => void loadVideos()}>
            Retry
          </Button>
        }
      />
    )
  }

  if (isLoading && videos.length === 0) {
    return <LoadingState message="Loading videos…" className="py-8" />
  }

  if (videos.length === 0) {
    return (
      <EmptyState
        icon={ClapperboardIcon}
        title="No recent videos yet"
        description="Generate a clip from the prompt above, or pick a template to get started."
        variant="ghost"
        minHeight="sm"
      />
    )
  }

  return (
    <>
      <div className={cn(isLoading && 'opacity-60')}>
        <InfiniteScroll
          dataLength={videos.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={<ScrollLoader />}
          scrollableTarget={SCROLL_TARGET_ID}
          scrollThreshold={0.9}
          className="!overflow-visible"
          style={{ overflow: 'visible' }}
        >
          <div className={GRID_CLASS}>
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
      </div>

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
    </>
  )
}
