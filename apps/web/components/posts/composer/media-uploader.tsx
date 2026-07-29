'use client'

import { WorkspaceMediaPickerDialog } from '@/components/media/workspace-media-picker-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ComposerMediaItem } from '@/types/composer-types'
import {
  composerItemsFromLibraryPicks,
  uploadComposerMediaFiles,
} from '@/utils/composer-media.utils'
import { FolderOpenIcon, ImagePlusIcon, Loader2Icon } from 'lucide-react'
import { useCallback, useRef, useState, type DragEvent } from 'react'

type MediaUploaderProps = {
  workspaceId: string
  disabled?: boolean
  compact?: boolean
  /** Icon-only controls for narrow panels (e.g. edit sheet). */
  iconOnly?: boolean
  onUploaded: (item: ComposerMediaItem) => void
  className?: string
}

export function MediaUploader({
  workspaceId,
  disabled,
  compact = false,
  iconOnly = false,
  onUploaded,
  className,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setIsUploading(true)
      try {
        await uploadComposerMediaFiles(workspaceId, files, onUploaded)
      } finally {
        setIsUploading(false)
      }
    },
    [onUploaded, workspaceId],
  )

  const handleLibrarySelect = useCallback(
    async (items: Parameters<typeof composerItemsFromLibraryPicks>[0]) => {
      await composerItemsFromLibraryPicks(items, onUploaded)
    },
    [onUploaded],
  )

  const dragHandlers = {
    onDragEnter: (event: DragEvent) => {
      event.preventDefault()
      setIsDragging(true)
    },
    onDragOver: (event: DragEvent) => {
      event.preventDefault()
      setIsDragging(true)
    },
    onDragLeave: (event: DragEvent) => {
      event.preventDefault()
      setIsDragging(false)
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault()
      setIsDragging(false)
      if (event.dataTransfer.files.length > 0) {
        void uploadFiles(event.dataTransfer.files)
      }
    },
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*,video/*"
      multiple
      className="sr-only"
      disabled={disabled || isUploading}
      onChange={event => {
        if (event.target.files?.length) {
          void uploadFiles(event.target.files)
          event.target.value = ''
        }
      }}
    />
  )

  const libraryDialog = (
    <WorkspaceMediaPickerDialog
      workspaceId={workspaceId}
      open={libraryOpen}
      onOpenChange={setLibraryOpen}
      onSelect={items => void handleLibrarySelect(items)}
      multiple
      description="Choose images or videos already in your workspace."
    />
  )

  if (compact) {
    return (
      <>
        <div className={cn('relative flex items-center gap-1', className)} {...dragHandlers}>
          {fileInput}
          <Button
            type="button"
            variant="ghost"
            size={iconOnly ? 'icon-sm' : 'sm'}
            disabled={disabled || isUploading}
            onClick={() => inputRef.current?.click()}
            className={cn(
              iconOnly
                ? 'size-8 rounded-full text-muted-foreground hover:text-foreground'
                : 'h-8 gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground hover:text-foreground active:scale-[0.98]',
              isDragging && 'text-foreground',
            )}
            aria-label={isUploading ? 'Uploading' : 'Upload media'}
          >
            {isUploading ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <ImagePlusIcon className="size-3.5" strokeWidth={1.75} />
            )}
            {iconOnly ? null : isUploading ? 'Uploading…' : 'Upload'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size={iconOnly ? 'icon-sm' : 'sm'}
            disabled={disabled || isUploading}
            onClick={() => setLibraryOpen(true)}
            className={cn(
              iconOnly
                ? 'size-8 rounded-full text-muted-foreground hover:text-foreground'
                : 'h-8 gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground hover:text-foreground active:scale-[0.98]',
            )}
            aria-label="Choose from library"
          >
            <FolderOpenIcon className="size-3.5" strokeWidth={1.75} />
            {iconOnly ? null : 'Library'}
          </Button>
        </div>
        {libraryDialog}
      </>
    )
  }

  return (
    <>
      <div
        className={cn(
          'relative rounded-lg border border-dashed border-border/50 bg-background p-5 transition-colors',
          isDragging && 'border-foreground/20 bg-background',
          disabled && 'pointer-events-none opacity-50',
          className,
        )}
        {...dragHandlers}
      >
        {fileInput}

        <div className="flex flex-col items-center justify-center gap-3 py-1 text-center">
          <span className="flex size-11 items-center justify-center rounded-2xl border border-border/50 bg-background">
            {isUploading ? (
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <ImagePlusIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
            )}
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium tracking-tight text-foreground">
              {isUploading ? 'Uploading…' : 'Add photos or videos'}
            </p>
            <p className="text-[11px] text-muted-foreground">Drag & drop or upload from your device</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => inputRef.current?.click()}
              className="h-8 rounded-full border-border/50 px-3 text-xs shadow-none"
            >
              <ImagePlusIcon className="size-3.5" strokeWidth={1.75} />
              Upload
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => setLibraryOpen(true)}
              className="h-8 rounded-full border-border/50 px-3 text-xs shadow-none"
            >
              <FolderOpenIcon className="size-3.5" strokeWidth={1.75} />
              From library
            </Button>
          </div>
        </div>
      </div>
      {libraryDialog}
    </>
  )
}
