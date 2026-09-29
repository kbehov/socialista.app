'use client'

import { CreateFolderSheet } from '@/components/files/create-folder-sheet'
import { dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2Icon, Trash2Icon, UploadCloudIcon } from 'lucide-react'

type FilesPageHeaderActionsProps = {
  isUploading?: boolean
  onUpload: () => void
  showNewFolder?: boolean
  onDeleteFolder?: () => void
}

export function FilesPageHeaderActions({
  isUploading = false,
  onUpload,
  showNewFolder = false,
  onDeleteFolder,
}: FilesPageHeaderActionsProps) {
  return (
    <>
      {showNewFolder ? <CreateFolderSheet variant="header" /> : null}
      {onDeleteFolder ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={dashboardSurface.toolbarControl}
          onClick={onDeleteFolder}
          disabled={isUploading}
        >
          <Trash2Icon className="size-4" strokeWidth={1.75} />
          Delete folder
        </Button>
      ) : null}
      <Button
        type="button"
        size="sm"
        className={cn(dashboardSurface.createCta)}
        onClick={onUpload}
        disabled={isUploading}
      >
        {isUploading ? <Loader2Icon className="size-4 animate-spin" /> : <UploadCloudIcon className="size-4" strokeWidth={1.75} />}
        {isUploading ? 'Uploading…' : 'Upload'}
      </Button>
    </>
  )
}
