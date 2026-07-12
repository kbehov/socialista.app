'use client'

import { Button } from '@/components/ui/button'
import {
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CLIP_SPEED_PRESETS, clipSpeedLabel, formatClipSpeed } from '@/lib/video/defaults'
import { useVideoEditorStore } from '@/lib/video/store'
import { cn } from '@/lib/utils'
import type { ClipId } from '@socialista/types'
import { GaugeIcon } from 'lucide-react'

type ClipSpeedMenuProps = {
  clipId: ClipId
  disabled?: boolean
}

function useClipSpeedState(clipId: ClipId) {
  const clip = useVideoEditorStore(s => s.project.clips[clipId])
  const setClipSpeed = useVideoEditorStore(s => s.setClipSpeed)

  if (!clip || clip.type === 'audio') return null

  const currentSpeed = clip.speed ?? 1
  const presetValue = CLIP_SPEED_PRESETS.find(s => s === currentSpeed)

  return {
    currentSpeed,
    presetValue: presetValue !== undefined ? String(presetValue) : undefined,
    setSpeed: (speed: number) => setClipSpeed(clipId, speed),
  }
}

export function ClipSpeedContextMenuSection({ clipId, disabled }: ClipSpeedMenuProps) {
  const state = useClipSpeedState(clipId)
  if (!state) return null

  const { currentSpeed, presetValue, setSpeed } = state

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger disabled={disabled}>
        <GaugeIcon />
        Speed
        <span className="ml-auto text-xs text-muted-foreground">{formatClipSpeed(currentSpeed)}</span>
      </ContextMenuSubTrigger>
      <ContextMenuSubContent className="w-40">
        <ContextMenuRadioGroup
          value={presetValue}
          onValueChange={value => setSpeed(parseFloat(value))}
        >
          {CLIP_SPEED_PRESETS.map(speed => (
            <ContextMenuRadioItem key={speed} value={String(speed)} disabled={disabled}>
              {clipSpeedLabel(speed)}
            </ContextMenuRadioItem>
          ))}
        </ContextMenuRadioGroup>
      </ContextMenuSubContent>
    </ContextMenuSub>
  )
}

export function ClipSpeedDropdown({
  clipId,
  disabled,
  className,
}: ClipSpeedMenuProps & { className?: string }) {
  const state = useClipSpeedState(clipId)
  if (!state) return null

  const { currentSpeed, presetValue, setSpeed } = state

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={cn('h-7 gap-1.5 px-2 text-xs tabular-nums', className)}
              disabled={disabled}
              onPointerDown={e => e.stopPropagation()}
            >
              <GaugeIcon className="size-3.5" />
              <span>{formatClipSpeed(currentSpeed)}</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Playback speed</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuRadioGroup
          value={presetValue}
          onValueChange={value => setSpeed(parseFloat(value))}
        >
          {CLIP_SPEED_PRESETS.map(speed => (
            <DropdownMenuRadioItem key={speed} value={String(speed)} disabled={disabled}>
              {clipSpeedLabel(speed)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
