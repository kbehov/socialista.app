'use client'

import { FilePreview } from '@/components/media/file-preview'
import { cn } from '@/lib/utils'
import { XIcon } from 'lucide-react'
import type { AttachedMedia } from './types'

export type AttachedMediaThumbProps = {
  file: AttachedMedia
  size?: 'sm' | 'md'
  disabled?: boolean
  className?: string
  onRemove?: (id: string) => void
}

const SIZE_CLASS = {
  sm: 'size-12',
  md: 'size-14',
} as const

export function AttachedMediaThumb({
  file,
  size = 'md',
  disabled = false,
  className,
  onRemove,
}: AttachedMediaThumbProps) {
  return (
    <div
      className={cn(
        'group relative shrink-0 overflow-hidden rounded-xl ring-1 ring-border/55 transition-shadow hover:ring-border',
        SIZE_CLASS[size],
        className,
      )}
    >
      <FilePreview
        src={file.url}
        alt={file.name ?? ''}
        kind={file.kind}
        showBadge={file.kind === 'video'}
        hoverPlay={false}
      />
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${file.name ?? file.kind}`}
          disabled={disabled}
          className={cn(
            'absolute top-1 right-1 flex size-5 items-center justify-center rounded-full',
            'bg-foreground/90 text-background opacity-0 shadow-sm transition-opacity',
            'group-hover:opacity-100 focus-visible:opacity-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:pointer-events-none',
          )}
          onClick={() => onRemove(file.id)}
        >
          <XIcon className="size-3" strokeWidth={2.5} />
        </button>
      ) : null}
    </div>
  )
}
