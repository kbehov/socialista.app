'use client'

import { ImageZoom } from '@/components/kibo-ui/image-zoom'
import { FileContextMenu } from '@/components/media/file-context-menu'
import { FilePreview } from '@/components/media/file-preview'
import { FileVideoPreviewDialog } from '@/components/media/file-video-preview-dialog'
import { MediaGrid, type MediaGridItem } from '@/components/media/media-grid'
import { cn } from '@/lib/utils'
import { getMediaKind } from '@/utils/media'
import { useState } from 'react'

type FileMediaGridProps = {
  items: MediaGridItem[]
  className?: string
  itemClassName?: string
  onDeleteFile?: (item: MediaGridItem) => void
}

function FileMediaGridItem({
  item,
  onDeleteFile,
}: {
  item: MediaGridItem
  onDeleteFile?: (item: MediaGridItem) => void
}) {
  const kind = getMediaKind(item.src, item.mimeType)
  const [videoOpen, setVideoOpen] = useState(false)

  const fileName = item.name ?? item.alt
  const onDelete = onDeleteFile ? () => onDeleteFile(item) : undefined

  if (kind === 'video') {
    return (
      <>
        <FileContextMenu
          src={item.src}
          alt={item.alt}
          mimeType={item.mimeType}
          fileName={fileName}
          onOpen={() => setVideoOpen(true)}
          onDelete={onDelete}
        >
          <button
            type="button"
            onClick={() => setVideoOpen(true)}
            className="size-full cursor-pointer text-left active:scale-[0.98] motion-reduce:active:scale-100"
          >
            <FilePreview src={item.src} alt={item.alt} mimeType={item.mimeType} kind="video" />
          </button>
        </FileContextMenu>
        <FileVideoPreviewDialog item={item} open={videoOpen} onOpenChange={setVideoOpen} />
      </>
    )
  }

  if (kind === 'image') {
    return (
      <FileContextMenu
        src={item.src}
        alt={item.alt}
        mimeType={item.mimeType}
        fileName={fileName}
        onOpen={() => window.open(item.src, '_blank', 'noopener,noreferrer')}
        onDelete={onDelete}
      >
        <ImageZoom
          className={cn(
            'size-full',
            '[&_img]:size-full [&_img]:cursor-zoom-in [&_img]:object-cover',
          )}
        >
          <FilePreview src={item.src} alt={item.alt} mimeType={item.mimeType} kind="image" hoverPlay={false} />
        </ImageZoom>
      </FileContextMenu>
    )
  }

  return (
    <FileContextMenu
      src={item.src}
      alt={item.alt}
      mimeType={item.mimeType}
      fileName={fileName}
      onOpen={() => window.open(item.src, '_blank', 'noopener,noreferrer')}
      onDelete={onDelete}
    />
  )
}

export function FileMediaGrid({ items, className, itemClassName, onDeleteFile }: FileMediaGridProps) {
  return (
    <MediaGrid
      items={items}
      className={className}
      itemClassName={itemClassName}
      renderItem={item => <FileMediaGridItem item={item} onDeleteFile={onDeleteFile} />}
    />
  )
}
