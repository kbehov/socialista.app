'use client'

import { FilePreview } from '@/components/media/file-preview'
import { finderGridClassName } from '@/components/media/folder-grid'
import { MediaGridSkeleton } from '@/components/media/media-grid-skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WORKSPACE_FILES_PAGE_SIZE } from '@/constants/files'
import { proxiedImageUrl } from '@/lib/carousel/image-url'
import { cn } from '@/lib/utils'
import { getFolders, getWorkspaceFiles } from '@/services/files.service'
import { getWorkspaceId, useWorkspaceStore } from '@/store/workspace.store'
import { formatFileCount } from '@/utils/format'
import { getMediaKind } from '@/utils/media'
import type { CollectionResponse, ImageResponse } from '@socialista/types'
import { ChevronRightIcon, FolderIcon, ImageIcon, Loader2Icon } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

type WorkspaceImagePickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (imageUrl: string) => void
  description?: string
}

function ScrollLoader() {
  return (
    <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
      <Loader2Icon className="size-3.5 animate-spin" />
      Loading more…
    </div>
  )
}

export function WorkspaceImagePickerDialog({
  open,
  onOpenChange,
  onSelect,
  description = 'Choose an image from your workspace files and folders.',
}: WorkspaceImagePickerDialogProps) {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const workspaceId = getWorkspaceId(currentWorkspace)
  const scrollId = `workspace-image-picker-scroll-${useId().replace(/:/g, '')}`

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

  const imageFiles = useMemo(() => files.filter(file => getMediaKind(file.url) === 'image'), [files])

  const resetNavigation = useCallback(() => {
    setFolderId(undefined)
    setFolderName(undefined)
    setError(null)
  }, [])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        resetNavigation()
        setFiles([])
        setPage(1)
        setHasMore(true)
      }
      onOpenChange(nextOpen)
    },
    [onOpenChange, resetNavigation],
  )

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
            limit: WORKSPACE_FILES_PAGE_SIZE,
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

  // Keep fetching when the current pages have no images (e.g. only videos).
  useEffect(() => {
    if (!open || isLoading || isLoadingMore || error) return
    if (!hasMore || imageFiles.length > 0 || files.length === 0) return
    fetchMore()
  }, [open, isLoading, isLoadingMore, error, hasMore, imageFiles.length, files.length, fetchMore])

  const handleSelectImage = (url: string) => {
    onSelect(proxiedImageUrl(url))
    handleOpenChange(false)
  }

  const handleOpenFolder = (folder: CollectionResponse) => {
    setFolderId(folder._id)
    setFolderName(folder.name)
  }

  const isRoot = !folderId
  const hasFolders = isRoot && folders.length > 0
  const hasImages = imageFiles.length > 0
  const isEmpty = !isLoading && !error && !hasFolders && !hasImages && !hasMore

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[min(85vh,720px)] max-h-[min(85vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-border/50 px-5 py-4 sm:px-6">
          <DialogTitle>Select from files</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

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
            {!workspaceId ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No workspace selected.</p>
            ) : isLoading ? (
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
                  <ImageIcon className="size-4 text-muted-foreground/80" strokeWidth={1.5} />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-medium tracking-[-0.015em] text-foreground">
                    {isRoot ? 'No images yet' : 'No images in this folder'}
                  </p>
                  <p className="max-w-[16rem] text-[12px] leading-relaxed text-muted-foreground">
                    {isRoot
                      ? 'Upload images to your workspace files to use them here.'
                      : 'Try another folder or go back to Files.'}
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

                {hasFolders && hasImages ? <div className="border-t border-border/45" /> : null}

                {hasImages ? (
                  <section className="space-y-2.5">
                    <p className="text-[11px] font-medium tracking-[-0.01em] text-muted-foreground">Images</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                      {imageFiles.map(image => (
                        <button
                          key={image._id}
                          type="button"
                          onClick={() => handleSelectImage(image.url)}
                          className={cn(
                            'group relative aspect-square overflow-hidden rounded-xl border border-border/50 bg-background',
                            'transition-[border-color,box-shadow,transform] duration-150',
                            'hover:border-foreground/20 hover:shadow-sm active:scale-[0.98]',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
                          )}
                        >
                          <FilePreview src={image.url} alt="" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}
              </InfiniteScroll>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
