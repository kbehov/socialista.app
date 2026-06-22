'use client'

import { MediaGrid, type MediaGridItem } from '@/components/media/media-grid'
import { FileContextMenu } from '@/components/media/file-context-menu'
import { cn } from '@/lib/utils'

type FileMediaGridProps = {
  items: MediaGridItem[]
  className?: string
  itemClassName?: string
  onDeleteFile?: (item: MediaGridItem) => void
}

export function FileMediaGrid({ items, className, itemClassName, onDeleteFile }: FileMediaGridProps) {
  return (
    <MediaGrid
      items={items}
      className={className}
      itemClassName={itemClassName}
      renderItem={item => (
        <FileContextMenu
          src={item.src}
          alt={item.alt}
          mimeType={item.mimeType}
          onOpen={() => window.open(item.src, '_blank', 'noopener,noreferrer')}
          onDelete={onDeleteFile ? () => onDeleteFile(item) : undefined}
        />
      )}
    />
  )
}
