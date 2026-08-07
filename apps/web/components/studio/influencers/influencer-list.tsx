'use client'

import { InfluencerCard } from '@/components/cards/influencer-card'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { dashboardSurface, DashboardSegment, DashboardSegmentButton } from '@/components/dashboard'
import { PageHeader } from '@/components/headers/page-header'
import { Filters, type Filter } from '@/components/reui/filters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import {
  buildInfluencerFilterFields,
  filtersToInfluencerQuery,
  hasActiveInfluencerFilters,
  INFLUENCER_LIST_LIMIT,
  sanitizeFiltersForTab,
  type InfluencerListTab,
} from '@/lib/studio/influencers/influencer-filters'
import { cn } from '@/lib/utils'
import {
  deleteInfluencer,
  exploreInfluencers,
  getWorkspaceInfluencers,
} from '@/services/influencer.service'
import type { ExploreInfluencersQuery, Influencer } from '@socialista/types'
import {
  CompassIcon,
  ListFilterIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  UserRoundIcon,
  XIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { toast } from 'sonner'

/** Matches `id` on dashboard `<main>` — same scroll root as files infinite scroll. */
const SCROLL_TARGET_ID = 'dashboard-scroll'

type TabCache = {
  influencers: Influencer[]
  page: number
  hasMore: boolean
  total: number
}

type InfluencerListProps = {
  workspaceId: string
  workspaceName: string
  initialInfluencers: Influencer[]
  initialError?: string | null
  initialHasMore?: boolean
  initialTotal?: number
}

export function InfluencerList({
  workspaceId,
  workspaceName,
  initialInfluencers,
  initialError = null,
  initialHasMore = false,
  initialTotal,
}: InfluencerListProps) {
  const [tab, setTab] = useState<InfluencerListTab>('mine')
  const [influencers, setInfluencers] = useState(initialInfluencers)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [total, setTotal] = useState(initialTotal ?? initialInfluencers.length)
  const [error, setError] = useState(initialError)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filter<string>[]>([])
  const deferredSearch = useDeferredValue(search)
  const [pending, startTransition] = useTransition()
  const [loadingMore, setLoadingMore] = useState(false)
  const skipInitialFetch = useRef(true)
  const requestIdRef = useRef(0)
  const loadingMoreRef = useRef(false)
  const pageRef = useRef(page)
  const hasMoreRef = useRef(hasMore)
  const cacheRef = useRef<Record<InfluencerListTab, TabCache>>({
    mine: {
      influencers: initialInfluencers,
      page: 1,
      hasMore: initialHasMore,
      total: initialTotal ?? initialInfluencers.length,
    },
    public: { influencers: [], page: 1, hasMore: true, total: 0 },
  })

  pageRef.current = page
  hasMoreRef.current = hasMore
  loadingMoreRef.current = loadingMore

  const filterFields = useMemo(
    () => buildInfluencerFilterFields({ includeStatus: tab === 'mine' }),
    [tab],
  )
  const hasFilters = hasActiveInfluencerFilters(filters)
  const filterQuery = useMemo(() => filtersToInfluencerQuery(filters), [filters])
  const activeFilterCount = filters.filter(f => f.values.length > 0).length

  const buildQuery = useCallback(
    (pageNum: number): ExploreInfluencersQuery => ({
      query: deferredSearch.trim() || undefined,
      sort: tab === 'public' ? 'popular' : 'newest',
      limit: INFLUENCER_LIST_LIMIT,
      page: pageNum,
      ...filterQuery,
    }),
    [deferredSearch, filterQuery, tab],
  )

  const fetchPage = useCallback(
    async (pageNum: number, mode: 'replace' | 'append', forTab: InfluencerListTab) => {
      const requestId = mode === 'replace' ? ++requestIdRef.current : requestIdRef.current
      const query = buildQuery(pageNum)

      const response =
        forTab === 'public'
          ? await exploreInfluencers(query)
          : await getWorkspaceInfluencers(workspaceId, query)

      if (requestId !== requestIdRef.current) return

      if (!response.success) {
        if (mode === 'replace') {
          setError(response.message ?? 'Failed to load influencers')
        } else {
          toast.error(response.message ?? 'Failed to load more')
        }
        return
      }

      const nextItems = response.data?.influencers ?? []
      const nextHasMore = Boolean(response.meta?.hasNextPage)
      const nextTotal =
        typeof response.meta?.total === 'number' ? response.meta.total : undefined

      setError(null)
      setPage(pageNum)
      setHasMore(nextHasMore)

      setInfluencers(prev => {
        const merged = mode === 'append' ? [...prev, ...nextItems] : nextItems
        const resolvedTotal =
          nextTotal ??
          (mode === 'append' ? Math.max(cacheRef.current[forTab].total, merged.length) : merged.length)

        cacheRef.current[forTab] = {
          influencers: merged,
          page: pageNum,
          hasMore: nextHasMore,
          total: resolvedTotal,
        }
        return merged
      })
      setTotal(cacheRef.current[forTab].total)
    },
    [buildQuery, workspaceId],
  )

  useEffect(() => {
    const query = deferredSearch.trim()
    const isPristineMine =
      tab === 'mine' && !query && !hasActiveInfluencerFilters(filters)

    if (skipInitialFetch.current && isPristineMine) {
      skipInitialFetch.current = false
      return
    }
    skipInitialFetch.current = false

    const handle = window.setTimeout(() => {
      startTransition(async () => {
        await fetchPage(1, 'replace', tab)
      })
    }, 250)

    return () => window.clearTimeout(handle)
  }, [deferredSearch, filters, tab, workspaceId, fetchPage])

  const fetchMore = useCallback(() => {
    if (pending || loadingMoreRef.current || !hasMoreRef.current) return
    setLoadingMore(true)
    void fetchPage(pageRef.current + 1, 'append', tab).finally(() => {
      setLoadingMore(false)
    })
  }, [fetchPage, pending, tab])

  function handleTabChange(next: InfluencerListTab) {
    if (next === tab) return
    const cached = cacheRef.current[next]
    setTab(next)
    setFilters(prev => sanitizeFiltersForTab(prev, next))
    setError(null)
    setInfluencers(cached.influencers)
    setPage(cached.page)
    setHasMore(cached.hasMore)
    setTotal(cached.total)
  }

  function handleFiltersChange(next: Filter<string>[]) {
    setFilters(sanitizeFiltersForTab(next, tab))
  }

  function clearFilters() {
    setFilters([])
  }

  async function handleDelete(influencer: Influencer) {
    if (!window.confirm(`Delete ${influencer.name}? This cannot be undone.`)) return
    const response = await deleteInfluencer(influencer._id)
    if (!response.success) {
      toast.error(response.message ?? 'Failed to delete')
      return
    }
    setInfluencers(prev => {
      const next = prev.filter(i => i._id !== influencer._id)
      const nextTotal = Math.max(0, total - 1)
      setTotal(nextTotal)
      cacheRef.current.mine = {
        ...cacheRef.current.mine,
        influencers: next,
        total: nextTotal,
      }
      return next
    })
    toast.success('Influencer deleted')
  }

  const searching = Boolean(deferredSearch.trim())
  const emptyContext = hasFilters || searching
  const countLabel =
    total === influencers.length
      ? `${total} ${total === 1 ? 'influencer' : 'influencers'}`
      : `${influencers.length} of ${total}`
  const headerDescription =
    tab === 'public'
      ? total === 1
        ? '1 public influencer'
        : `${total.toLocaleString()} public influencers`
      : total === 1
        ? `1 influencer in ${workspaceName}`
        : `${total.toLocaleString()} influencers in ${workspaceName}`

  const createAction = (
    <Button asChild size="sm" className={dashboardSurface.createCta}>
      <Link href={DASHBOARD_ROUTES.STUDIO.INFLUENCER_CREATE}>
        <PlusIcon className="size-4" strokeWidth={1.75} />
        Create influencer
      </Link>
    </Button>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Influencers" description={headerDescription} actions={createAction} />

      <div className="flex flex-col gap-5 pb-10">
        <div
          className={cn(
            'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between',
            pending && 'pointer-events-none opacity-60 transition-opacity duration-150',
          )}
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <DashboardSegment label="Influencer library">
              <DashboardSegmentButton
                active={tab === 'mine'}
                onClick={() => handleTabChange('mine')}
                className="gap-1.5"
              >
                <UserRoundIcon className="size-3 opacity-70" strokeWidth={1.75} />
                Yours
              </DashboardSegmentButton>
              <DashboardSegmentButton
                active={tab === 'public'}
                onClick={() => handleTabChange('public')}
                className="gap-1.5"
              >
                <CompassIcon className="size-3 opacity-70" strokeWidth={1.75} />
                Discover
              </DashboardSegmentButton>
            </DashboardSegment>

            <span className="hidden h-3 w-px bg-border/70 sm:block" aria-hidden />

            <Filters
              filters={filters}
              fields={filterFields}
              onChange={handleFiltersChange}
              size="sm"
              className="gap-1.5"
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-7 gap-1.5 rounded-full border-border/60 px-2.5 text-[11px] font-medium shadow-none',
                    hasFilters && 'border-border bg-muted/40 text-foreground',
                  )}
                >
                  <ListFilterIcon className="size-3" strokeWidth={1.75} />
                  Filter
                  {activeFilterCount > 0 ? (
                    <span className="tabular-nums text-muted-foreground">{activeFilterCount}</span>
                  ) : null}
                </Button>
              }
            />

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {pending ? <Loader2Icon className="size-3 animate-spin" /> : null}
              <span className="tabular-nums">{countLabel}</span>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-0.5 text-foreground/70 underline-offset-2 transition-colors hover:text-foreground hover:underline"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <div className="relative w-full lg:max-w-[17rem]">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground/80"
              strokeWidth={1.75}
            />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="h-8 rounded-lg border-border/60 bg-background pr-8 pl-8 text-[13px] shadow-none"
              aria-label="Search influencers by name"
            />
            {search ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute top-1/2 right-1 size-6 -translate-y-1/2 rounded-md text-muted-foreground"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <XIcon className="size-3.5" />
              </Button>
            ) : null}
          </div>
        </div>

        <InfluencerGrid
          influencers={influencers}
          error={error}
          pending={pending}
          hasMore={hasMore}
          emptyContext={emptyContext}
          tab={tab}
          onLoadMore={fetchMore}
          onDelete={tab === 'mine' ? handleDelete : undefined}
          onClearFilters={hasFilters ? clearFilters : undefined}
        />
      </div>
    </div>
  )
}

function ScrollLoader() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-[12px] text-muted-foreground">
      <Loader2Icon className="size-3.5 animate-spin" />
      Loading more
    </div>
  )
}

function InfluencerGrid({
  influencers,
  error,
  pending,
  hasMore,
  emptyContext,
  tab,
  onLoadMore,
  onDelete,
  onClearFilters,
}: {
  influencers: Influencer[]
  error: string | null
  pending: boolean
  hasMore: boolean
  emptyContext: boolean
  tab: InfluencerListTab
  onLoadMore: () => void
  onDelete?: (influencer: Influencer) => void
  onClearFilters?: () => void
}) {
  if (error) {
    return (
      <ErrorState
        title={error}
        description="Refresh the page or adjust your filters to try again."
        className="rounded-xl"
      />
    )
  }

  if (influencers.length === 0) {
    return (
      <InfluencerEmptyState
        tab={tab}
        emptyContext={emptyContext}
        onClearFilters={onClearFilters}
      />
    )
  }

  return (
    <InfiniteScroll
      dataLength={influencers.length}
      next={onLoadMore}
      hasMore={hasMore}
      loader={<ScrollLoader />}
      scrollableTarget={SCROLL_TARGET_ID}
      scrollThreshold={0.9}
      className="!overflow-visible"
      style={{ overflow: 'visible' }}
    >
      <ul
        className={cn(
          'grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
          pending && 'opacity-60 transition-opacity duration-150',
        )}
      >
        {influencers.map(influencer => (
          <li key={influencer._id}>
            <InfluencerCard influencer={influencer} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </InfiniteScroll>
  )
}

function InfluencerEmptyState({
  tab,
  emptyContext,
  onClearFilters,
}: {
  tab: InfluencerListTab
  emptyContext: boolean
  onClearFilters?: () => void
}) {
  if (emptyContext) {
    return (
      <EmptyState
        icon={SearchIcon}
        title="No matches"
        description="Try a different name or clear your filters."
        minHeight="lg"
        variant="hero"
        iconClassName={dashboardSurface.emptyIcon}
        action={
          onClearFilters ? (
            <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : null
        }
      />
    )
  }

  if (tab === 'public') {
    return (
      <EmptyState
        icon={SparklesIcon}
        title="Nothing in Discover yet"
        description="Public influencers will appear here when they're ready to use."
        minHeight="lg"
        variant="hero"
        iconClassName={dashboardSurface.emptyIcon}
      />
    )
  }

  return (
    <EmptyState
      icon={UserRoundIcon}
      title="Create your first influencer"
      description="Build a reusable AI character, or browse ready-made ones in Discover."
      minHeight="lg"
      variant="hero"
      iconClassName={dashboardSurface.emptyIcon}
      action={
        <Button asChild size="sm" className="h-8 rounded-lg">
          <Link href={DASHBOARD_ROUTES.STUDIO.INFLUENCER_CREATE}>Create influencer</Link>
        </Button>
      }
    />
  )
}
