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
import { searchPinterestPins, type PinterestPinResult } from '@/services/pinterest.service'
import { cn } from '@/lib/utils'

type PinterestImageSearchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (imageUrl: string) => void
}

export function PinterestImageSearchDialog({ open, onOpenChange, onSelect }: PinterestImageSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [pins, setPins] = useState<PinterestPinResult[]>([])
  const [bookmark, setBookmark] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const loadMoreLockRef = useRef(false)

  const hasMore = bookmark != null
  const isLoading = isSearching || isLoadingMore

  const resetState = useCallback(() => {
    setQuery('')
    setSubmittedQuery('')
    setPins([])
    setBookmark(null)
    setError(null)
    setIsSearching(false)
    setIsLoadingMore(false)
    loadMoreLockRef.current = false
  }, [])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) resetState()
      onOpenChange(nextOpen)
    },
    [onOpenChange, resetState],
  )

  const fetchPage = useCallback(
    async (term: string, nextBookmark?: string) => {
      const isFirstPage = !nextBookmark
      if (isFirstPage) {
        setIsSearching(true)
        setError(null)
      } else {
        setIsLoadingMore(true)
      }

      try {
        const result = await searchPinterestPins({
          term,
          bookmark: nextBookmark,
          limit: 25,
        })

        setPins(current => {
          if (isFirstPage) return result.items
          const seen = new Set(current.map(pin => pin.id))
          const merged = [...current]
          for (const pin of result.items) {
            if (!seen.has(pin.id)) merged.push(pin)
          }
          return merged
        })
        setBookmark(result.bookmark)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search Pinterest')
        if (isFirstPage) {
          setPins([])
          setBookmark(null)
        }
      } finally {
        setIsSearching(false)
        setIsLoadingMore(false)
        loadMoreLockRef.current = false
      }
    },
    [],
  )

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      const trimmed = query.trim()
      if (!trimmed) return
      setSubmittedQuery(trimmed)
      setPins([])
      setBookmark(null)
      void fetchPage(trimmed)
    },
    [fetchPage, query],
  )

  const loadMore = useCallback(() => {
    if (!submittedQuery || !bookmark || isLoading || loadMoreLockRef.current) return
    loadMoreLockRef.current = true
    void fetchPage(submittedQuery, bookmark)
  }, [bookmark, fetchPage, isLoading, submittedQuery])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || !hasMore || isLoading) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distanceFromBottom < 240) {
      loadMore()
    }
  }, [hasMore, isLoading, loadMore])

  useEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll, open, pins.length])

  useEffect(() => {
    if (!open || isLoading || !hasMore) return
    const el = scrollRef.current
    if (!el) return
    if (el.scrollHeight <= el.clientHeight + 8) {
      loadMore()
    }
  }, [hasMore, isLoading, loadMore, open, pins.length])

  const handleSelectPin = (pin: PinterestPinResult) => {
    onSelect(proxiedImageUrl(pin.imageUrl))
    handleOpenChange(false)
  }

  const showEmpty = !isSearching && !error && submittedQuery && pins.length === 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(85vh,720px)] flex-col gap-4 overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search Pinterest</DialogTitle>
          <DialogDescription>Find inspiration images from Pinterest.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search images…"
            className="h-9 text-sm"
            autoFocus
          />
          <Button type="submit" size="sm" className="shrink-0" disabled={!query.trim() || isSearching}>
            {isSearching ? <Loader2Icon className="size-3.5 animate-spin" /> : <SearchIcon className="size-3.5" />}
            Search
          </Button>
        </form>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto pr-1 sidebar-scrollbar"
        >
          {isSearching ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2Icon className="size-3.5 animate-spin" />
                Searching Pinterest…
              </div>
              <MediaGridSkeleton count={12} className="grid-cols-3 sm:grid-cols-4 md:grid-cols-5" />
            </div>
          ) : error ? (
            <p className="py-8 text-center text-sm text-destructive">{error}</p>
          ) : showEmpty ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No images found for &ldquo;{submittedQuery}&rdquo;.
            </p>
          ) : pins.length > 0 ? (
            <div className="flex flex-col gap-3 pb-1">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {pins.map(pin => (
                  <button
                    key={pin.id}
                    type="button"
                    onClick={() => handleSelectPin(pin)}
                    className={cn(
                      'group relative aspect-square overflow-hidden rounded-lg bg-muted ring-offset-background',
                      'transition hover:ring-2 hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                    title={pin.title ?? pin.altText ?? 'Pinterest image'}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={proxiedImageUrl(pin.imageUrl)}
                      alt={pin.altText ?? pin.title ?? 'Pinterest image'}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </button>
                ))}
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
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Enter a search term to browse Pinterest images.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
