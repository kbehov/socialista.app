'use client'

import { EmptyState } from '@/components/common/empty-state'
import { cn } from '@/lib/utils'
import { UploadCloudIcon } from 'lucide-react'

type FilesUploadEmptyStateProps = {
  isDragging: boolean
  onUpload: () => void
}

export function FilesUploadEmptyState({ isDragging, onUpload }: FilesUploadEmptyStateProps) {
  return (
    <EmptyState
      interactive
      variant="ghost"
      minHeight="sm"
      icon={UploadCloudIcon}
      title={isDragging ? 'Release to upload' : 'Drop files here'}
      description="or click to browse — images and videos up to 50 MB"
      onClick={onUpload}
      className="py-8"
      iconClassName={cn(isDragging && 'border-primary text-primary [&_svg]:text-primary')}
    />
  )
}
