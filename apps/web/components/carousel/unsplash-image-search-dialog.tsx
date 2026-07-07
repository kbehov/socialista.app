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
import {
  searchUnsplashPhotos,
  trackUnsplashDownload,
  type UnsplashPhotoResult,
} from '@/services/unsplash.service'
import { cn } from '@/lib/utils'

type UnsplashImageSearchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (imageUrl: string) => void
}

export function UnsplashImageSearchDialog({ open, onOpenChange, onSelect }: UnsplashImageSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [photos, setPhotos] = useState<UnsplashPhotoResult[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const loadMoreLockRef = useRef(false)

  const hasMore = page < totalPages
  const isLoading = isSearching || isLoadingMore

  const resetState = useCallback(() => {
    setQuery('')
    setSubmittedQuery('')
    setPhotos([])
    setPage(1)
    setTotalPages(1)
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

  const fetchPage = useCallback(async (term: string, nextPage: number) => {
    const isFirstPage = nextPage === 1
    if (isFirstPage) {
      setIsSearching(true)
      setError(null)
    } else {
      setIsLoadingMore(true)
    }

    try {
      const result = await searchUnsplashPhotos({
        query: term,
        page: nextPage,
        perPage: 30,
      })

      setPhotos(current => {
        if (isFirstPage) return result.items
        const seen = new Set(current.map(photo => photo.id))
        const merged = [...current]
        for (const photo of result.items) {
          if (!seen.has(photo.id)) merged.push(photo)
        }
        return merged
      })
      setPage(result.page)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search Unsplash')
      if (isFirstPage) {
        setPhotos([])
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
      if (!trimmed) return
      setSubmittedQuery(trimmed)
      setPhotos([])
      setPage(1)
      setTotalPages(1)
      void fetchPage(trimmed, 1)
    },
    [fetchPage, query],
  )

  const loadMore = useCallback(() => {
    if (!submittedQuery || !hasMore || isLoading || loadMoreLockRef.current) return
    loadMoreLockRef.current = true
    void fetchPage(submittedQuery, page + 1)
  }, [fetchPage, hasMore, isLoading, page, submittedQuery])

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
  }, [handleScroll, open, photos.length])

  useEffect(() => {
    if (!open || isLoading || !hasMore) return
    const el = scrollRef.current
    if (!el) return
    if (el.scrollHeight <= el.clientHeight + 8) {
      loadMore()
    }
  }, [hasMore, isLoading, loadMore, open, photos.length])

  const handleSelectPhoto = (photo: UnsplashPhotoResult) => {
    void trackUnsplashDownload(photo.downloadLocation)
    onSelect(proxiedImageUrl(photo.imageUrl))
    handleOpenChange(false)
  }

  const showEmpty = !isSearching && !error && submittedQuery && photos.length === 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(85vh,720px)] flex-col gap-4 overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search images</DialogTitle>
          <DialogDescription>Find free photos from Unsplash.</DialogDescription>
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

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto pr-1 sidebar-scrollbar">
          {isSearching ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2Icon className="size-3.5 animate-spin" />
                Searching Unsplash…
              </div>
              <MediaGridSkeleton count={12} className="grid-cols-3 sm:grid-cols-4 md:grid-cols-5" />
            </div>
          ) : error ? (
            <p className="py-8 text-center text-sm text-destructive">{error}</p>
          ) : showEmpty ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No images found for &ldquo;{submittedQuery}&rdquo;.
            </p>
          ) : photos.length > 0 ? (
            <div className="flex flex-col gap-3 pb-1">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {photos.map(photo => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => handleSelectPhoto(photo)}
                    className={cn(
                      'group relative aspect-square overflow-hidden rounded-lg bg-muted ring-offset-background',
                      'transition hover:ring-2 hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                    title={photo.altText ?? photo.title ?? 'Unsplash photo'}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={proxiedImageUrl(photo.previewUrl)}
                      alt={photo.altText ?? photo.title ?? 'Unsplash photo'}
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
              Enter a search term to browse Unsplash photos.
            </p>
          )}
        </div>

        <p className="shrink-0 text-center text-[10px] text-muted-foreground">
          Photos from{' '}
          <a
            href="https://unsplash.com/?utm_source=socialista&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Unsplash
          </a>
        </p>
      </DialogContent>
    </Dialog>
  )
}
