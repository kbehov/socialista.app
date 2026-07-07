'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { Corner } from '@/hooks/carousel/use-drag-resize'

type LayerTransformHandlesProps = {
  onResize: (corner: Corner) => (e: React.PointerEvent) => void
  onRotate: (e: React.PointerEvent) => void
  toolbar?: ReactNode
}

const HANDLE_POSITION: Record<Corner, string> = {
  nw: '-left-1.5 -top-1.5 cursor-nwse-resize',
  ne: '-right-1.5 -top-1.5 cursor-nesw-resize',
  se: '-right-1.5 -bottom-1.5 cursor-nwse-resize',
  sw: '-left-1.5 -bottom-1.5 cursor-nesw-resize',
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
      className={cn(
        'absolute size-3 rounded-sm border border-dashed border-muted-foreground bg-background shadow-sm z-10',
        HANDLE_POSITION[corner],
      )}
    />
  )
}

function RotateHandle({ onPointerDown }: { onPointerDown: (e: React.PointerEvent) => void }) {
  return (
    <div className="absolute inset-x-0 -top-8 z-10 flex justify-center">
      <div className="pointer-events-none h-5 w-px bg-muted-foreground/50" />
      <div
        onPointerDown={onPointerDown}
        className="absolute top-0 size-4 cursor-grab rounded-full border border-dashed border-muted-foreground bg-background shadow-sm active:cursor-grabbing"
      />
    </div>
  )
}
