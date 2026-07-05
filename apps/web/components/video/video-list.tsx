'use client'

import { VideoCard } from '@/components/cards/video-card'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { Button } from '@/components/ui/button'
import { deleteVideo, duplicateVideo, getWorkspaceVideos } from '@/services/video.service'
import { useWorkspaceStore } from '@/store/workspace.store'
import type { VideoSummaryResponse } from '@socialista/types'
import { PlusIcon, VideoIcon } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

function getWorkspaceId(workspace: { id?: string; _id?: string } | null | undefined): string | undefined {
  return workspace?.id ?? workspace?._id
}

export function VideoList() {
  const workspace = useWorkspaceStore(s => s.currentWorkspace)
  const workspaceId = getWorkspaceId(workspace)
  const [videos, setVideos] = useState<VideoSummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<VideoSummaryResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)

  const loadVideos = useCallback(async () => {
    if (!workspaceId) {
      setVideos([])
      setIsLoading(false)
      return
    }
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

  useEffect(() => {
    void loadVideos()
  }, [loadVideos])

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
    void loadVideos()
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
    void loadVideos()
  }

  if (!workspace) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Select a workspace to view videos.
      </div>
    )
  }

  const draftCount = videos.length

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-1">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-base font-semibold tracking-tight">Videos</h1>
          <p className="truncate text-xs text-muted-foreground">
            {isLoading ? 'Loading drafts…' : `${draftCount} draft${draftCount === 1 ? '' : 's'} in ${workspace.name}`}
          </p>
        </div>
        <Button size="sm" className="h-8 shrink-0 rounded-full px-3.5" asChild>
          <Link href="/dashboard/studio/videos/create">
            <PlusIcon className="size-3.5" />
            Create
          </Link>
        </Button>
      </header>

      {isLoading ? (
        <LoadingState message="Loading videos…" className="flex-1" />
      ) : error ? (
        <ErrorState
          title={error}
          description="Try again or refresh the page."
          className="flex-1"
          action={
            <Button size="sm" variant="outline" onClick={() => void loadVideos()}>
              Retry
            </Button>
          }
        />
      ) : videos.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 px-6 py-16 text-center">
          <span className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-muted">
            <VideoIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
          </span>
          <p className="text-sm font-semibold tracking-tight">Start your first video</p>
          <p className="mt-1.5 max-w-[18rem] text-xs leading-relaxed text-muted-foreground">
            Build short-form videos entirely in your browser — import, trim, overlay text, export MP4.
          </p>
          <Button size="sm" className="mt-5 h-8 rounded-full px-4" asChild>
            <Link href="/dashboard/studio/videos/create">
              <PlusIcon className="size-3.5" />
              Create video
            </Link>
          </Button>
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
