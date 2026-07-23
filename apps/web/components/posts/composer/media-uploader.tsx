'use client'

import { uploadPostMedia } from '@/actions/post.actions'
import {
  WorkspaceMediaPickerDialog,
  type WorkspaceMediaPick,
} from '@/components/media/workspace-media-picker-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FolderOpenIcon, ImagePlusIcon, Loader2Icon } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

import type { ComposerMediaItem } from './composer-types'

type MediaUploaderProps = {
  workspaceId: string
  disabled?: boolean
  compact?: boolean
  onUploaded: (item: ComposerMediaItem) => void
  className?: string
}

function isVideoFile(file: File) {
  return file.type.startsWith('video/')
}

function isImageFile(file: File) {
  return file.type.startsWith('image/')
}

async function readVideoDuration(file: File): Promise<number | undefined> {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : undefined
      URL.revokeObjectURL(url)
      resolve(duration)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(undefined)
    }
    video.src = url
  })
}

async function readVideoDurationFromUrl(url: string): Promise<number | undefined> {
  return new Promise(resolve => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : undefined
      resolve(duration)
    }
    video.onerror = () => resolve(undefined)
    video.src = url
  })
}

function workspacePickToComposerItem(
  item: WorkspaceMediaPick,
  durationSeconds?: number,
): ComposerMediaItem {
  if (item.kind === 'video') {
    return {
      kind: 'video',
      url: item.url,
      durationSeconds,
    }
  }
  return {
    kind: 'image',
    url: item.url,
  }
}

export function MediaUploader({
  workspaceId,
  disabled,
  compact = false,
  onUploaded,
  className,
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter(file => isImageFile(file) || isVideoFile(file))
      if (list.length === 0) {
        toast.error('Only images and videos are supported')
        return
      }

      setIsUploading(true)
      try {
        for (const file of list) {
          const formData = new FormData()
          formData.append('file', file)

          const durationSeconds = isVideoFile(file) ? await readVideoDuration(file) : undefined
          const result = await uploadPostMedia(workspaceId, formData)

          if (!result.success || !result.file) {
            toast.error(result.message ?? `Failed to upload ${file.name}`)
            continue
          }

          if (isVideoFile(file)) {
            onUploaded({
              kind: 'video',
              url: result.file.url,
              durationSeconds,
            })
          } else {
            onUploaded({
              kind: 'image',
              url: result.file.url,
            })
          }
        }
      } finally {
        setIsUploading(false)
      }
    },
    [onUploaded, workspaceId],
  )

  const handleLibrarySelect = useCallback(
    async (items: WorkspaceMediaPick[]) => {
      for (const item of items) {
        if (item.kind === 'video') {
          const durationSeconds = await readVideoDurationFromUrl(item.url)
          onUploaded(workspacePickToComposerItem(item, durationSeconds))
          continue
        }
        onUploaded(workspacePickToComposerItem(item))
      }
    },
    [onUploaded],
  )

  const dragHandlers = {
    onDragEnter: (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragging(true)
    },
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragging(true)
    },
    onDragLeave: (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragging(false)
    },
    onDrop: (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragging(false)
      if (event.dataTransfer.files.length > 0) {
        void uploadFiles(event.dataTransfer.files)
      }
    },
  }

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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isUploading}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'h-8 gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground hover:text-foreground active:scale-[0.98]',
              isDragging && 'text-foreground',
            )}
          >
            {isUploading ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <ImagePlusIcon className="size-3.5" strokeWidth={1.75} />
            )}
            {isUploading ? 'Uploading…' : 'Upload'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isUploading}
            onClick={() => setLibraryOpen(true)}
            className="h-8 gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground hover:text-foreground active:scale-[0.98]"
          >
            <FolderOpenIcon className="size-3.5" strokeWidth={1.75} />
            Library
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
