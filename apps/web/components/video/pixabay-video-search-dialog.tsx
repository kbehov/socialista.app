'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2Icon, SearchIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MediaGridSkeleton } from '@/components/media/media-grid-skeleton'
import { proxiedImageUrl } from '@/lib/carousel/image-url'
import { searchPixabayVideos, type PixabayVideoResult } from '@/services/pixabay.service'
import { cn } from '@/lib/utils'

type PixabayVideoSearchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (video: PixabayVideoResult) => Promise<void>
}

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(total / 60)
  const remainder = total % 60
  if (minutes === 0) return `${remainder}s`
  return `${minutes}:${remainder.toString().padStart(2, '0')}`
}

export function PixabayVideoSearchDialog({ open, onOpenChange, onSelect }: PixabayVideoSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [videos, setVideos] = useState<PixabayVideoResult[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [importingId, setImportingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const loadMoreLockRef = useRef(false)
  const didLoadPopularRef = useRef(false)

  const hasMore = page < totalPages
  const isLoading = isSearching || isLoadingMore
  const isImporting = importingId != null

  const resetState = useCallback(() => {
    setQuery('')
    setSubmittedQuery('')
    setVideos([])
    setPage(1)
    setTotalPages(1)
    setError(null)
    setIsSearching(false)
    setIsLoadingMore(false)
    setImportingId(null)
    loadMoreLockRef.current = false
    didLoadPopularRef.current = false
  }, [])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetState()
      onOpenChange(nextOpen)
    },
    [onOpenChange, resetState],
  )

  const fetchPage = useCallback(async (term: string, nextPage: number) => {
    const isFirstPage = nextPage === 1
    if (isFirstPage) {
      setIsSearching(true)
      setError(null)
    } else {
      setIsLoadingMore(true)
    }

    try {
      const result = await searchPixabayVideos({
        query: term,
        page: nextPage,
        perPage: 20,
      })

      setVideos(current => {
        if (isFirstPage) return result.items
        const seen = new Set(current.map(video => video.id))
        const merged = [...current]
        for (const video of result.items) {
          if (!seen.has(video.id)) merged.push(video)
        }
        return merged
      })
      setPage(result.page)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search Pixabay')
      if (isFirstPage) {
        setVideos([])
        setPage(1)
        setTotalPages(1)
      }
    } finally {
      setIsSearching(false)
      setIsLoadingMore(false)
      loadMoreLockRef.current = false
    }
  }, [])

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      const trimmed = query.trim()
      setSubmittedQuery(trimmed)
      setVideos([])
      setPage(1)
      setTotalPages(1)
      void fetchPage(trimmed, 1)
    },
    [fetchPage, query],
  )

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || isImporting || loadMoreLockRef.current) return
    loadMoreLockRef.current = true
    void fetchPage(submittedQuery, page + 1)
  }, [fetchPage, hasMore, isImporting, isLoading, page, submittedQuery])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || !hasMore || isLoading || isImporting) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distanceFromBottom < 240) {
      loadMore()
    }
  }, [hasMore, isImporting, isLoading, loadMore])

  useEffect(() => {
    if (!open || didLoadPopularRef.current) return
    didLoadPopularRef.current = true
    void fetchPage('', 1)
  }, [fetchPage, open])

  useEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll, open, videos.length])

  useEffect(() => {
    if (!open || isLoading || !hasMore || isImporting) return
    const el = scrollRef.current
    if (!el) return
    if (el.scrollHeight <= el.clientHeight + 8) {
      loadMore()
    }
  }, [hasMore, isImporting, isLoading, loadMore, open, videos.length])

  const handleSelectVideo = async (video: PixabayVideoResult) => {
    if (isImporting) return
    setImportingId(video.id)
    try {
      await onSelect(video)
      handleOpenChange(false)
    } catch {
      // Caller surfaces the error; keep results visible so the user can retry.
    } finally {
      setImportingId(null)
    }
  }

  const showEmpty = !isSearching && !error && videos.length === 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(85vh,720px)] flex-col gap-4 overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search videos</DialogTitle>
          <DialogDescription>Find free stock videos from Pixabay.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search videos…"
            className="h-9 text-sm"
            autoFocus
            disabled={isImporting}
          />
          <Button type="submit" size="sm" className="shrink-0" disabled={isSearching || isImporting}>
            {isSearching ? <Loader2Icon className="size-3.5 animate-spin" /> : <SearchIcon className="size-3.5" />}
            Search
          </Button>
        </form>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto pr-1 sidebar-scrollbar">
          {isSearching ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2Icon className="size-3.5 animate-spin" />
                Searching Pixabay…
              </div>
              <MediaGridSkeleton count={12} className="grid-cols-3 sm:grid-cols-4" itemClassName="aspect-video" />
            </div>
          ) : error ? (
            <p className="py-8 text-center text-sm text-destructive">{error}</p>
          ) : showEmpty ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {submittedQuery
                ? `No videos found for “${submittedQuery}”.`
                : 'No videos available right now.'}
            </p>
          ) : videos.length > 0 ? (
            <div className="flex flex-col gap-3 pb-1">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {videos.map(video => {
                  const selected = importingId === video.id
                  return (
                    <button
                      key={video.id}
                      type="button"
                      disabled={isImporting}
                      onClick={() => void handleSelectVideo(video)}
                      className={cn(
                        'group relative aspect-video overflow-hidden rounded-lg bg-muted ring-offset-background',
                        'transition duration-150 hover:ring-2 hover:ring-primary/50',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        'active:scale-[0.99] disabled:pointer-events-none',
                        isImporting && !selected && 'opacity-50',
                      )}
                      title={video.tags ?? video.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={proxiedImageUrl(video.previewUrl)}
                        alt={video.tags ?? video.name}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      {video.duration > 0 ? (
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1 py-px text-[10px] font-medium tabular-nums leading-none text-white">
                          {formatDuration(video.duration)}
                        </span>
                      ) : null}
                      {video.userName ? (
                        <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1.5 pt-4 text-left text-[10px] text-white/90 transition-transform duration-200 group-hover:translate-y-0">
                          {video.userName}
                        </span>
                      ) : null}
                      {selected ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2Icon className="size-5 animate-spin text-white" />
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
              {isLoadingMore ? (
                <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
                  <Loader2Icon className="size-3.5 animate-spin" />
                  Loading more…
                </div>
              ) : hasMore ? (
                <p className="py-1 text-center text-[10px] text-muted-foreground">Scroll for more results</p>
              ) : (
                <p className="py-1 text-center text-[10px] text-muted-foreground">End of results</p>
              )}
            </div>
          ) : null}
        </div>

        <p className="shrink-0 text-center text-[10px] text-muted-foreground">
          Videos from{' '}
          <a
            href="https://pixabay.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Pixabay
          </a>
        </p>
      </DialogContent>
    </Dialog>
  )
}
