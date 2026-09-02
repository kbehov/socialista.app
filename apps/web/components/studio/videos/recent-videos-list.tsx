'use client'

import { VideoCard } from '@/components/cards/video-card'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { ErrorState } from '@/components/common/error-state'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useVideosList } from '@/hooks/use-videos-list'
import { cn } from '@/lib/utils'
import type { VideoSummaryResponse } from '@socialista/types'
import { ArrowRightIcon, Loader2Icon } from 'lucide-react'
import Link from 'next/link'

type RecentVideosListProps = {
  workspaceId: string
  initialVideos: VideoSummaryResponse[]
  initialError?: string | null
}

export function RecentVideosList({
  workspaceId,
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

  if (!error && videos.length === 0 && !isLoading) {
    return null
  }

  return (
    <section
      className="mx-auto w-full max-w-5xl px-4 pb-[max(4rem,calc(env(safe-area-inset-bottom,0px)+3rem))] sm:px-6 lg:px-8"
      aria-labelledby="recent-videos-heading"
    >
      <div className="mb-3.5 flex items-end justify-between gap-3">
        <h2
          id="recent-videos-heading"
          className="text-[13px] font-medium tracking-[-0.015em] text-foreground/80"
        >
          Recent clips
        </h2>
        <div className="flex items-center gap-3">
          {isLoading ? <Loader2Icon className="size-3.5 animate-spin text-black/36 dark:text-white/36" /> : null}
          <Link
            href={DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE}
            className="inline-flex items-center gap-1 text-[12px] font-medium tracking-[-0.01em] text-black/44 transition-colors hover:text-foreground dark:text-white/44"
          >
            Open editor
            <ArrowRightIcon className="size-3" strokeWidth={1.75} />
          </Link>
        </div>
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
      ) : (
        <div
          className={cn(
            'grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4',
            isLoading && 'opacity-60',
          )}
        >
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
