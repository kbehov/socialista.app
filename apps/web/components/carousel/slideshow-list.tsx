'use client'

import {
  SlideshowCardPreview,
  SlideshowCardStoryBars,
} from '@/components/carousel/slideshow-card-preview'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { ErrorState } from '@/components/common/error-state'
import { LoadingState } from '@/components/common/loading-state'
import { dashboardSurface } from '@/components/dashboard'
import { PageHeader } from '@/components/headers/page-header'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { getAspectRatioPreset } from '@/lib/carousel/aspect-ratios'
import { cn } from '@/lib/utils'
import { deleteSlideshow, duplicateSlideshow, getWorkspaceSlideshows } from '@/services/slideshow.service'
import { getProjectId, useProjectStore } from '@/store/project.store'
import { formatRelativeTime } from '@/utils/format'
import type { SlideshowSummaryResponse } from '@socialista/types'
import { CopyIcon, ImagesIcon, Loader2Icon, PlusIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

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
  const href = DASHBOARD_ROUTES.STUDIO.slideshow(slideshow.id)
  const aspectRatio = slideshow.canvas.width / slideshow.canvas.height

  return (
    <article className="group/card">
      <div className="relative">
        <Link href={href} className="block focus-visible:outline-none">
          <div
            className={cn(
              'relative w-full overflow-hidden rounded-lg bg-black ring-1 ring-border/50',
              'group-hover/card:ring-border',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
            style={{ aspectRatio }}
          >
            <SlideshowCardPreview slide={slideshow.previewSlide} canvas={slideshow.canvas} />
            <SlideshowCardStoryBars slideCount={slideshow.slideCount} />
          </div>
        </Link>

        <div className="absolute right-2 bottom-2 z-30 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover/card:opacity-100 group-focus-within/card:opacity-100">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              className="size-8 rounded-full bg-black/50 text-white hover:bg-black/65 hover:text-white"
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
              className="size-8 rounded-full bg-black/50 text-white hover:bg-black/65 hover:text-white"
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
      </div>

      <div className="mt-2 space-y-1 px-0.5">
        <Link href={href} className="block min-w-0 focus-visible:underline focus-visible:outline-none">
          <h2 className="truncate text-sm font-medium leading-snug tracking-tight">{slideshow.name}</h2>
        </Link>

        <div className="flex items-center gap-1.5 text-[12px] tabular-nums text-muted-foreground">
          <span>{slideshow.slideCount === 1 ? '1 page' : `${slideshow.slideCount} pages`}</span>
          <span aria-hidden className="text-border">
            ·
          </span>
          <span className="truncate">{preset.label}</span>
          <span aria-hidden className="text-border">
            ·
          </span>
          <span className="shrink-0">{formatRelativeTime(slideshow.updatedAt)}</span>
        </div>
      </div>
    </article>
  )
}

type SlideshowListProps = {
  workspaceId: string
  workspaceName: string
  initialSlideshows: SlideshowSummaryResponse[]
  initialError?: string | null
  composer?: ReactNode
}

export function SlideshowList({
  workspaceId,
  workspaceName,
  initialSlideshows,
  initialError = null,
  composer,
}: SlideshowListProps) {
  const router = useRouter()
  const projectId = useProjectStore(s => getProjectId(s.currentProject))
  const [slideshows, setSlideshows] = useState(initialSlideshows)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  const [deleteTarget, setDeleteTarget] = useState<SlideshowSummaryResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)

  useEffect(() => {
    setSlideshows(initialSlideshows)
    setError(initialError)
  }, [initialSlideshows, initialError])

  const loadSlideshows = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const response = await getWorkspaceSlideshows(workspaceId, 'draft', { projectId })
    if (!response.success || !response.data) {
      setError(response.message ?? 'Failed to load slideshows')
      setSlideshows([])
      setIsLoading(false)
      return
    }

    setSlideshows(response.data.slideshows)
    setIsLoading(false)
  }, [workspaceId, projectId])

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
    router.refresh()
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
    router.refresh()
  }

  const draftCount = slideshows.length
  const createAction = (
    <Button asChild size="sm" className={dashboardSurface.createCta}>
      <Link href={DASHBOARD_ROUTES.STUDIO.SLIDESHOW_CREATE}>
        <PlusIcon className="size-4" strokeWidth={1.75} />
        Create slideshow
      </Link>
    </Button>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Slideshows"
        description={
          isLoading
            ? 'Loading drafts…'
            : `${draftCount === 1 ? '1 slideshow' : `${draftCount.toLocaleString()} slideshows`} in ${workspaceName}`
        }
        actions={createAction}
      />

      {composer ? <div className="shrink-0 pb-5">{composer}</div> : null}

      {isLoading ? (
        <LoadingState message="Loading slideshows…" className="flex-1" />
      ) : error ? (
        <ErrorState
          title={error}
          description="Try again or refresh the page."
          className="flex-1 rounded-xl"
          action={
            <Button size="sm" variant="outline" onClick={() => void loadSlideshows()}>
              Retry
            </Button>
          }
        />
      ) : slideshows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-sm">
            <span className={cn('flex items-center justify-center', dashboardSurface.emptyIcon)}>
              <ImagesIcon className="text-muted-foreground" strokeWidth={1.5} />
            </span>
            <p className="mt-4 text-sm font-medium tracking-tight">Start your first slideshow</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Build carousel posts for Instagram, TikTok, and more — then save drafts here.
            </p>
            <div className="mt-5">{createAction}</div>
          </div>
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
          deleteTarget ? `“${deleteTarget.name}” will be permanently removed. This action cannot be undone.` : ''
        }
        confirmLabel="Delete slideshow"
        isDeleting={isDeleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}
