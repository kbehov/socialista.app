'use client'

import { cn } from '@/lib/utils'
import { Loader2Icon, UploadCloudIcon } from 'lucide-react'
import type { InputHTMLAttributes, ReactNode } from 'react'

type FilesDropzoneProps = {
  isDragging: boolean
  isUploading?: boolean
  onDragEnter: (event: React.DragEvent<HTMLElement>) => void
  onDragLeave: (event: React.DragEvent<HTMLElement>) => void
  onDragOver: (event: React.DragEvent<HTMLElement>) => void
  onDrop: (event: React.DragEvent<HTMLElement>) => void
  inputProps: InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> }
  header?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export function FilesDropzone({
  isDragging,
  isUploading = false,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  inputProps,
  header,
  children,
  className,
  bodyClassName,
}: FilesDropzoneProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl border-2 border-dashed transition-colors duration-200',
        isDragging ? 'border-primary bg-primary/5' : 'border-border',
        className,
      )}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input {...inputProps} className="sr-only" />

      {header}

      <div className={cn('relative min-h-48 p-4', bodyClassName)}>{children}</div>

      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-xl bg-primary/10 backdrop-blur-[2px]">
          <UploadCloudIcon className="size-8 text-primary" />
          <p className="text-sm font-medium text-primary">Drop files to upload</p>
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-xl bg-background/70 backdrop-blur-[1px]">
          <Loader2Icon className="size-6 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">Uploading files…</p>
        </div>
      )}
    </div>
  )
}
