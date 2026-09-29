import { FilePreview } from '@/components/media/file-preview'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export type MediaGridItem = {
  id: string
  src: string
  alt?: string
  mimeType?: string
  name?: string
  width?: number
  height?: number
}

type MediaGridProps = {
  items: MediaGridItem[]
  className?: string
  itemClassName?: string
  renderItem?: (item: MediaGridItem) => ReactNode
  renderOverlay?: (item: MediaGridItem) => ReactNode
}

export const mediaGridClassName =
  'grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8'

const defaultGridClassName = mediaGridClassName

export const mediaGridItemClassName =
  'group/cell relative aspect-square overflow-hidden rounded-[10px] bg-muted/25 outline outline-1 outline-[oklch(0_0_0/0.1)] transition-[outline-color,box-shadow] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:outline-[oklch(0_0_0/0.16)] hover:shadow-sm dark:outline-[oklch(1_0_0/0.1)] dark:hover:outline-[oklch(1_0_0/0.16)]'

export function MediaGrid({ items, className, itemClassName, renderItem, renderOverlay }: MediaGridProps) {
  return (
    <div className={cn(defaultGridClassName, className)}>
      {items.map(item => (
        <div
          key={item.id}
          className={cn(mediaGridItemClassName, itemClassName)}
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
