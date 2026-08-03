'use client'

import { FilePreview } from '@/components/media/file-preview'
import { finderGridClassName } from '@/components/media/folder-grid'
import { MediaGridSkeleton } from '@/components/media/media-grid-skeleton'
import { cn } from '@/lib/utils'
import { getFolders, getWorkspaceFiles } from '@/services/files.service'
import { formatFileCount } from '@/utils/format'
import { getMediaKind } from '@/utils/media'
import type { CollectionResponse, ImageResponse } from '@socialista/types'
import {
  CheckIcon,
  ChevronRightIcon,
  FolderIcon,
  ImageIcon,
  Loader2Icon,
  VideoIcon,
} from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import type { AttachMediaAccept, AttachMediaCopy, AttachedMedia } from './types'
import { isAllowedKind, toAttachedFromLibrary } from './utils'

const LIBRARY_PAGE_SIZE = 24

export type AttachMediaLibraryBrowserProps = {
  workspaceId: string
  open: boolean
  accept: AttachMediaAccept
  copy: AttachMediaCopy
  draft: AttachedMedia[]
  maxSelect: number
  onToggle: (file: AttachedMedia) => void
}

function ScrollLoader() {
  return (
    <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
      <Loader2Icon className="size-3.5 animate-spin" />
      Loading more…
    </div>
  )
}

export function AttachMediaLibraryBrowser({
  workspaceId,
  open,
  accept,
  copy,
  draft,
  maxSelect,
  onToggle,
}: AttachMediaLibraryBrowserProps) {
  const scrollId = `attach-library-scroll-${useId().replace(/:/g, '')}`

  const [folderId, setFolderId] = useState<string | undefined>()
  const [folderName, setFolderName] = useState<string | undefined>()
  const [folders, setFolders] = useState<CollectionResponse[]>([])
  const [files, setFiles] = useState<ImageResponse[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRequestId = useRef(0)

  const selectedIds = useMemo(() => new Set(draft.map(item => item.id)), [draft])

  const mediaFiles = useMemo(
    () => files.filter(file => isAllowedKind(getMediaKind(file.url), accept)),
    [files, accept],
  )

  const EmptyIcon = accept === 'video' ? VideoIcon : ImageIcon

  const resetNavigation = useCallback(() => {
    setFolderId(undefined)
    setFolderName(undefined)
    setError(null)
  }, [])

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        resetNavigation()
      }, 100)
    }
  }, [open, resetNavigation])

  const loadPage = useCallback(
    async (pageNum: number, mode: 'replace' | 'append') => {
      if (!workspaceId) return

      const requestId = ++loadRequestId.current
      if (mode === 'replace') {
        setIsLoading(true)
        setError(null)
      } else {
        setIsLoadingMore(true)
      }

      try {
        const [foldersResult, filesResult] = await Promise.all([
          mode === 'replace' && !folderId ? getFolders() : Promise.resolve(null),
          getWorkspaceFiles(workspaceId, folderId, {
            page: pageNum,
            limit: LIBRARY_PAGE_SIZE,
            sort: '-createdAt',
          }),
        ])

        if (requestId !== loadRequestId.current) return

        if (mode === 'replace') {
          if (!folderId && foldersResult?.data) {
            setFolders(foldersResult.data.collections)
          } else if (!folderId) {
            setFolders([])
          }
        }

        const nextImages = filesResult.data?.images ?? []
        setFiles(current => (mode === 'append' ? [...current, ...nextImages] : nextImages))
        setPage(pageNum)
        setHasMore(Boolean(filesResult.meta?.hasNextPage))
      } catch (err) {
        if (requestId !== loadRequestId.current) return
        setError(err instanceof Error ? err.message : 'Failed to load files')
        if (mode === 'replace') {
          setFiles([])
          setHasMore(false)
        }
      } finally {
        if (requestId === loadRequestId.current) {
          setIsLoading(false)
          setIsLoadingMore(false)
        }
      }
    },
    [workspaceId, folderId],
  )

  useEffect(() => {
    if (!open || !workspaceId) return

    setFiles([])
    setPage(1)
    setHasMore(true)
    void loadPage(1, 'replace')
  }, [open, workspaceId, folderId, loadPage])

  const fetchMore = useCallback(() => {
    if (!open || isLoading || isLoadingMore || !hasMore) return
    void loadPage(page + 1, 'append')
  }, [open, isLoading, isLoadingMore, hasMore, loadPage, page])

  // Keep fetching when the current pages have no files matching `accept`.
  useEffect(() => {
    if (!open || isLoading || isLoadingMore || error) return
    if (!hasMore || mediaFiles.length > 0 || files.length === 0) return
    fetchMore()
  }, [open, isLoading, isLoadingMore, error, hasMore, mediaFiles.length, files.length, fetchMore])

  const handleOpenFolder = (folder: CollectionResponse) => {
    setFolderId(folder._id)
    setFolderName(folder.name)
  }

  const isRoot = !folderId
  const hasFolders = isRoot && folders.length > 0
  const hasMedia = mediaFiles.length > 0
  const isEmpty = !isLoading && !error && !hasFolders && !hasMedia && !hasMore
  const atLimit = draft.length >= maxSelect

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <nav
        className="flex min-w-0 shrink-0 items-center gap-1 border-b border-border/40 px-5 py-2.5 text-xs text-muted-foreground sm:px-6"
        aria-label="Folder path"
      >
        <button
          type="button"
          onClick={resetNavigation}
          className={cn(
            'truncate tracking-[-0.01em] transition-colors hover:text-foreground',
            isRoot && 'font-medium text-foreground',
          )}
        >
          Files
        </button>
        {folderName ? (
          <>
            <ChevronRightIcon className="size-3 shrink-0 opacity-60" />
            <span className="truncate font-medium tracking-[-0.01em] text-foreground">{folderName}</span>
          </>
        ) : null}
      </nav>

      <div id={scrollId} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="px-5 py-4 sm:px-6">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2Icon className="size-3.5 animate-spin" />
                Loading files…
              </div>
              <MediaGridSkeleton count={12} className="grid-cols-3 sm:grid-cols-4 md:grid-cols-5" />
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-destructive">{error}</p>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-muted/45 ring-1 ring-border/35">
                <EmptyIcon className="size-4 text-muted-foreground/80" strokeWidth={1.5} />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-medium tracking-[-0.015em] text-foreground">
                  {isRoot ? copy.emptyRoot : copy.emptyFolder}
                </p>
                <p className="max-w-[16rem] text-[12px] leading-relaxed text-muted-foreground">
                  {isRoot ? copy.emptyRootHint : copy.emptyFolderHint}
                </p>
              </div>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={files.length}
              next={fetchMore}
              hasMore={hasMore}
              loader={<ScrollLoader />}
              scrollableTarget={scrollId}
              scrollThreshold={0.85}
              className="flex flex-col gap-5 pb-1"
            >
              {hasFolders ? (
                <section className="space-y-2.5">
                  <p className="text-[11px] font-medium tracking-[-0.01em] text-muted-foreground">Folders</p>
                  <div className={cn(finderGridClassName, 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5')}>
                    {folders.map(folder => (
                      <button
                        key={folder._id}
                        type="button"
                        onClick={() => handleOpenFolder(folder)}
                        className="group flex min-w-0 flex-col gap-1.5 text-left"
                      >
                        <div className="flex aspect-square items-center justify-center rounded-xl border border-border/50 bg-background transition-colors group-hover:border-foreground/20 group-hover:bg-muted/20">
                          <FolderIcon
                            className="size-7 text-muted-foreground transition-transform duration-200 group-hover:scale-105"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="min-w-0 px-0.5 text-center">
                          <p className="truncate text-[11px] font-medium leading-tight tracking-[-0.01em] text-foreground">
                            {folder.name}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                            {formatFileCount(folder.imagesCount)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}

              {hasFolders && hasMedia ? <div className="border-t border-border/45" /> : null}

              {hasMedia ? (
                <section className="space-y-2.5">
                  <p className="text-[11px] font-medium tracking-[-0.01em] text-muted-foreground">
                    {copy.librarySection}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {mediaFiles.map(file => {
                      const attached = toAttachedFromLibrary(file)
                      if (!attached) return null

                      const selected = selectedIds.has(file._id)
                      const disabled = atLimit && !selected
                      const label = attached.name ?? copy.noun

                      return (
                        <button
                          key={file._id}
                          type="button"
                          disabled={disabled}
                          aria-pressed={selected}
                          aria-label={selected ? `Deselect ${label}` : `Select ${label}`}
                          onClick={() => onToggle(attached)}
                          className={cn(
                            'group relative aspect-square overflow-hidden rounded-xl border bg-background transition-[border-color,box-shadow,opacity,transform] duration-150',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                            'active:scale-[0.98]',
                            selected
                              ? 'border-foreground/30 shadow-sm ring-2 ring-foreground/12'
                              : 'border-border/50 hover:border-foreground/20',
                            disabled && 'cursor-not-allowed opacity-40',
                          )}
                        >
                          <FilePreview
                            src={file.url}
                            alt=""
                            kind={attached.kind}
                            showBadge={attached.kind === 'video'}
                            hoverPlay={attached.kind === 'video'}
                          />
                          {selected ? (
                            <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-background shadow-xs">
                              <CheckIcon className="size-3" strokeWidth={2.5} />
                            </span>
                          ) : (
                            <span className="absolute top-1.5 right-1.5 size-5 rounded-full border border-white/70 bg-black/15 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </section>
              ) : null}
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  )
}
