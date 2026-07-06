'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CollectionResponse, ImageResponse } from '@socialista/types'
import { ChevronRightIcon, FolderIcon, Loader2Icon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FilePreview } from '@/components/media/file-preview'
import { MediaGridSkeleton } from '@/components/media/media-grid-skeleton'
import { finderGridClassName } from '@/components/media/folder-grid'
import { formatFileCount } from '@/lib/format'
import { getMediaKind } from '@/lib/media'
import { proxiedImageUrl } from '@/lib/carousel/image-url'
import { getFolders, getWorkspaceFiles } from '@/services/files.service'
import { useWorkspaceStore } from '@/store/workspace.store'
import { cn } from '@/lib/utils'

type WorkspaceImagePickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (imageUrl: string) => void
}

export function WorkspaceImagePickerDialog({ open, onOpenChange, onSelect }: WorkspaceImagePickerDialogProps) {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)

  const [folderId, setFolderId] = useState<string | undefined>()
  const [folderName, setFolderName] = useState<string | undefined>()
  const [folders, setFolders] = useState<CollectionResponse[]>([])
  const [images, setImages] = useState<ImageResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const imageFiles = useMemo(
    () => images.filter(image => getMediaKind(image.url) === 'image'),
    [images],
  )

  const resetNavigation = useCallback(() => {
    setFolderId(undefined)
    setFolderName(undefined)
    setError(null)
  }, [])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        resetNavigation()
      }
      onOpenChange(nextOpen)
    },
    [onOpenChange, resetNavigation],
  )

  useEffect(() => {
    if (!open || !currentWorkspace) return

    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const [foldersResult, filesResult] = await Promise.all([
          folderId ? Promise.resolve(null) : getFolders(),
          getWorkspaceFiles(currentWorkspace!._id, folderId),
        ])

        if (cancelled) return

        if (!folderId && foldersResult?.data) {
          setFolders(foldersResult.data.collections)
        } else if (!folderId) {
          setFolders([])
        }

        setImages(filesResult.data?.images ?? [])
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load files')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [open, currentWorkspace, folderId])

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
  const isEmpty = !isLoading && !error && !hasFolders && !hasImages

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(85vh,720px)] flex-col gap-4 overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select from files</DialogTitle>
          <DialogDescription>
            Choose a background image from your workspace files and folders.
          </DialogDescription>
        </DialogHeader>

        <nav className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground" aria-label="Folder path">
          <button
            type="button"
            onClick={resetNavigation}
            className={cn(
              'truncate transition-colors hover:text-foreground',
              isRoot ? 'font-medium text-foreground' : undefined,
            )}
          >
            Files
          </button>
          {folderName ? (
            <>
              <ChevronRightIcon className="size-3 shrink-0" />
              <span className="truncate font-medium text-foreground">{folderName}</span>
            </>
          ) : null}
        </nav>

        <ScrollArea className="min-h-0 flex-1 pr-3">
          {!currentWorkspace ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No workspace selected.</p>
          ) : isLoading ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2Icon className="size-3.5 animate-spin" />
                Loading files…
              </div>
              <MediaGridSkeleton count={12} className="grid-cols-3 sm:grid-cols-4 md:grid-cols-5" />
            </div>
          ) : error ? (
            <p className="py-8 text-center text-sm text-destructive">{error}</p>
          ) : isEmpty ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {isRoot ? 'No images in your workspace yet.' : 'This folder has no images.'}
            </p>
          ) : (
            <div className="flex flex-col gap-4 pb-1">
              {hasFolders ? (
                <section className="space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground">Folders</p>
                  <div className={cn(finderGridClassName, 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5')}>
                    {folders.map(folder => (
                      <button
                        key={folder._id}
                        type="button"
                        onClick={() => handleOpenFolder(folder)}
                        className="group flex min-w-0 flex-col gap-1.5 text-left"
                      >
                        <div className="flex aspect-square items-center justify-center rounded-lg border border-border/60 bg-muted/40 transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                          <FolderIcon
                            className="size-7 text-primary/80 transition-transform duration-200 group-hover:scale-105"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="min-w-0 px-0.5 text-center">
                          <p className="truncate text-[11px] font-medium leading-tight text-foreground">
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

              {hasFolders && hasImages ? <div className="border-t border-border/60" /> : null}

              {hasImages ? (
                <section className="space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground">Images</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {imageFiles.map(image => (
                      <button
                        key={image._id}
                        type="button"
                        onClick={() => handleSelectImage(image.url)}
                        className="group relative aspect-square overflow-hidden rounded-lg ring-offset-background transition hover:ring-2 hover:ring-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <FilePreview src={image.url} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
