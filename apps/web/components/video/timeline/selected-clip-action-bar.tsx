'use client'

import { useClipAiOptional } from '@/components/video/ai/clip-ai-provider'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useVideoEditorStore } from '@/lib/video/store'
import { cn } from '@/lib/utils'
import type { ClipId } from '@socialista/types'
import { CopyIcon, Loader2Icon, ScissorsIcon, SparklesIcon, Trash2Icon } from 'lucide-react'

type SelectedClipActionBarProps = {
  clipId: ClipId
  variant?: 'toolbar' | 'floating'
  className?: string
}

function useClipActionState(clipId: ClipId) {
  const clip = useVideoEditorStore(s => s.project.clips[clipId])
  const asset = useVideoEditorStore(s => (clip ? s.assets[clip.assetId] : undefined))
  const track = useVideoEditorStore(s =>
    clip ? s.project.tracks.find(t => t.id === clip.trackId) : undefined,
  )
  const playhead = useVideoEditorStore(s => s.playhead)
  const clipAi = useClipAiOptional()

  if (!clip) return null

  const locked = track?.locked ?? false
  const localTime = playhead - clip.startTime
  const canSplit = !locked && localTime > 0 && localTime < clip.duration
  const aiMode = clipAi?.getClipAiMode(clipId) ?? null
  const canUseAi = clipAi?.canUseClipAi(clipId) ?? false
  const isAiProcessing = clipAi?.isProcessingClip(clipId) ?? false
  const aiLabel = aiMode === 'animate-image' ? 'Animate with AI' : 'Edit with AI'

  return {
    clip,
    asset,
    locked,
    canSplit,
    clipAi,
    canUseAi,
    isAiProcessing,
    aiLabel,
  }
}

export function SelectedClipActionBar({
  clipId,
  variant = 'toolbar',
  className,
}: SelectedClipActionBarProps) {
  const state = useClipActionState(clipId)
  const splitClip = useVideoEditorStore(s => s.splitClip)
  const duplicateClip = useVideoEditorStore(s => s.duplicateClip)
  const removeClip = useVideoEditorStore(s => s.removeClip)

  if (!state) return null

  const { clip, asset, locked, canSplit, clipAi, canUseAi, isAiProcessing, aiLabel } = state

  const handleSplit = () => {
    const playhead = useVideoEditorStore.getState().playhead
    splitClip(clipId, playhead)
  }

  const showAi = clip.type !== 'audio' && clipAi

  if (variant === 'floating') {
    if (!showAi) return null

    return (
      <div data-clip-actions className={cn('pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center', className)}>
        <div className="pointer-events-auto flex items-center gap-0.5 rounded-xl border bg-background/95 p-0.5 shadow-md backdrop-blur-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                className="h-8 gap-1.5 bg-primary/10 px-3 text-primary hover:bg-primary/15"
                onClick={() => clipAi.openClipAi(clipId)}
                disabled={!canUseAi || isAiProcessing}
              >
                {isAiProcessing ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : (
                  <SparklesIcon className="size-3.5" />
                )}
                {isAiProcessing ? 'Generating…' : aiLabel}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isAiProcessing ? 'Generating…' : aiLabel}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    )
  }

  return (
    <div
      data-clip-actions
      className={cn(
        'flex min-w-0 shrink-0 items-center gap-2 overflow-x-auto border-b bg-muted/30 px-2 py-1.5 sm:gap-3 sm:px-3',
        className,
      )}
    >
      <div className="min-w-0 shrink">
        <p className="truncate text-xs font-medium">{asset?.name ?? 'Clip'}</p>
        <p className="truncate text-[10px] text-muted-foreground">
          {clip.type === 'audio' ? 'Audio clip' : clip.type === 'image' ? 'Image clip' : 'Video clip'}
        </p>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        {showAi ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-7 gap-1.5 bg-primary/10 px-2.5 text-xs text-primary hover:bg-primary/15"
                onClick={() => clipAi.openClipAi(clipId)}
                disabled={!canUseAi || isAiProcessing}
              >
                {isAiProcessing ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : (
                  <SparklesIcon className="size-3.5" />
                )}
                <span className="hidden sm:inline">{isAiProcessing ? 'Generating…' : aiLabel}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isAiProcessing ? 'Generating…' : aiLabel}</TooltipContent>
          </Tooltip>
        ) : null}

        <ActionIconButton label="Split at playhead" onClick={handleSplit} disabled={!canSplit}>
          <ScissorsIcon className="size-3.5" />
        </ActionIconButton>

        <ActionIconButton label="Duplicate clip" onClick={() => duplicateClip(clipId)} disabled={locked}>
          <CopyIcon className="size-3.5" />
        </ActionIconButton>

        <ActionIconButton
          label="Delete clip"
          onClick={() => removeClip(clipId)}
          disabled={locked}
          destructive
        >
          <Trash2Icon className="size-3.5" />
        </ActionIconButton>
      </div>
    </div>
  )
}

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
          className={cn('size-7', destructive && 'text-destructive hover:text-destructive')}
          onClick={onClick}
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
