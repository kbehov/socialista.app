'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { ClipSpeedContextMenuSection } from '@/components/video/clip-speed-menu'
import { useVideoEditorStore } from '@/lib/video/store'
import type { ClipId } from '@socialista/types'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  PencilIcon,
  RotateCcwIcon,
  ScissorsIcon,
  Trash2Icon,
} from 'lucide-react'
import type { ReactNode } from 'react'

export type CanvasContextTarget =
  | { kind: 'clip'; clipId: ClipId }
  | { kind: 'overlay'; overlayId: string }
  | { kind: 'empty' }

type CanvasElementContextMenuProps = {
  children: ReactNode
  target: CanvasContextTarget | null
  onTargetChange: (target: CanvasContextTarget | null) => void
  onContextMenuResolve: (e: React.MouseEvent) => CanvasContextTarget
  onEditOverlay?: (overlayId: string) => void
}

export function CanvasElementContextMenu({
  children,
  target,
  onTargetChange,
  onContextMenuResolve,
  onEditOverlay,
}: CanvasElementContextMenuProps) {
  return (
    <ContextMenu onOpenChange={open => !open && onTargetChange(null)}>
      <ContextMenuTrigger
        asChild
        onContextMenu={e => {
          const resolved = onContextMenuResolve(e)
          onTargetChange(resolved)
        }}
      >
        {children}
      </ContextMenuTrigger>
      <CanvasContextMenuContent target={target} onEditOverlay={onEditOverlay} />
    </ContextMenu>
  )
}

function CanvasContextMenuContent({
  target,
  onEditOverlay,
}: {
  target: CanvasContextTarget | null
  onEditOverlay?: (overlayId: string) => void
}) {
  const playhead = useVideoEditorStore(s => s.playhead)
  const clips = useVideoEditorStore(s => s.project.clips)
  const overlays = useVideoEditorStore(s => s.project.textOverlays)
  const tracks = useVideoEditorStore(s => s.project.tracks)
  const splitClip = useVideoEditorStore(s => s.splitClip)
  const splitOverlay = useVideoEditorStore(s => s.splitOverlay)
  const duplicateClip = useVideoEditorStore(s => s.duplicateClip)
  const duplicateOverlay = useVideoEditorStore(s => s.duplicateOverlay)
  const removeClip = useVideoEditorStore(s => s.removeClip)
  const removeOverlay = useVideoEditorStore(s => s.removeOverlay)
  const resetClipTransform = useVideoEditorStore(s => s.resetClipTransform)
  const resetOverlayTransform = useVideoEditorStore(s => s.resetOverlayTransform)
  const bringOverlayToFront = useVideoEditorStore(s => s.bringOverlayToFront)
  const sendOverlayToBack = useVideoEditorStore(s => s.sendOverlayToBack)

  if (!target) return null

  if (target.kind === 'clip') {
    const clip = clips[target.clipId]
    if (!clip) return null
    const track = tracks.find(t => t.id === clip.trackId)
    const locked = track?.locked ?? false
    const localTime = playhead - clip.startTime
    const canSplit = !locked && localTime > 0 && localTime < clip.duration
    const hasTransform = clip.type !== 'audio' && clip.transform !== undefined

    return (
      <ContextMenuContent className="w-52">
        <ContextMenuLabel className="truncate">{clip.type === 'image' ? 'Image' : 'Video'} clip</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={!canSplit} onSelect={() => splitClip(target.clipId, playhead)}>
          <ScissorsIcon />
          Split at playhead
          <ContextMenuShortcut>S</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled={locked} onSelect={() => duplicateClip(target.clipId)}>
          <CopyIcon />
          Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ClipSpeedContextMenuSection clipId={target.clipId} disabled={locked} />
        {clip.type !== 'audio' ? (
          <ContextMenuItem disabled={!hasTransform} onSelect={() => resetClipTransform(target.clipId)}>
            <RotateCcwIcon />
            Reset transform
          </ContextMenuItem>
        ) : null}
        <ContextMenuSeparator />
        <ContextMenuItem disabled={locked} variant="destructive" onSelect={() => removeClip(target.clipId)}>
          <Trash2Icon />
          Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    )
  }

  if (target.kind === 'overlay') {
    const overlay = overlays.find(o => o.id === target.overlayId)
    if (!overlay) return null
    const canSplit = playhead > overlay.startTime + 0.05 && playhead < overlay.endTime - 0.05

    return (
      <ContextMenuContent className="w-52">
        <ContextMenuLabel className="truncate">{overlay.content || 'Text overlay'}</ContextMenuLabel>
        <ContextMenuItem onSelect={() => onEditOverlay?.(target.overlayId)}>
          <PencilIcon />
          Edit text
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => duplicateOverlay(target.overlayId)}>
          <CopyIcon />
          Duplicate
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => bringOverlayToFront(target.overlayId)}>
          <ArrowUpIcon />
          Bring to front
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => sendOverlayToBack(target.overlayId)}>
          <ArrowDownIcon />
          Send to back
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => resetOverlayTransform(target.overlayId)}>
          <RotateCcwIcon />
          Reset transform
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled={!canSplit} onSelect={() => splitOverlay(target.overlayId, playhead)}>
          <ScissorsIcon />
          Split at playhead
          <ContextMenuShortcut>S</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onSelect={() => removeOverlay(target.overlayId)}>
          <Trash2Icon />
          Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    )
  }

  return null
}
