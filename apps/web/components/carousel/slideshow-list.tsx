'use client'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { PlatformIcon } from '@/components/carousel/format-selector'
import {
  SlideshowCardPreview,
  SlideshowCardSlideBadge,
  SlideshowCardStoryBars,
} from '@/components/carousel/slideshow-card-preview'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getAspectRatioPreset } from '@/lib/carousel/aspect-ratios'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { deleteSlideshow, duplicateSlideshow, getWorkspaceSlideshows } from '@/services/slideshow.service'
import { useWorkspaceStore } from '@/store/workspace.store'
import type { SlideshowSummaryResponse } from '@socialista/types'
import { ImagesIcon, LayersIcon, CopyIcon, Loader2Icon, PlusIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

function getWorkspaceId(workspace: { id?: string; _id?: string } | null | undefined): string | undefined {
  return workspace?.id ?? workspace?._id
}

function SlideshowCard({
  slideshow,
  onDelete,
  onDuplicate,
  isDuplicating,
}: {
  slideshow: SlideshowSummaryResponse
  onDelete: (slideshow: SlideshowSummaryResponse) => void
  onDuplicate: (slideshow: SlideshowSummaryResponse) => void
  isDuplicating: boolean
}) {
  const preset = getAspectRatioPreset(slideshow.aspectRatioId)
  const href = `/dashboard/studio/slideshows/${slideshow.id}`
  const aspectRatio = slideshow.canvas.width / slideshow.canvas.height

  return (
    <article className="group/card relative">
      <Link href={href} className="block focus-visible:outline-none">
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-xl bg-black ring-1 ring-border/60',
            'transition-[box-shadow,ring-color] duration-200',
            'group-hover/card:ring-border group-hover/card:shadow-md',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
          style={{ aspectRatio }}
        >
          <SlideshowCardPreview slide={slideshow.previewSlide} canvas={slideshow.canvas} />

          <SlideshowCardStoryBars slideCount={slideshow.slideCount} />
          <SlideshowCardSlideBadge slideCount={slideshow.slideCount} />

          <span className="pointer-events-none absolute top-2 left-2 z-20 inline-flex items-center gap-1 rounded-full bg-black/45 py-1 pr-2 pl-1 text-[10px] font-medium text-white backdrop-blur-sm">
            <PlatformIcon platform={preset.platform} size={12} className="size-4 rounded-full" />
            {preset.platform}
          </span>
        </div>
      </Link>

      <div className="mt-2.5 space-y-1.5 px-0.5">
        <Link href={href} className="block min-w-0 focus-visible:underline focus-visible:outline-none">
          <h2 className="truncate text-sm font-medium leading-snug tracking-tight">{slideshow.name}</h2>
        </Link>

        <div className="flex items-center gap-2 text-[11px] tabular-nums text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <LayersIcon className="size-3" strokeWidth={1.75} />
            {slideshow.slideCount}
          </span>
          <span className="text-border">·</span>
          <span className="truncate">{preset.label}</span>
          <span className="text-border">·</span>
          <span className="shrink-0">{formatRelativeTime(slideshow.updatedAt)}</span>
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
              aria-label={`Duplicate ${slideshow.name}`}
              disabled={isDuplicating}
              onClick={event => {
                event.preventDefault()
                event.stopPropagation()
                onDuplicate(slideshow)
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
              aria-label={`Delete ${slideshow.name}`}
              onClick={event => {
                event.preventDefault()
                event.stopPropagation()
                onDelete(slideshow)
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

export function SlideshowList() {
  const workspace = useWorkspaceStore(s => s.currentWorkspace)
  const workspaceId = getWorkspaceId(workspace)
  const [slideshows, setSlideshows] = useState<SlideshowSummaryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SlideshowSummaryResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)

  const loadSlideshows = useCallback(async () => {
    if (!workspaceId) {
      setSlideshows([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const response = await getWorkspaceSlideshows(workspaceId, 'draft')
    if (!response.success || !response.data) {
      setError(response.message ?? 'Failed to load slideshows')
      setSlideshows([])
      setIsLoading(false)
      return
    }

    setSlideshows(response.data.slideshows)
    setIsLoading(false)
  }, [workspaceId])

  useEffect(() => {
    void loadSlideshows()
  }, [loadSlideshows])

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)

    const response = await deleteSlideshow(deleteTarget.id)
    setIsDeleting(false)

    if (!response.success) {
      toast.error(response.message ?? 'Failed to delete slideshow')
      return
    }

    toast.success('Slideshow deleted')
    setDeleteTarget(null)
    void loadSlideshows()
  }

  const handleDuplicate = async (slideshow: SlideshowSummaryResponse) => {
    if (duplicatingId) return
    setDuplicatingId(slideshow.id)

    const response = await duplicateSlideshow(slideshow.id)
    setDuplicatingId(null)

    if (!response.success || !response.data?.slideshow) {
      toast.error(response.message ?? 'Failed to duplicate slideshow')
      return
    }

    toast.success(`Duplicated as “${response.data.slideshow.name}”`)
    void loadSlideshows()
  }

  if (!workspace) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Select a workspace to view slideshows.
      </div>
    )
  }

  const draftCount = slideshows.length

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-1">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-base font-semibold tracking-tight">Slideshows</h1>
          <p className="truncate text-xs text-muted-foreground">
            {isLoading ? 'Loading drafts…' : `${draftCount} draft${draftCount === 1 ? '' : 's'} in ${workspace.name}`}
          </p>
        </div>
        <Button size="sm" className="h-8 shrink-0 rounded-full px-3.5" asChild>
          <Link href="/dashboard/studio/slideshows/create">
            <PlusIcon className="size-3.5" />
            Create
          </Link>
        </Button>
      </header>

      {isLoading ? (
        <LoadingState message="Loading slideshows…" className="flex-1" />
      ) : error ? (
        <ErrorState
          title={error}
          description="Try again or refresh the page."
          className="flex-1"
          action={
            <Button size="sm" variant="outline" onClick={() => void loadSlideshows()}>
              Retry
            </Button>
          }
        />
      ) : slideshows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 px-6 py-16 text-center">
          <span className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-muted">
            <ImagesIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
          </span>
          <p className="text-sm font-semibold tracking-tight">Start your first slideshow</p>
          <p className="mt-1.5 max-w-[18rem] text-xs leading-relaxed text-muted-foreground">
            Build carousel posts for Instagram, TikTok, and more — then save drafts here.
          </p>
          <Button size="sm" className="mt-5 h-8 rounded-full px-4" asChild>
            <Link href="/dashboard/studio/slideshows/create">
              <PlusIcon className="size-3.5" />
              Create slideshow
            </Link>
          </Button>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {slideshows.map(slideshow => (
              <SlideshowCard
                key={slideshow.id}
                slideshow={slideshow}
                onDelete={setDeleteTarget}
                onDuplicate={slideshow => void handleDuplicate(slideshow)}
                isDuplicating={duplicatingId === slideshow.id}
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
        title="Delete slideshow?"
        description={
          deleteTarget
            ? `“${deleteTarget.name}” will be permanently removed. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete slideshow"
        isDeleting={isDeleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}
