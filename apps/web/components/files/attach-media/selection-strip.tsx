'use client'

import { AttachedMediaThumb } from './attached-media-thumb'
import type { AttachedMedia } from './types'

export type AttachMediaSelectionStripProps = {
  files: AttachedMedia[]
  maxSelect: number
  nounPlural: string
  onRemove: (id: string) => void
  className?: string
}

export function AttachMediaSelectionStrip({
  files,
  maxSelect,
  nounPlural,
  onRemove,
  className,
}: AttachMediaSelectionStripProps) {
  if (files.length === 0) return null

  return (
    <div className={className ?? 'shrink-0 border-b border-border/50 bg-muted/10 px-5 py-3 sm:px-6'}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[11px] font-medium tracking-[-0.01em] text-muted-foreground">
          Selected · {files.length}
          {maxSelect < Number.POSITIVE_INFINITY ? ` of ${maxSelect}` : ''} {nounPlural}
        </p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        {files.map(file => (
          <AttachedMediaThumb key={file.id} file={file} onRemove={onRemove} />
        ))}
      </div>
    </div>
  )
}
