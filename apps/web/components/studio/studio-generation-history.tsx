'use client'

import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { getWorkspaceGenerations } from '@/services/generation.service'
import { getProjectId, useProjectStore } from '@/store/project.store'
import { useWorkspaceStore } from '@/store/workspace.store'
import type { Generation, GenerationKind } from '@socialista/types'
import { ImageIcon, LayoutTemplateIcon, Loader2Icon, VideoIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

const SCROLL_TARGET_ID = 'dashboard-scroll'
const PAGE_LIMIT = 24

const GRID_CLASS =
  'grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-3.5 sm:gap-y-7 lg:grid-cols-4 lg:gap-x-4'

const KIND_CONFIG: Record<
  'image' | 'video' | 'static-ad',
  {
    emptyTitle: string
    emptyDescription: string
    workspaceDescription: string
    defaultPromptLabel: string
    runHref: (runId: string) => string
    Icon: typeof ImageIcon
  }
> = {
  image: {
    emptyTitle: 'No images yet',
    emptyDescription: 'Describe your first image below — finished runs will show up here.',
    workspaceDescription: 'Choose a workspace to see your generated images.',
    defaultPromptLabel: 'Image generation',
    runHref: runId => DASHBOARD_ROUTES.STUDIO.imageRun(runId),
    Icon: ImageIcon,
  },
  video: {
    emptyTitle: 'No videos yet',
    emptyDescription: 'Describe your first video below — finished runs will show up here.',
    workspaceDescription: 'Choose a workspace to see your generated videos.',
    defaultPromptLabel: 'Video generation',
    runHref: runId => DASHBOARD_ROUTES.STUDIO.videoRun(runId),
    Icon: VideoIcon,
  },
  'static-ad': {
    emptyTitle: 'No static ads yet',
    emptyDescription: 'Describe your first ad below — finished runs will show up here.',
    workspaceDescription: 'Choose a workspace to see your generated static ads.',
    defaultPromptLabel: 'Static ad',
    runHref: runId => DASHBOARD_ROUTES.STUDIO.staticAdRun(runId),
    Icon: LayoutTemplateIcon,
  },
}

function ScrollLoader() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2Icon className="size-3.5 animate-spin text-black/36 dark:text-white/36" />
    </div>
  )
}

function HistoryTileSkeleton() {
  return (
    <div className="animate-pulse">
      <div
        className={cn(
          'aspect-[4/5] w-full rounded-xl bg-black/[0.04] dark:bg-white/[0.04]',
          'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.08)]',
        )}
      />
    </div>
  )
}

function RunningHistoryTile() {
  return (
    <div
      className={cn(
        'relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-xl',
        'bg-black/[0.04] ring-1 ring-black/8 dark:bg-white/[0.04] dark:ring-white/10',
      )}
    >
      <Loader2Icon className="size-5 animate-spin text-black/36 dark:text-white/36" />
    </div>
  )
}

function CompletedHistoryTile({
  generation,
  config,
}: {
  generation: Generation
  config: (typeof KIND_CONFIG)['image']
}) {
  const result = generation.result
  const previewUrl = result?.thumbnailUrl ?? result?.url
  if (!previewUrl) return null

  const extraCount = result?.urls?.length ?? 0
  const outputCount = 1 + extraCount
  const prompt =
    generation.prompt?.trim() || generation.enhancedPrompt?.trim() || config.defaultPromptLabel

  return (
    <Link
      href={config.runHref(generation.triggerRunId)}
      className={cn(
        'group/tile relative block aspect-[4/5] w-full overflow-hidden rounded-xl',
        'bg-black/[0.04] ring-1 ring-black/8 dark:bg-white/[0.04] dark:ring-white/10',
        'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.06)]',
        'transition-[box-shadow,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)]',
        'hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.08)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
        'active:scale-[0.98] motion-reduce:active:scale-100',
      )}
    >
      <Image src={previewUrl} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
      {outputCount > 1 ? (
        <span
          className={cn(
            'absolute right-2 top-2 z-10 rounded-md px-1.5 py-0.5',
            'bg-black/55 text-[10px] font-medium tabular-nums tracking-[-0.01em] text-white backdrop-blur-sm',
          )}
        >
          {outputCount}
        </span>
      ) : null}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/55 via-black/25 to-transparent',
          'h-20 opacity-0 transition-opacity duration-200',
          'group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100',
        )}
      />
      <p
        className={cn(
          'pointer-events-none absolute inset-x-2.5 bottom-2.5 z-10 line-clamp-2',
          'text-[11px] font-medium leading-snug tracking-[-0.015em] text-white',
          'opacity-0 transition-opacity duration-200',
          'group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100',
        )}
      >
        {prompt}
      </p>
    </Link>
  )
}

function historyTileForGeneration(generation: Generation, config: (typeof KIND_CONFIG)['image']) {
  if (generation.status === 'failed') return null
  if (generation.status === 'running') {
    return <RunningHistoryTile key={generation._id} />
  }
  if (generation.status === 'completed' && (generation.result?.thumbnailUrl ?? generation.result?.url)) {
    return <CompletedHistoryTile key={generation._id} generation={generation} config={config} />
  }
  return null
}

export type StudioGenerationHistoryProps = {
  kind: Extract<GenerationKind, 'image' | 'video' | 'static-ad'>
  onTotalChange?: (total: number) => void
  scrollTargetId?: string
}

export function StudioGenerationHistory({
  kind,
  onTotalChange,
  scrollTargetId = SCROLL_TARGET_ID,
}: StudioGenerationHistoryProps) {
  const config = KIND_CONFIG[kind]
  const workspaceId = useWorkspaceStore(s => s.currentWorkspace?._id)
  const projectId = useProjectStore(s => getProjectId(s.currentProject))
  const [generations, setGenerations] = useState<Generation[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [loadingMore, setLoadingMore] = useState(false)
  const requestIdRef = useRef(0)

  const fetchPage = useCallback(
    async (nextPage: number, append: boolean) => {
      if (!workspaceId) return
      const requestId = ++requestIdRef.current
      const response = await getWorkspaceGenerations(workspaceId, {
        kind,
        page: nextPage,
        limit: PAGE_LIMIT,
        sort: '-createdAt',
        ...(projectId ? { projectId } : {}),
      })

      if (requestId !== requestIdRef.current) return

      if (!response.success || !response.data) {
        setError(response.message ?? 'Failed to load history.')
        if (!append) setGenerations([])
        return
      }

      const nextGenerations = response.data.generations
      const nextHasMore = Boolean(response.meta?.hasNextPage)
      const total = response.meta?.total ?? nextGenerations.length
      setError(null)
      setGenerations(current => (append ? [...current, ...nextGenerations] : nextGenerations))
      setPage(nextPage)
      setHasMore(nextHasMore)
      onTotalChange?.(total)
    },
    [workspaceId, projectId, onTotalChange, kind],
  )

  useEffect(() => {
    if (!workspaceId) return
    startTransition(async () => {
      await fetchPage(1, false)
    })
  }, [workspaceId, projectId, fetchPage, onTotalChange])

  const handleLoadMore = () => {
    if (loadingMore || pending || !hasMore) return
    setLoadingMore(true)
    void fetchPage(page + 1, true).finally(() => setLoadingMore(false))
  }

  const retry = () => {
    startTransition(async () => {
      await fetchPage(1, false)
    })
  }

  if (!workspaceId) {
    return (
      <EmptyState
        icon={config.Icon}
        title="Select a workspace"
        description={config.workspaceDescription}
        variant="ghost"
        minHeight="sm"
      />
    )
  }

  const visibleTiles = generations.map(g => historyTileForGeneration(g, config)).filter(Boolean)

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

      {!error && visibleTiles.length === 0 && !pending ? (
        <EmptyState
          icon={config.Icon}
          title={config.emptyTitle}
          description={config.emptyDescription}
          variant="ghost"
          minHeight="sm"
        />
      ) : null}

      {pending && generations.length === 0 ? (
        <div className={GRID_CLASS}>
          {Array.from({ length: 8 }, (_, index) => (
            <HistoryTileSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {visibleTiles.length > 0 ? (
        <InfiniteScroll
          dataLength={generations.length}
          next={handleLoadMore}
          hasMore={hasMore}
          loader={<ScrollLoader />}
          scrollableTarget={scrollTargetId}
          scrollThreshold={0.9}
          className="overflow-visible!"
          style={{ overflow: 'visible' }}
        >
          <div className={cn(GRID_CLASS, pending && generations.length > 0 && 'opacity-60')}>
            {visibleTiles}
          </div>
        </InfiniteScroll>
      ) : null}
    </div>
  )
}
