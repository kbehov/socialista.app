'use client'

import {
  SlideshowCardPreview,
  SlideshowCardStoryBars,
} from '@/components/carousel/slideshow-card-preview'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { ErrorState } from '@/components/common/error-state'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { getAspectRatioPreset } from '@/lib/carousel/aspect-ratios'
import { cn } from '@/lib/utils'
import { deleteSlideshow, duplicateSlideshow, getWorkspaceSlideshows } from '@/services/slideshow.service'
import { getProjectId, useProjectStore } from '@/store/project.store'
import { formatRelativeTime } from '@/utils/format'
import type { SlideshowSummaryResponse } from '@socialista/types'
import { ArrowRightIcon, CopyIcon, Loader2Icon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
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
  const stacked = slideshow.slideCount > 1

  return (
    <article className="group/card relative">
      <div className={cn('relative', stacked && 'pr-1.5 pb-1.5')}>
        {stacked ? (
          <span
            aria-hidden
            className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-xl bg-black/[0.04] ring-1 ring-black/8 dark:bg-white/[0.05] dark:ring-white/10"
          />
        ) : null}

        <div className="relative z-10">
          <Link
            href={href}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div
              className={cn(
                'relative w-full overflow-hidden rounded-xl bg-black ring-1 ring-black/10',
                'transition-[box-shadow,ring-color] duration-200',
                'group-hover/card:ring-black/18 group-hover/card:shadow-[0_10px_24px_-16px_rgba(0,0,0,0.45)]',
                'dark:ring-white/12 dark:group-hover/card:ring-white/20',
              )}
              style={{ aspectRatio }}
            >
              <SlideshowCardPreview slide={slideshow.previewSlide} canvas={slideshow.canvas} />
              <SlideshowCardStoryBars slideCount={slideshow.slideCount} />
            </div>
          </Link>

          <div className="absolute top-2 right-2 z-30 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover/card:opacity-100 group-focus-within/card:opacity-100">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  className="size-7 rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white"
                  aria-label={`Duplicate ${slideshow.name}`}
                  disabled={isDuplicating}
                  onClick={event => {
                    event.preventDefault()
                    event.stopPropagation()
                    onDuplicate(slideshow)
                  }}
                >
                  {isDuplicating ? (
                    <Loader2Icon className="size-3.5 animate-spin" />
                  ) : (
                    <CopyIcon className="size-3.5" />
                  )}
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
                  className="size-7 rounded-full bg-black/45 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white"
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
      </div>

      <div className="mt-2.5 space-y-1 px-0.5">
        <Link href={href} className="block min-w-0 focus-visible:underline focus-visible:outline-none">
          <h3 className="truncate text-[13px] font-medium leading-snug tracking-[-0.015em] text-foreground">
            {slideshow.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 text-[11px] tabular-nums tracking-[-0.01em] text-black/44 dark:text-white/44">
          <span>{slideshow.slideCount === 1 ? '1 page' : `${slideshow.slideCount} pages`}</span>
          <span aria-hidden className="text-black/16 dark:text-white/16">
            ·
          </span>
          <span className="truncate">{preset.label}</span>
          <span aria-hidden className="text-black/16 dark:text-white/16">
            ·
          </span>
          <span className="shrink-0">{formatRelativeTime(slideshow.updatedAt)}</span>
        </div>
      </div>
    </article>
  )
}

function SlideshowCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] w-full rounded-xl bg-black/[0.04] ring-1 ring-black/8 dark:bg-white/[0.04] dark:ring-white/10" />
      <div className="mt-2.5 space-y-1.5 px-0.5">
        <div className="h-3.5 w-3/4 rounded-md bg-black/[0.06] dark:bg-white/[0.06]" />
        <div className="h-2.5 w-1/2 rounded-md bg-black/[0.04] dark:bg-white/[0.04]" />
      </div>
    </div>
  )
}

type SlideshowListProps = {
  workspaceId: string
  initialSlideshows: SlideshowSummaryResponse[]
  initialError?: string | null
}

export function SlideshowList({
  workspaceId,
  initialSlideshows,
  initialError = null,
}: SlideshowListProps) {
  const router = useRouter()
  const projectId = useProjectStore(s => getProjectId(s.currentProject))
  const [slideshows, setSlideshows] = useState(initialSlideshows)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  const [deleteTarget, setDeleteTarget] = useState<SlideshowSummaryResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const skipInitialSync = useRef(true)

  useEffect(() => {
    if (skipInitialSync.current) {
      skipInitialSync.current = false
      return
    }
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

  if (!error && slideshows.length === 0 && !isLoading) {
    return null
  }

  return (
    <section
      className="mx-auto w-full max-w-5xl px-4 pb-[max(4rem,calc(env(safe-area-inset-bottom,0px)+3rem))] sm:px-6 lg:px-8"
      aria-labelledby="recent-slideshows-heading"
    >
      <div className="mb-3.5 flex items-end justify-between gap-3">
        <h2
          id="recent-slideshows-heading"
          className="text-[13px] font-medium tracking-[-0.015em] text-foreground/80"
        >
          Recent carousels
        </h2>
        <div className="flex items-center gap-3">
          {isLoading ? (
            <Loader2Icon className="size-3.5 animate-spin text-black/36 dark:text-white/36" />
          ) : null}
          <Link
            href={DASHBOARD_ROUTES.STUDIO.SLIDESHOW_CREATE}
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
            <Button size="sm" variant="outline" onClick={() => void loadSlideshows()}>
              Retry
            </Button>
          }
        />
      ) : isLoading && slideshows.length === 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <SlideshowCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            'grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4',
            isLoading && 'opacity-60',
          )}
        >
          {slideshows.map(slideshow => (
            <SlideshowCard
              key={slideshow.id}
              slideshow={slideshow}
              onDelete={setDeleteTarget}
              onDuplicate={item => void handleDuplicate(item)}
              isDuplicating={duplicatingId === slideshow.id}
            />
          ))}
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
    </section>
  )
}
