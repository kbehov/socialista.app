'use client'

import { VideoCard } from '@/components/cards/video-card'
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { ErrorState } from '@/components/common/error-state'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '@/components/ui/carousel'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useVideosList } from '@/hooks/use-videos-list'
import { cn } from '@/lib/utils'
import type { VideoSummaryResponse } from '@socialista/types'
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, Loader2Icon } from 'lucide-react'
import Link from 'next/link'

function RecentVideosCarouselNav() {
  const { canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useCarousel()

  if (!canScrollPrev && !canScrollNext) return null

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        aria-label="Scroll recent clips left"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-md',
          'text-black/44 dark:text-white/44',
          'transition-colors duration-150',
          'hover:bg-black/[0.05] hover:text-foreground dark:hover:bg-white/[0.08]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/45',
          'disabled:pointer-events-none disabled:opacity-30',
        )}
      >
        <ChevronLeftIcon className="size-3.5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="Scroll recent clips right"
        disabled={!canScrollNext}
        onClick={scrollNext}
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-md',
          'text-black/44 dark:text-white/44',
          'transition-colors duration-150',
          'hover:bg-black/[0.05] hover:text-foreground dark:hover:bg-white/[0.08]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/45',
          'disabled:pointer-events-none disabled:opacity-30',
        )}
      >
        <ChevronRightIcon className="size-3.5" strokeWidth={1.75} />
      </button>
    </div>
  )
}

type RecentVideosCarouselProps = {
  workspaceId: string
  initialVideos: VideoSummaryResponse[]
  initialError?: string | null
  initialHasMore?: boolean
}

export function RecentVideosCarousel({
  workspaceId,
  initialVideos,
  initialError = null,
  initialHasMore = false,
}: RecentVideosCarouselProps) {
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
  } = useVideosList({ workspaceId, initialVideos, initialError, initialHasMore })

  if (!error && videos.length === 0 && !isLoading) {
    return null
  }

  return (
    <>
      <Carousel
        className="w-full min-w-0"
        opts={{
          align: 'start',
          dragFree: true,
          containScroll: 'trimSnaps',
        }}
      >
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2
            id="recent-videos-heading"
            className="text-[13px] font-medium tracking-[-0.015em] text-foreground/80"
          >
            Recent clips
          </h2>
          <div className="flex items-center gap-3">
            {isLoading ? (
              <Loader2Icon className="size-3.5 animate-spin text-black/36 dark:text-white/36" />
            ) : null}
            <Link
              href={DASHBOARD_ROUTES.STUDIO.VIDEOS_ALL}
              className="inline-flex items-center gap-1 text-[12px] font-medium tracking-[-0.01em] text-black/44 transition-colors hover:text-foreground dark:text-white/44"
            >
              See all
              <ArrowRightIcon className="size-3" strokeWidth={1.75} />
            </Link>
            <RecentVideosCarouselNav />
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
          <div className={cn('relative pb-0.5', isLoading && 'opacity-60')}>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-background to-transparent"
            />
            <CarouselContent className="-ml-3 ml-0" aria-labelledby="recent-videos-heading">
              {videos.map(video => (
                <CarouselItem key={video.id} className="basis-[10.5rem] pl-3 sm:basis-[11.5rem]">
                  <VideoCard
                    video={video}
                    onDelete={setDeleteTarget}
                    onDuplicate={item => void handleDuplicate(item)}
                    isDuplicating={duplicatingId === video.id}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        )}
      </Carousel>

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
