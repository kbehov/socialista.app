'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ClipSpeedDropdown } from '@/components/video/clip-speed-menu'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useVideoEditorStore } from '@/lib/video/store'
import { cn } from '@/lib/utils'
import type { ClipId } from '@socialista/types'
import {
  CopyIcon,
  PencilIcon,
  RotateCcwIcon,
  ScissorsIcon,
  Trash2Icon,
} from 'lucide-react'

function ActionIconButton({
  label,
  onClick,
  disabled,
  destructive,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className={cn(
            'video-studio-press size-7',
            destructive && 'text-destructive hover:text-destructive',
          )}
          onClick={onClick}
          onPointerDown={e => e.stopPropagation()}
          disabled={disabled}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function ClipToolbar({ clipId }: { clipId: ClipId }) {
  const clip = useVideoEditorStore(s => s.project.clips[clipId])
  const track = useVideoEditorStore(s =>
    clip ? s.project.tracks.find(t => t.id === clip.trackId) : undefined,
  )
  const playhead = useVideoEditorStore(s => s.playhead)
  const splitClip = useVideoEditorStore(s => s.splitClip)
  const duplicateClip = useVideoEditorStore(s => s.duplicateClip)
  const removeClip = useVideoEditorStore(s => s.removeClip)
  const resetClipTransform = useVideoEditorStore(s => s.resetClipTransform)

  if (!clip) return null

  const locked = track?.locked ?? false
  const localTime = playhead - clip.startTime
  const canSplit = !locked && localTime > 0 && localTime < clip.duration

  return (
    <>
      <ActionIconButton
        label="Split at playhead"
        onClick={() => splitClip(clipId, useVideoEditorStore.getState().playhead)}
        disabled={!canSplit}
      >
        <ScissorsIcon className="size-3.5" />
      </ActionIconButton>
      <ClipSpeedDropdown clipId={clipId} disabled={locked} />
      <ActionIconButton label="Duplicate clip" onClick={() => duplicateClip(clipId)} disabled={locked}>
        <CopyIcon className="size-3.5" />
      </ActionIconButton>
      {clip.type !== 'audio' && clip.transform ? (
        <ActionIconButton label="Reset transform" onClick={() => resetClipTransform(clipId)}>
          <RotateCcwIcon className="size-3.5" />
        </ActionIconButton>
      ) : null}
      <ActionIconButton label="Delete clip" onClick={() => removeClip(clipId)} disabled={locked} destructive>
        <Trash2Icon className="size-3.5" />
      </ActionIconButton>
    </>
  )
}

function OverlayToolbar({
  overlayId,
  onEditText,
}: {
  overlayId: string
  onEditText?: () => void
}) {
  const overlay = useVideoEditorStore(s => s.project.textOverlays.find(o => o.id === overlayId))
  const duplicateOverlay = useVideoEditorStore(s => s.duplicateOverlay)
  const removeOverlay = useVideoEditorStore(s => s.removeOverlay)
  const splitOverlay = useVideoEditorStore(s => s.splitOverlay)
  const playhead = useVideoEditorStore(s => s.playhead)

  if (!overlay) return null

  const canSplit = playhead > overlay.startTime && playhead < overlay.endTime

  return (
    <>
      <ActionIconButton label="Edit text" onClick={() => onEditText?.()}>
        <PencilIcon className="size-3.5" />
      </ActionIconButton>
      <ActionIconButton
        label="Split at playhead"
        onClick={() => splitOverlay(overlayId, playhead)}
        disabled={!canSplit}
      >
        <ScissorsIcon className="size-3.5" />
      </ActionIconButton>
      <ActionIconButton label="Duplicate" onClick={() => duplicateOverlay(overlayId)}>
        <CopyIcon className="size-3.5" />
      </ActionIconButton>
      <ActionIconButton label="Delete" onClick={() => removeOverlay(overlayId)} destructive>
        <Trash2Icon className="size-3.5" />
      </ActionIconButton>
    </>
  )
}

type SelectionToolbarProps = {
  className?: string
  onEditOverlayText?: (overlayId: string) => void
}

/** Unified floating selection toolbar — clips and text overlays. */
export function SelectionToolbar({ className, onEditOverlayText }: SelectionToolbarProps) {
  const selectedClipId = useVideoEditorStore(s => s.selectedClipId)
  const selectedOverlayId = useVideoEditorStore(s => s.selectedOverlayId)
  const isPlaying = useVideoEditorStore(s => s.isPlaying)
  const reduceMotion = useReducedMotion()

  const active = !isPlaying && (selectedClipId || selectedOverlayId)

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          key={selectedClipId ?? selectedOverlayId ?? 'none'}
          data-clip-actions
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.96 }}
          transition={
            reduceMotion
              ? { duration: 0.12 }
              : { type: 'spring', bounce: 0, duration: 0.3 }
          }
          className={cn('pointer-events-auto flex w-auto shrink-0 justify-center', className)}
          onPointerDown={e => e.stopPropagation()}
        >
          <div
            className="video-studio-glass flex w-auto shrink-0 items-center gap-0.5 rounded-xl p-0.5 shadow-md"
            onPointerDown={e => e.stopPropagation()}
          >
            {selectedClipId ? <ClipToolbar clipId={selectedClipId} /> : null}
            {selectedOverlayId ? (
              <OverlayToolbar
                overlayId={selectedOverlayId}
                onEditText={() => onEditOverlayText?.(selectedOverlayId)}
              />
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
