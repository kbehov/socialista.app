'use client'

import { VideoCard } from '@/components/cards/video-card'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useVideosList } from '@/hooks/use-videos-list'
import { cn } from '@/lib/utils'
import type { VideoSummaryResponse } from '@socialista/types'
import { Loader2Icon, PlusIcon, VideoIcon } from 'lucide-react'
import Link from 'next/link'

type RecentVideosListProps = {
  workspaceId: string
  workspaceName: string
  initialVideos: VideoSummaryResponse[]
  initialError?: string | null
}

export function RecentVideosList({
  workspaceId,
  workspaceName,
  initialVideos,
  initialError = null,
}: RecentVideosListProps) {
  const {
    videos,
    error,
    isLoading,
    deleteTarget,
    isDeleting,
    duplicatingId,
    setDeleteTarget,
    loadVideos,
    handleDelete,
    handleDuplicate,
  } = useVideosList({ workspaceId, initialVideos, initialError })

  const createAction = (
    <Button asChild size="sm" className={dashboardSurface.createCta}>
      <Link href={DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE}>
        <PlusIcon className="size-4" strokeWidth={1.75} />
        Create now
      </Link>
    </Button>
  )

  const countLabel =
    videos.length === 1 ? `1 video in ${workspaceName}` : `${videos.length.toLocaleString()} videos in ${workspaceName}`

  return (
    <section className="mx-auto w-full max-w-screen-7xl px-4 pb-16 sm:px-6 lg:px-8" aria-labelledby="recent-videos-heading">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 id="recent-videos-heading" className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">
            Recent videos
          </h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {isLoading ? 'Loading drafts…' : countLabel}
          </p>
        </div>
        {isLoading ? <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" /> : null}
      </div>

      {error ? (
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
      ) : videos.length === 0 ? (
        <EmptyState
          icon={VideoIcon}
          title="No editor drafts yet"
          description="Generate a clip above, or open the timeline editor to build one by hand."
          minHeight="lg"
          variant="hero"
          iconClassName={dashboardSurface.emptyIcon}
          action={createAction}
        />
      ) : (
        <div className={cn('grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6', isLoading && 'opacity-60')}>
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
    </section>
  )
}
