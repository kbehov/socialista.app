import { FilePreview } from '@/components/media/file-preview'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export type MediaGridItem = {
  id: string
  src: string
  alt?: string
  mimeType?: string
}

type MediaGridProps = {
  items: MediaGridItem[]
  className?: string
  itemClassName?: string
  renderItem?: (item: MediaGridItem) => ReactNode
  renderOverlay?: (item: MediaGridItem) => ReactNode
}

const defaultGridClassName =
  'grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8'

export function MediaGrid({ items, className, itemClassName, renderItem, renderOverlay }: MediaGridProps) {
  return (
    <div className={cn(defaultGridClassName, className)}>
      {items.map(item => (
        <div
          key={item.id}
          className={cn('group relative aspect-square overflow-hidden rounded-lg', itemClassName)}
        >
          {renderItem ? (
            renderItem(item)
          ) : (
            <FilePreview src={item.src} alt={item.alt} mimeType={item.mimeType} />
          )}
          {renderOverlay?.(item)}
        </div>
      ))}
    </div>
  )
}
