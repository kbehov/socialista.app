'use client'

import { VideoCard } from '@/components/cards/video-card'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { dashboardSurface } from '@/components/dashboard'
import { PageHeader } from '@/components/headers/page-header'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { deleteVideo, duplicateVideo, getWorkspaceVideos } from '@/services/video.service'
import type { VideoSummaryResponse } from '@socialista/types'
import { PlusIcon, VideoIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

type VideoListProps = {
  workspaceId: string
  workspaceName: string
  initialVideos: VideoSummaryResponse[]
  initialError?: string | null
}

export function VideoList({
  workspaceId,
  workspaceName,
  initialVideos,
  initialError = null,
}: VideoListProps) {
  const router = useRouter()
  const [videos, setVideos] = useState(initialVideos)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  const [deleteTarget, setDeleteTarget] = useState<VideoSummaryResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)

  useEffect(() => {
    setVideos(initialVideos)
    setError(initialError)
  }, [initialVideos, initialError])

  const loadVideos = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const response = await getWorkspaceVideos(workspaceId, 'draft')
    if (!response.success || !response.data) {
      setError(response.message ?? 'Failed to load videos')
      setVideos([])
      setIsLoading(false)
      return
    }
    setVideos(response.data.videos)
    setIsLoading(false)
  }, [workspaceId])

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    const response = await deleteVideo(deleteTarget.id)
    setIsDeleting(false)
    if (!response.success) {
      toast.error(response.message ?? 'Failed to delete video')
      return
    }
    toast.success('Video deleted')
    setDeleteTarget(null)
    router.refresh()
  }

  const handleDuplicate = async (video: VideoSummaryResponse) => {
    if (duplicatingId) return
    setDuplicatingId(video.id)
    const response = await duplicateVideo(video.id)
    setDuplicatingId(null)
    if (!response.success || !response.data?.video) {
      toast.error(response.message ?? 'Failed to duplicate video')
      return
    }
    toast.success(`Duplicated as “${response.data.video.name}”`)
    router.refresh()
  }

  const draftCount = videos.length
  const createAction = (
    <Button asChild size="sm" className={dashboardSurface.createCta}>
      <Link href={DASHBOARD_ROUTES.STUDIO.VIDEO_CREATE}>
        <PlusIcon className="size-4" strokeWidth={1.75} />
        Create video
      </Link>
    </Button>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Videos"
        description={
          isLoading
            ? 'Loading drafts…'
            : `${draftCount === 1 ? '1 video' : `${draftCount.toLocaleString()} videos`} in ${workspaceName}`
        }
        actions={createAction}
      />

      {isLoading ? (
        <LoadingState message="Loading videos…" className="flex-1" />
      ) : error ? (
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
      ) : videos.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 px-6 py-16 text-center">
          <span className={cn('mb-4 flex items-center justify-center', dashboardSurface.emptyIcon)}>
            <VideoIcon className="text-muted-foreground" strokeWidth={1.5} />
          </span>
          <p className="text-sm font-semibold tracking-tight">Start your first video</p>
          <p className="mt-1.5 max-w-[18rem] text-xs leading-relaxed text-muted-foreground">
            Build short-form videos entirely in your browser — import, trim, overlay text, export MP4.
          </p>
          <div className="mt-5">{createAction}</div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {videos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                onDelete={setDeleteTarget}
                onDuplicate={video => void handleDuplicate(video)}
                isDuplicating={duplicatingId === video.id}
              />
            ))}
          </div>
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
    </div>
  )
}
