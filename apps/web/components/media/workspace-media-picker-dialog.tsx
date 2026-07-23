'use client'

import { FilePreview } from '@/components/media/file-preview'
import { finderGridClassName } from '@/components/media/folder-grid'
import { MediaGridSkeleton } from '@/components/media/media-grid-skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { getFolders, getWorkspaceFiles } from '@/services/files.service'
import { formatFileCount } from '@/utils/format'
import { getMediaKind } from '@/utils/media'
import type { CollectionResponse, ImageResponse } from '@socialista/types'
import { CheckIcon, ChevronRightIcon, FolderIcon, Loader2Icon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

export type WorkspaceMediaPick = {
  id: string
  url: string
  kind: 'image' | 'video'
}

type WorkspaceMediaPickerDialogProps = {
  workspaceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (items: WorkspaceMediaPick[]) => void
  multiple?: boolean
  description?: string
}

function isSelectableMedia(file: ImageResponse) {
  const kind = getMediaKind(file.url)
  return kind === 'image' || kind === 'video'
}

export function WorkspaceMediaPickerDialog({
  workspaceId,
  open,
  onOpenChange,
  onSelect,
  multiple = true,
  description = 'Choose images or videos from your workspace files and folders.',
}: WorkspaceMediaPickerDialogProps) {
  const [folderId, setFolderId] = useState<string | undefined>()
  const [folderName, setFolderName] = useState<string | undefined>()
  const [folders, setFolders] = useState<CollectionResponse[]>([])
  const [files, setFiles] = useState<ImageResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())

  const mediaFiles = useMemo(() => files.filter(isSelectableMedia), [files])

  const resetNavigation = useCallback(() => {
    setFolderId(undefined)
    setFolderName(undefined)
    setError(null)
    setSelectedIds(new Set())
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
    if (!open || !workspaceId) return

    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const [foldersResult, filesResult] = await Promise.all([
          folderId ? Promise.resolve(null) : getFolders(),
          getWorkspaceFiles(workspaceId, folderId),
        ])

        if (cancelled) return

        if (!folderId && foldersResult?.data) {
          setFolders(foldersResult.data.collections)
        } else if (!folderId) {
          setFolders([])
        }

        setFiles(filesResult.data?.images ?? [])
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
  }, [open, workspaceId, folderId])

  const toggleSelection = (file: ImageResponse) => {
    const kind = getMediaKind(file.url)
    if (kind !== 'image' && kind !== 'video') return

    if (!multiple) {
      onSelect([{ id: file._id, url: file.url, kind }])
      handleOpenChange(false)
      return
    }

    setSelectedIds(current => {
      const next = new Set(current)
      if (next.has(file._id)) {
        next.delete(file._id)
      } else {
        next.add(file._id)
      }
      return next
    })
  }

  const handleConfirmSelection = () => {
    const selected = mediaFiles
      .filter(file => selectedIds.has(file._id))
      .map(file => {
        const kind = getMediaKind(file.url)
        return {
          id: file._id,
          url: file.url,
          kind: kind === 'video' ? 'video' : 'image',
        } satisfies WorkspaceMediaPick
      })

    if (selected.length === 0) return
    onSelect(selected)
    handleOpenChange(false)
  }

  const handleOpenFolder = (folder: CollectionResponse) => {
    setFolderId(folder._id)
    setFolderName(folder.name)
    setSelectedIds(new Set())
  }

  const isRoot = !folderId
  const hasFolders = isRoot && folders.length > 0
  const hasMedia = mediaFiles.length > 0
  const isEmpty = !isLoading && !error && !hasFolders && !hasMedia
  const selectedCount = selectedIds.size

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(85vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/50 px-4 py-3">
          <DialogTitle className="text-sm font-semibold tracking-tight">Media library</DialogTitle>
          <DialogDescription className="text-xs">{description}</DialogDescription>
        </DialogHeader>

        <nav
          className="flex min-w-0 items-center gap-1 border-b border-border/50 px-4 py-2 text-xs text-muted-foreground"
          aria-label="Folder path"
        >
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

        <ScrollArea className="min-h-0 flex-1 px-4 py-3">
          {isLoading ? (
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
              {isRoot ? 'No images or videos in your workspace yet.' : 'This folder is empty.'}
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
                        <div className="flex aspect-square items-center justify-center rounded-lg border border-border/50 bg-background transition-colors group-hover:border-foreground/20">
                          <FolderIcon
                            className="size-7 text-muted-foreground transition-transform duration-200 group-hover:scale-105"
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

              {hasFolders && hasMedia ? <div className="border-t border-border/50" /> : null}

              {hasMedia ? (
                <section className="space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground">Media</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {mediaFiles.map(file => {
                      const kind = getMediaKind(file.url)
                      const selected = selectedIds.has(file._id)

                      return (
                        <button
                          key={file._id}
                          type="button"
                          onClick={() => toggleSelection(file)}
                          className={cn(
                            'group relative aspect-square overflow-hidden rounded-lg border bg-background transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            selected
                              ? 'border-foreground/30 ring-2 ring-foreground/15'
                              : 'border-border/50 hover:border-foreground/20',
                          )}
                        >
                          <FilePreview src={file.url} alt="" loading="lazy" hoverPlay={kind === 'video'} />
                          {multiple && selected ? (
                            <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-background shadow-xs">
                              <CheckIcon className="size-3" strokeWidth={2.5} />
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </ScrollArea>

        {multiple ? (
          <DialogFooter className="border-t border-border/50 px-4 py-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-md text-xs"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 rounded-md px-3 text-xs"
              disabled={selectedCount === 0}
              onClick={handleConfirmSelection}
            >
              {selectedCount === 0
                ? 'Add selected'
                : `Add ${selectedCount} item${selectedCount === 1 ? '' : 's'}`}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
