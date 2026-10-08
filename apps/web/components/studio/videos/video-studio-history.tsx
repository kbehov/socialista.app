'use client'

import { VideoCardPreview } from '@/components/cards/video-card-preview'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { VIDEO_LIST_PAGE_SIZE } from '@/constants/studio'
import { cn } from '@/lib/utils'
import { getWorkspaceGenerations } from '@/services/generation.service'
import { getWorkspaceVideos } from '@/services/video.service'
import { getProjectId, useProjectStore } from '@/store/project.store'
import { useWorkspaceStore } from '@/store/workspace.store'
import type { Generation, VideoSummaryResponse } from '@socialista/types'
import { ClapperboardIcon, Loader2Icon } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

const DEFAULT_SCROLL_TARGET_ID = 'dashboard-scroll'

const GRID_CLASS =
  'grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-3.5 sm:gap-y-7 lg:grid-cols-4 lg:gap-x-4'

function ScrollLoader() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2Icon className="size-3.5 animate-spin text-black/36 dark:text-white/36" />
    </div>
  )
}

function VideoTileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[9/16] w-full rounded-xl bg-black/[0.04] dark:bg-white/[0.04]" />
      <div className="mt-2.5 h-3.5 w-3/4 rounded-md bg-black/[0.06] dark:bg-white/[0.06]" />
    </div>
  )
}

function RunningGenerationTile({ generation }: { generation: Generation }) {
  const label =
    generation.prompt?.trim() || generation.enhancedPrompt?.trim() || 'Generating video…'

  return (
    <div className="flex flex-col gap-2.5">
      <div
        className={cn(
          'relative flex aspect-[9/16] w-full items-center justify-center overflow-hidden rounded-xl',
          'bg-black/[0.04] ring-1 ring-black/8 dark:bg-white/[0.04] dark:ring-white/10',
        )}
      >
        <Loader2Icon className="size-5 animate-spin text-black/36 dark:text-white/36" />
      </div>
      <p className="line-clamp-2 px-0.5 text-[12px] font-medium leading-snug tracking-[-0.015em] text-foreground/72">
        {label}
      </p>
    </div>
  )
}

function VideoHistoryTile({ video }: { video: VideoSummaryResponse }) {
  const href = DASHBOARD_ROUTES.STUDIO.video(video.id)
  const aspectRatio = video.resolution.width / video.resolution.height

  return (
    <article className="group/tile">
      <Link
        href={href}
        className={cn(
          'relative block w-full overflow-hidden rounded-xl ring-1 ring-black/8 dark:ring-white/10',
          'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.06)]',
          'transition-[box-shadow,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
          'hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.08)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
          'active:scale-[0.98] motion-reduce:active:scale-100',
        )}
        style={{ aspectRatio }}
      >
        <VideoCardPreview previewUrl={video.previewUrl} previewType={video.previewType} />
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 via-black/25 to-transparent',
            'h-16 opacity-0 transition-opacity duration-200',
            'group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100',
          )}
        />
        <p
          className={cn(
            'pointer-events-none absolute inset-x-2.5 bottom-2 z-10 line-clamp-2',
            'text-[11px] font-medium leading-snug tracking-[-0.015em] text-white',
            'opacity-0 transition-opacity duration-200',
            'group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100',
          )}
        >
          {video.name}
        </p>
        {video.duration > 0 ? (
          <span
            className={cn(
              'absolute right-2 top-2 z-10 rounded-md px-1.5 py-0.5',
              'bg-black/55 text-[10px] font-medium tabular-nums tracking-[-0.01em] text-white backdrop-blur-sm',
            )}
          >
            {video.duration.toFixed(1)}s
          </span>
        ) : null}
      </Link>
      <Link
        href={href}
        className="mt-2.5 block min-w-0 px-0.5 focus-visible:underline focus-visible:outline-none"
      >
        <p className="truncate text-[12px] font-medium leading-snug tracking-[-0.015em] text-foreground">
          {video.name}
        </p>
      </Link>
    </article>
  )
}

type VideoStudioHistoryProps = {
  initialVideos?: VideoSummaryResponse[]
  initialError?: string | null
  initialHasMore?: boolean
  initialTotal?: number
  onTotalChange?: (total: number) => void
  scrollTargetId?: string
}

export function VideoStudioHistory({
  initialVideos = [],
  initialError = null,
  initialHasMore = false,
  initialTotal,
  onTotalChange,
  scrollTargetId = DEFAULT_SCROLL_TARGET_ID,
}: VideoStudioHistoryProps) {
  const workspaceId = useWorkspaceStore(s => s.currentWorkspace?._id)
  const projectId = useProjectStore(s => getProjectId(s.currentProject))
  const [videos, setVideos] = useState(initialVideos)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [videoTotal, setVideoTotal] = useState(initialTotal ?? initialVideos.length)
  const [runningGenerations, setRunningGenerations] = useState<Generation[]>([])
  const [error, setError] = useState<string | null>(initialError)
  const [pending, startTransition] = useTransition()
  const [loadingMore, setLoadingMore] = useState(false)
  const requestIdRef = useRef(0)
  const generationRequestIdRef = useRef(0)

  const fetchRunningGenerations = useCallback(async () => {
    if (!workspaceId) {
      setRunningGenerations([])
      return
    }
    const requestId = ++generationRequestIdRef.current
    const response = await getWorkspaceGenerations(workspaceId, {
      kind: 'video',
      status: 'running',
      page: 1,
      limit: 20,
      sort: '-createdAt',
      ...(projectId ? { projectId } : {}),
    })
    if (requestId !== generationRequestIdRef.current) return
    if (!response.success || !response.data) return
    setRunningGenerations(response.data.generations)
  }, [workspaceId, projectId])

  const fetchVideosPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (!workspaceId) return
      const requestId = ++requestIdRef.current
      const response = await getWorkspaceVideos(workspaceId, {
        page: nextPage,
        limit: VIDEO_LIST_PAGE_SIZE,
        sort: '-updatedAt',
        ...(projectId ? { projectId } : {}),
      })

      if (requestId !== requestIdRef.current) return

      if (!response.success || !response.data) {
        setError(response.message ?? 'Failed to load videos.')
        if (!append) setVideos([])
        return
      }

      const nextVideos = response.data.videos
      const nextHasMore = Boolean(response.meta?.hasNextPage)
      const total = response.meta?.total ?? nextVideos.length
      setError(null)
      setVideos(current => (append ? [...current, ...nextVideos] : nextVideos))
      setPage(nextPage)
      setHasMore(nextHasMore)
      setVideoTotal(total)
    },
    [workspaceId, projectId],
  )

  useEffect(() => {
    onTotalChange?.(videoTotal + runningGenerations.length)
  }, [videoTotal, runningGenerations.length, onTotalChange])

  useEffect(() => {
    if (!workspaceId) return
    startTransition(async () => {
      await Promise.all([fetchVideosPage(1, false), fetchRunningGenerations()])
    })
  }, [workspaceId, projectId, fetchVideosPage, fetchRunningGenerations])

  const handleLoadMore = () => {
    if (loadingMore || pending || !hasMore) return
    setLoadingMore(true)
    void fetchVideosPage(page + 1, true).finally(() => setLoadingMore(false))
  }

  const retry = () => {
    startTransition(async () => {
      await Promise.all([fetchVideosPage(1, false), fetchRunningGenerations()])
    })
  }

  if (!workspaceId) {
    return (
      <EmptyState
        icon={ClapperboardIcon}
        title="Select a workspace"
        description="Choose a workspace to see your videos."
        variant="ghost"
        minHeight="sm"
      />
    )
  }

  const hasContent = videos.length > 0 || runningGenerations.length > 0

  return (
    <div className="flex w-full flex-col">
      {error ? (
        <ErrorState
          title="Could not load history"
          description={error}
          action={
            <Button type="button" size="sm" variant="outline" onClick={retry}>
              Try again
            </Button>
          }
        />
      ) : null}

      {!error && !hasContent && !pending ? (
        <EmptyState
          icon={ClapperboardIcon}
          title="No videos yet"
          description="Describe your first video below — opens in the editor when ready."
          variant="ghost"
          minHeight="sm"
        />
      ) : null}

      {pending && !hasContent ? (
        <div className={GRID_CLASS}>
          {Array.from({ length: 8 }, (_, index) => (
            <VideoTileSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {hasContent ? (
        <InfiniteScroll
          dataLength={videos.length}
          next={handleLoadMore}
          hasMore={hasMore}
          loader={<ScrollLoader />}
          scrollableTarget={scrollTargetId}
          scrollThreshold={0.9}
          className="overflow-visible!"
          style={{ overflow: 'visible' }}
        >
          <div className={cn(GRID_CLASS, pending && videos.length > 0 && 'opacity-60')}>
            {runningGenerations.map(generation => (
              <RunningGenerationTile key={generation._id} generation={generation} />
            ))}
            {videos.map(video => (
              <VideoHistoryTile key={video.id} video={video} />
            ))}
          </div>
        </InfiniteScroll>
      ) : null}
    </div>
  )
}
