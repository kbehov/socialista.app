'use client'

import { Button } from '@/components/ui/button'
import { formatFileCount, formatItemCount } from '@/lib/format'
import { cn } from '@/lib/utils'
import { FilesIcon, FolderIcon, Loader2Icon, Trash2Icon, UploadCloudIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type FilesToolbarProps = {
  title: string
  fileCount?: number
  itemCount?: number
  isUploading?: boolean
  onUpload: () => void
  actions?: ReactNode
  className?: string
}

export function FilesToolbar({
  title,
  fileCount = 0,
  itemCount,
  isUploading = false,
  onUpload,
  actions,
  className,
}: FilesToolbarProps) {
  const countLabel =
    itemCount !== undefined ? formatItemCount(itemCount) : fileCount > 0 ? formatFileCount(fileCount) : null

  return (
    <div className={cn('flex items-center justify-between gap-3 border-b border-border px-4 py-3', className)}>
      <div className="flex min-w-0 items-center gap-2">
        <FilesIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm font-medium">{title}</span>
        {countLabel && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{countLabel}</span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {actions}
        <Button type="button" size="xs" onClick={onUpload} disabled={isUploading}>
          {isUploading ? <Loader2Icon className="animate-spin" /> : <UploadCloudIcon />}
          {isUploading ? 'Uploading…' : 'Upload'}
        </Button>
      </div>
    </div>
  )
}

export function FolderToolbar({
  title,
  fileCount = 0,
  isUploading = false,
  onUpload,
  onDeleteFolder,
  className,
}: Omit<FilesToolbarProps, 'actions' | 'itemCount'> & {
  onDeleteFolder?: () => void
}) {
  return (
    <div className={cn('flex items-center justify-between gap-3 border-b border-border px-4 py-3', className)}>
      <div className="flex min-w-0 items-center gap-2">
        <FolderIcon className="size-4 shrink-0 text-primary/80" />
        <span className="truncate text-sm font-medium">{title}</span>
        {fileCount > 0 && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {formatFileCount(fileCount)}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {onDeleteFolder && (
          <Button type="button" size="xs" variant="outline" onClick={onDeleteFolder} disabled={isUploading}>
            <Trash2Icon />
            Delete folder
          </Button>
        )}
        <Button type="button" size="xs" onClick={onUpload} disabled={isUploading}>
          {isUploading ? <Loader2Icon className="animate-spin" /> : <UploadCloudIcon />}
          {isUploading ? 'Uploading…' : 'Upload'}
        </Button>
      </div>
    </div>
  )
}
