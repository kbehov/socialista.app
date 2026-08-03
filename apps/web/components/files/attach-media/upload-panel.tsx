'use client'

import { FilesDropzone } from '@/components/files/files-dropzone'
import { formatBytes, type FileUploadActions, type FileUploadState } from '@/hooks/use-file-upload'
import { cn } from '@/lib/utils'
import { Loader2Icon, UploadCloudIcon, VideoIcon } from 'lucide-react'
import type { AttachMediaAccept, AttachMediaCopy } from './types'

export type AttachMediaUploadPanelProps = {
  accept: AttachMediaAccept
  acceptAttr: string
  copy: AttachMediaCopy
  maxSize: number
  multiple: boolean
  maxReached: boolean
  isUploading: boolean
  uploadState: FileUploadState
  uploadActions: FileUploadActions
  workspaceId?: string
}

export function AttachMediaUploadPanel({
  accept,
  acceptAttr,
  copy,
  maxSize,
  multiple,
  maxReached,
  isUploading,
  uploadState,
  uploadActions,
  workspaceId,
}: AttachMediaUploadPanelProps) {
  if (!workspaceId) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Select a workspace to upload.</p>
  }

  return (
    <FilesDropzone
      isDragging={uploadState.isDragging}
      isUploading={isUploading}
      onDragEnter={uploadActions.handleDragEnter}
      onDragLeave={uploadActions.handleDragLeave}
      onDragOver={uploadActions.handleDragOver}
      onDrop={uploadActions.handleDrop}
      inputProps={uploadActions.getInputProps({
        accept: acceptAttr,
        multiple,
        disabled: isUploading || maxReached,
      })}
      className={cn(
        'min-h-70 flex-1 border-border/55 bg-muted/10',
        uploadState.isDragging && 'border-foreground/25 bg-muted/25',
      )}
      bodyClassName="flex min-h-70 flex-1 flex-col items-center justify-center p-6"
    >
      <button
        type="button"
        disabled={isUploading || maxReached}
        onClick={uploadActions.openFileDialog}
        className={cn(
          'flex w-full max-w-sm flex-col items-center gap-3.5 rounded-2xl px-4 py-2 text-center',
          'transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          (isUploading || maxReached) && 'opacity-55',
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-2xl bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-border/50">
          {isUploading ? (
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          ) : accept === 'video' ? (
            <VideoIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
          ) : (
            <UploadCloudIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
          )}
        </span>
        <div className="space-y-1.5">
          <p className="text-sm font-medium tracking-[-0.015em] text-foreground">
            {isUploading ? 'Uploading…' : maxReached ? 'Selection limit reached' : copy.dropHint}
          </p>
          <p className="text-[12px] leading-relaxed tracking-[-0.01em] text-muted-foreground">
            {maxReached
              ? copy.removeHint
              : `or click to browse · ${copy.formatsHint} · up to ${formatBytes(maxSize)}`}
          </p>
        </div>
        {!maxReached && !isUploading ? (
          <span className="mt-1 inline-flex h-8 items-center rounded-xl border border-border/55 bg-background px-3 text-[12px] font-medium tracking-[-0.01em] text-foreground shadow-xs">
            Choose files
          </span>
        ) : null}
      </button>
    </FilesDropzone>
  )
}
