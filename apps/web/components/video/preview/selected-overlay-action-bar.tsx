'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAiComingSoonOptional } from '@/components/video/ai/ai-coming-soon-dialog'
import { useVideoEditorStore } from '@/lib/video/store'
import { cn } from '@/lib/utils'
import { CopyIcon, PencilIcon, SparklesIcon, Trash2Icon } from 'lucide-react'

type SelectedOverlayActionBarProps = {
  overlayId: string
  variant?: 'toolbar' | 'floating'
  className?: string
  onEditText?: () => void
}

export function SelectedOverlayActionBar({
  overlayId,
  variant = 'floating',
  className,
  onEditText,
}: SelectedOverlayActionBarProps) {
  const overlay = useVideoEditorStore(s => s.project.textOverlays.find(o => o.id === overlayId))
  const duplicateOverlay = useVideoEditorStore(s => s.duplicateOverlay)
  const removeOverlay = useVideoEditorStore(s => s.removeOverlay)
  const aiComingSoon = useAiComingSoonOptional()

  if (!overlay) return null

  if (variant === 'floating') {
    return (
      <div
        data-clip-actions
        className={cn('flex w-auto shrink-0 justify-center', className)}
        onPointerDown={e => e.stopPropagation()}
      >
        <div
          className="flex w-auto shrink-0 items-center gap-0.5 rounded-xl border bg-background p-0.5 shadow-md"
          onPointerDown={e => e.stopPropagation()}
        >
          <ActionIconButton label="Edit text" onClick={() => onEditText?.()}>
            <PencilIcon className="size-3.5" />
          </ActionIconButton>
          {aiComingSoon ? (
            <ActionIconButton label="Generate caption" onClick={() => aiComingSoon.open('smart-text')}>
              <SparklesIcon className="size-3.5 text-primary" />
            </ActionIconButton>
          ) : null}
          <ActionIconButton label="Duplicate" onClick={() => duplicateOverlay(overlayId)}>
            <CopyIcon className="size-3.5" />
          </ActionIconButton>
          <ActionIconButton label="Delete" onClick={() => removeOverlay(overlayId)} destructive>
            <Trash2Icon className="size-3.5" />
          </ActionIconButton>
        </div>
      </div>
    )
  }

  return (
    <div
      data-clip-actions
      className={cn(
        'flex min-w-0 shrink-0 items-center gap-2 overflow-x-auto border-b bg-background px-2 py-1 sm:gap-2.5 sm:px-2.5',
        className,
      )}
    >
      <div className="min-w-0 shrink">
        <p className="truncate text-xs font-medium">{overlay.content || 'Text overlay'}</p>
        <p className="truncate text-[10px] text-muted-foreground">Text layer</p>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        <ActionIconButton label="Edit text" onClick={() => onEditText?.()}>
          <PencilIcon className="size-3.5" />
        </ActionIconButton>
        {aiComingSoon ? (
          <ActionIconButton label="Generate caption" onClick={() => aiComingSoon.open('smart-text')}>
            <SparklesIcon className="size-3.5 text-primary" />
          </ActionIconButton>
        ) : null}
        <ActionIconButton label="Duplicate" onClick={() => duplicateOverlay(overlayId)}>
          <CopyIcon className="size-3.5" />
        </ActionIconButton>
        <ActionIconButton label="Delete" onClick={() => removeOverlay(overlayId)} destructive>
          <Trash2Icon className="size-3.5" />
        </ActionIconButton>
      </div>
    </div>
  )
}

function ActionIconButton({
  label,
  onClick,
  destructive,
  children,
}: {
  label: string
  onClick: () => void
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
          onPointerDown={e => e.stopPropagation()}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
