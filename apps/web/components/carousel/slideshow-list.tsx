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
import { SLIDESHOW_LIST_PAGE_SIZE } from '@/constants/studio'
import { cn } from '@/lib/utils'
import { deleteSlideshow, duplicateSlideshow, getWorkspaceSlideshows } from '@/services/slideshow.service'
import { getProjectId, useProjectStore } from '@/store/project.store'
import { formatRelativeTime } from '@/utils/format'
import type { SlideshowSummaryResponse } from '@socialista/types'
import { ArrowRightIcon, CopyIcon, Loader2Icon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { toast } from 'sonner'

const SCROLL_TARGET_ID = 'dashboard-scroll'

function ScrollLoader() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2Icon className="size-3.5 animate-spin text-black/36 dark:text-white/36" />
    </div>
  )
}

const CARD_ACTION_CLASS = cn(
  'size-8 rounded-full border-0 bg-black/55 text-white shadow-none backdrop-blur-md',
  'hover:bg-black/75 hover:text-white',
  'transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
  'active:scale-[0.96] motion-reduce:active:scale-100',
)

const MASONRY_GAP_CLASS = 'flex items-start gap-3'

function masonryColumnCount(width: number) {
  if (width >= 1024) return 4
  if (width >= 640) return 3
  return 2
}

function useMasonryColumnCount() {
  const [count, setCount] = useState(2)

  useEffect(() => {
    const update = () => setCount(masonryColumnCount(window.innerWidth))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return count
}

function toColumns<T>(items: readonly T[], count: number) {
  const columns: T[][] = Array.from({ length: count }, () => [])
  for (let index = 0; index < items.length; index++) {
    columns[index % count].push(items[index]!)
  }
  return columns
}

const SKELETON_RATIOS = ['3 / 4', '1 / 1', '4 / 5', '9 / 16'] as const

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
  const href = DASHBOARD_ROUTES.STUDIO.slideshow(slideshow.id)
  const aspectRatio = slideshow.canvas.width / slideshow.canvas.height
  const pageLabel = slideshow.slideCount === 1 ? '1 page' : `${slideshow.slideCount} pages`

  return (
    <article className="group/card">
      <div className="relative">
        <Link
          href={href}
          aria-label={`${slideshow.name}, ${pageLabel}`}
          className={cn(
            'block overflow-hidden rounded-2xl bg-black outline outline-1 -outline-offset-1 outline-black/10',
            'transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
            'active:scale-[0.96] motion-reduce:active:scale-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
            'dark:outline-white/10',
          )}
        >
          <div className="relative w-full" style={{ aspectRatio }}>
            <div className="size-full origin-center transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] pointer-fine:group-hover/card:scale-[1.02] motion-reduce:transition-none motion-reduce:pointer-fine:group-hover/card:scale-100">
              <SlideshowCardPreview slide={slideshow.previewSlide} canvas={slideshow.canvas} />
            </div>
            <SlideshowCardStoryBars slideCount={slideshow.slideCount} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/75 via-black/35 to-transparent px-3 pt-10 pb-2.5">
              <p className="truncate text-[13px] font-medium leading-snug tracking-[-0.015em] text-white">
                {slideshow.name}
              </p>
              <p className="mt-0.5 truncate text-[11px] tabular-nums tracking-[-0.01em] text-white/72">
                {pageLabel}
                <span aria-hidden> · </span>
                {formatRelativeTime(slideshow.updatedAt)}
              </p>
            </div>
          </div>
        </Link>

        <div
          className={cn(
            'absolute top-5 right-2.5 z-30 flex items-center gap-1',
            'transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
            'pointer-fine:translate-y-0.5 pointer-fine:opacity-0',
            'pointer-fine:group-hover/card:translate-y-0 pointer-fine:group-hover/card:opacity-100',
            'pointer-fine:group-focus-within/card:translate-y-0 pointer-fine:group-focus-within/card:opacity-100',
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                className={CARD_ACTION_CLASS}
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
                  <CopyIcon className="size-3.5" strokeWidth={1.75} />
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
                className={CARD_ACTION_CLASS}
                aria-label={`Delete ${slideshow.name}`}
                onClick={event => {
                  event.preventDefault()
                  event.stopPropagation()
                  onDelete(slideshow)
                }}
              >
                <Trash2Icon className="size-3.5" strokeWidth={1.75} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Delete</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </article>
  )
}

function SlideshowCardSkeleton({ ratio }: { ratio: string }) {
  return (
    <div
      className="animate-pulse rounded-2xl bg-black/[0.04] outline outline-1 -outline-offset-1 outline-black/10 dark:bg-white/[0.04] dark:outline-white/10"
      style={{ aspectRatio: ratio }}
    />
  )
}

type SlideshowListProps = {
  workspaceId: string
  initialSlideshows: SlideshowSummaryResponse[]
  initialError?: string | null
  initialHasMore?: boolean
}

export function SlideshowList({
  workspaceId,
  initialSlideshows,
  initialError = null,
  initialHasMore = false,
}: SlideshowListProps) {
  const projectId = useProjectStore(s => getProjectId(s.currentProject))
  const [slideshows, setSlideshows] = useState(initialSlideshows)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  const [deleteTarget, setDeleteTarget] = useState<SlideshowSummaryResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const skipInitialSync = useRef(true)
  const requestIdRef = useRef(0)
  const loadingMoreRef = useRef(false)
  const columnCount = useMasonryColumnCount()

  useEffect(() => {
    if (skipInitialSync.current) {
      skipInitialSync.current = false
      return
    }
    setSlideshows(initialSlideshows)
    setError(initialError)
    setPage(1)
    setHasMore(initialHasMore)
  }, [initialSlideshows, initialError, initialHasMore])

  const fetchPage = useCallback(
    async (nextPage: number, append: boolean) => {
      const requestId = ++requestIdRef.current
      const response = await getWorkspaceSlideshows(workspaceId, {
        status: 'draft',
        page: nextPage,
        limit: SLIDESHOW_LIST_PAGE_SIZE,
        projectId,
      })

      if (requestId !== requestIdRef.current) return

      if (!response.success || !response.data) {
        const message = response.message ?? 'Failed to load slideshows'
        if (append) {
          toast.error(message)
          return
        }
        setError(message)
        setSlideshows([])
        setHasMore(false)
        return
      }

      const nextSlideshows = response.data.slideshows
      setError(null)
      setSlideshows(current => (append ? [...current, ...nextSlideshows] : nextSlideshows))
      setPage(nextPage)
      setHasMore(Boolean(response.meta?.hasNextPage))
    },
    [workspaceId, projectId],
  )

  const loadSlideshows = useCallback(async () => {
    setIsLoading(true)
    await fetchPage(1, false)
    setIsLoading(false)
  }, [fetchPage])

  const handleLoadMore = () => {
    if (isLoading || loadingMoreRef.current || !hasMore) return
    loadingMoreRef.current = true
    void fetchPage(page + 1, true).finally(() => {
      loadingMoreRef.current = false
    })
  }

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)

    const response = await deleteSlideshow(deleteTarget.id)
    setIsDeleting(false)

    if (!response.success) {
      toast.error(response.message ?? 'Failed to delete slideshow')
      return
    }

    const deletedId = deleteTarget.id
    setSlideshows(current => current.filter(slideshow => slideshow.id !== deletedId))
    setDeleteTarget(null)
    toast.success('Slideshow deleted')
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
    await fetchPage(1, false)
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
          className="text-[13px] font-medium leading-none tracking-[-0.011em] text-black/56 dark:text-white/56"
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
        <div className={MASONRY_GAP_CLASS}>
          {toColumns(SKELETON_RATIOS, columnCount).map((column, columnIndex) => (
            <div key={columnIndex} className="flex min-w-0 flex-1 flex-col gap-3">
              {column.map(ratio => (
                <SlideshowCardSkeleton key={ratio} ratio={ratio} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <InfiniteScroll
          dataLength={slideshows.length}
          next={handleLoadMore}
          hasMore={hasMore}
          loader={<ScrollLoader />}
          scrollableTarget={SCROLL_TARGET_ID}
          scrollThreshold={0.9}
          className="!overflow-visible"
          style={{ overflow: 'visible' }}
        >
          <div className={cn(MASONRY_GAP_CLASS, isLoading && 'opacity-60')}>
            {toColumns(slideshows, columnCount).map((column, columnIndex) => (
              <div key={columnIndex} className="flex min-w-0 flex-1 flex-col gap-3">
                {column.map(slideshow => (
                  <SlideshowCard
                    key={slideshow.id}
                    slideshow={slideshow}
                    onDelete={setDeleteTarget}
                    onDuplicate={item => void handleDuplicate(item)}
                    isDuplicating={duplicatingId === slideshow.id}
                  />
                ))}
              </div>
            ))}
          </div>
        </InfiniteScroll>
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
