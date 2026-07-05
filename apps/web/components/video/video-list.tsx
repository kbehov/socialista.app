'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { deleteVideo, duplicateVideo, getWorkspaceVideos } from '@/services/video.service'
import { useWorkspaceStore } from '@/store/workspace.store'
import type { VideoSummaryResponse } from '@socialista/types'
import { CopyIcon, Loader2Icon, PlusIcon, Trash2Icon, VideoIcon } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

function getWorkspaceId(workspace: { id?: string; _id?: string } | null | undefined): string | undefined {
  return workspace?.id ?? workspace?._id
}

function VideoCard({
  video,
  onDelete,
  onDuplicate,
  isDuplicating,
}: {
  video: VideoSummaryResponse
  onDelete: (video: VideoSummaryResponse) => void
  onDuplicate: (video: VideoSummaryResponse) => void
  isDuplicating: boolean
}) {
  const href = `/dashboard/studio/videos/${video.id}`
  const aspectRatio = video.resolution.width / video.resolution.height
  return (
    <article className="group/card relative">
      <Link href={href} className="block focus-visible:outline-none">
        <div
          className={cn(
            'relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-black ring-1 ring-border/60 transition-[box-shadow,ring-color] duration-200',
            'group-hover/card:ring-border group-hover/card:shadow-md',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
          style={{ aspectRatio }}
        >
          <VideoIcon className="size-10 text-white/40" strokeWidth={1.25} />
          <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
            {video.duration > 0 ? `${video.duration.toFixed(1)}s` : 'Empty'}
          </span>
          <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
            {video.resolution.width}×{video.resolution.height}
          </span>
        </div>
      </Link>

      <div className="mt-2.5 space-y-1.5 px-0.5">
        <Link href={href} className="block min-w-0 focus-visible:underline focus-visible:outline-none">
          <h2 className="truncate text-sm font-medium leading-snug tracking-tight">{video.name}</h2>
        </Link>
        <div className="flex items-center gap-2 text-[11px] tabular-nums text-muted-foreground">
          <span className="shrink-0">{formatRelativeTime(video.updatedAt)}</span>
          <span className="text-border">·</span>
          <span className="truncate">{video.clipCount} clips</span>
        </div>
      </div>

      <div className="absolute top-2 right-2 z-30 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover/card:opacity-100 group-focus-within/card:opacity-100">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="size-8 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/55 hover:text-white"
              aria-label={`Duplicate ${video.name}`}
              disabled={isDuplicating}
              onClick={event => {
                event.preventDefault()
                event.stopPropagation()
                onDuplicate(video)
              }}
            >
              {isDuplicating ? <Loader2Icon className="size-3.5 animate-spin" /> : <CopyIcon className="size-3.5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Duplicate</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="size-8 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/55 hover:text-white"
              aria-label={`Delete ${video.name}`}
              onClick={event => {
                event.preventDefault()
                event.stopPropagation()
                onDelete(video)
              }}
            >
              <Trash2Icon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Delete</TooltipContent>
        </Tooltip>
      </div>
    </article>
  )
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
