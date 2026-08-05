'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Corner } from '@/hooks/editor/use-drag-resize'

type LayerTransformHandlesProps = {
  onResize: (corner: Corner) => (e: React.PointerEvent) => void
  onRotate: (e: React.PointerEvent) => void
  toolbar?: ReactNode
}

const HANDLE_POSITION: Record<Corner, string> = {
  nw: '-left-2.5 -top-2.5 cursor-nwse-resize',
  ne: '-right-2.5 -top-2.5 cursor-nesw-resize',
  se: '-right-2.5 -bottom-2.5 cursor-nwse-resize',
  sw: '-left-2.5 -bottom-2.5 cursor-nesw-resize',
}

export function LayerTransformHandles({ onResize, onRotate, toolbar }: LayerTransformHandlesProps) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 rounded-sm border border-dashed border-muted-foreground/70" />
      {(['nw', 'ne', 'se', 'sw'] as Corner[]).map(corner => (
        <ResizeHandle key={corner} corner={corner} onPointerDown={onResize(corner)} />
      ))}
      <RotateHandle onPointerDown={onRotate} />
      {toolbar}
    </>
  )
}

function ResizeHandle({
  corner,
  onPointerDown,
}: {
  corner: Corner
  onPointerDown: (e: React.PointerEvent) => void
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      role="presentation"
      aria-hidden
      className={cn(
        'absolute z-20 flex size-7 items-center justify-center touch-none',
        HANDLE_POSITION[corner],
      )}
    >
      <span className="size-3 rounded-sm border border-dashed border-muted-foreground bg-background shadow-sm" />
    </div>
  )
}

function RotateHandle({ onPointerDown }: { onPointerDown: (e: React.PointerEvent) => void }) {
  return (
    <div className="absolute inset-x-0 -top-9 z-20 flex justify-center">
      <div className="pointer-events-none h-5 w-px bg-muted-foreground/50" />
      <div
        onPointerDown={onPointerDown}
        role="presentation"
        aria-hidden
        className="absolute top-0 flex size-7 cursor-grab items-center justify-center touch-none active:cursor-grabbing"
      >
        <span className="size-3.5 rounded-full border border-dashed border-muted-foreground bg-background shadow-sm" />
      </div>
    </div>
  )
}
