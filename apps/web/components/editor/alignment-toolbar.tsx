'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { AlignAxis, AlignEdge } from '@/lib/editor/alignment'
import {
  AlignCenterHorizontalIcon,
  AlignCenterVerticalIcon,
  AlignEndHorizontalIcon,
  AlignEndVerticalIcon,
  AlignHorizontalDistributeCenterIcon,
  AlignStartHorizontalIcon,
  AlignStartVerticalIcon,
  AlignVerticalDistributeCenterIcon,
  MagnetIcon,
  RulerIcon,
  ScanIcon,
} from 'lucide-react'

export type AlignmentAction =
  | { type: 'center'; axis: AlignAxis }
  | { type: 'edge'; edge: AlignEdge }
  | { type: 'distribute'; axis: 'x' | 'y' }

type AlignmentToolbarProps = {
  onAlign?: (action: AlignmentAction) => void
  canDistribute?: boolean
  rulersVisible?: boolean
  onToggleRulers?: () => void
  guidesVisible?: boolean
  onToggleGuides?: () => void
  snapEnabled?: boolean
  onToggleSnap?: () => void
  showToggles?: boolean
  showDistribute?: boolean
  /** `floating` = compact glass pill; `inline` = panel-friendly strip */
  variant?: 'floating' | 'inline'
  className?: string
  size?: 'sm' | 'xs'
}

export function AlignmentToolbar({
  onAlign,
  canDistribute = false,
  rulersVisible,
  onToggleRulers,
  guidesVisible,
  onToggleGuides,
  snapEnabled,
  onToggleSnap,
  showToggles = true,
  showDistribute = true,
  variant = 'floating',
  className,
  size = 'sm',
}: AlignmentToolbarProps) {
  const iconClass = size === 'xs' ? 'size-3' : 'size-3.5'
  const btnClass = size === 'xs' ? 'size-6' : 'size-7'
  const hasAlign = Boolean(onAlign)
  const hasToggles = showToggles && Boolean(onToggleRulers || onToggleGuides || onToggleSnap)

  if (!hasAlign && !hasToggles) return null

  return (
    <div
      data-alignment-toolbar
      className={cn(
        'pointer-events-auto flex items-center gap-0.5',
        variant === 'floating'
          ? 'rounded-full border border-border/60 bg-background/95 p-0.5 shadow-sm backdrop-blur-md'
          : 'w-full flex-wrap justify-center gap-0.5 rounded-lg border border-border/50 bg-muted/20 p-1',
        className,
      )}
      role="toolbar"
      aria-label="Alignment"
    >
      {onAlign ? (
        <>
          <AlignButton
            label="Align left"
            className={btnClass}
            onClick={() => onAlign({ type: 'edge', edge: 'left' })}
          >
            <AlignStartVerticalIcon className={iconClass} />
          </AlignButton>
          <AlignButton
            label="Center horizontally (H)"
            className={btnClass}
            onClick={() => onAlign({ type: 'center', axis: 'horizontal' })}
          >
            <AlignCenterVerticalIcon className={iconClass} />
          </AlignButton>
          <AlignButton
            label="Align right"
            className={btnClass}
            onClick={() => onAlign({ type: 'edge', edge: 'right' })}
          >
            <AlignEndVerticalIcon className={iconClass} />
          </AlignButton>

          <Separator orientation="vertical" className="mx-0.5 h-4 shrink-0" />

          <AlignButton
            label="Align top"
            className={btnClass}
            onClick={() => onAlign({ type: 'edge', edge: 'top' })}
          >
            <AlignStartHorizontalIcon className={iconClass} />
          </AlignButton>
          <AlignButton
            label="Center vertically (V)"
            className={btnClass}
            onClick={() => onAlign({ type: 'center', axis: 'vertical' })}
          >
            <AlignCenterHorizontalIcon className={iconClass} />
          </AlignButton>
          <AlignButton
            label="Align bottom"
            className={btnClass}
            onClick={() => onAlign({ type: 'edge', edge: 'bottom' })}
          >
            <AlignEndHorizontalIcon className={iconClass} />
          </AlignButton>

          {showDistribute ? (
            <>
              <Separator orientation="vertical" className="mx-0.5 h-4 shrink-0" />
              <AlignButton
                label="Distribute horizontally"
                className={btnClass}
                disabled={!canDistribute}
                onClick={() => onAlign({ type: 'distribute', axis: 'x' })}
              >
                <AlignHorizontalDistributeCenterIcon className={iconClass} />
              </AlignButton>
              <AlignButton
                label="Distribute vertically"
                className={btnClass}
                disabled={!canDistribute}
                onClick={() => onAlign({ type: 'distribute', axis: 'y' })}
              >
                <AlignVerticalDistributeCenterIcon className={iconClass} />
              </AlignButton>
            </>
          ) : null}
        </>
      ) : null}

      {hasToggles ? (
        <>
          {hasAlign ? <Separator orientation="vertical" className="mx-0.5 h-4 shrink-0" /> : null}
          {onToggleRulers ? (
            <AlignButton
              label={rulersVisible ? 'Hide rulers (⌘R)' : 'Show rulers (⌘R)'}
              className={btnClass}
              pressed={rulersVisible}
              onClick={onToggleRulers}
            >
              <RulerIcon className={iconClass} />
            </AlignButton>
          ) : null}
          {onToggleGuides ? (
            <AlignButton
              label={guidesVisible ? 'Hide center guides (⌘;)' : 'Show center guides (⌘;)'}
              className={btnClass}
              pressed={guidesVisible}
              onClick={onToggleGuides}
            >
              <ScanIcon className={iconClass} />
            </AlignButton>
          ) : null}
          {onToggleSnap ? (
            <AlignButton
              label={snapEnabled ? 'Disable snap (⇧⌘G)' : 'Enable snap (⇧⌘G)'}
              className={btnClass}
              pressed={snapEnabled}
              onClick={onToggleSnap}
            >
              <MagnetIcon className={iconClass} />
            </AlignButton>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function AlignButton({
  label,
  children,
  onClick,
  disabled,
  pressed,
  className,
}: {
  label: string
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  pressed?: boolean
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className={cn(
            'shrink-0 rounded-full text-muted-foreground hover:text-foreground',
            pressed && 'bg-primary/15 text-primary',
            className,
          )}
          onPointerDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation()
            onClick()
          }}
          disabled={disabled}
          aria-label={label}
          aria-pressed={pressed}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
