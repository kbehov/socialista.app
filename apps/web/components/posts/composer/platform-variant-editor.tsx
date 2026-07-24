'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { AccountSummary } from '@socialista/types'
import { RotateCcwIcon } from 'lucide-react'

import { getPlatformLimits } from './platform-limits'
import type { ComposerVariant } from './composer-types'

type PlatformVariantEditorProps = {
  account: AccountSummary
  commonCaption: string
  variant: ComposerVariant
  onChange: (patch: Partial<Omit<ComposerVariant, 'accountId'>>) => void
  onClearField: (field: 'caption' | 'description' | 'altText') => void
  className?: string
}

export function PlatformVariantEditor({
  account,
  commonCaption,
  variant,
  onChange,
  onClearField,
  className,
}: PlatformVariantEditorProps) {
  const limits = getPlatformLimits(account.provider)
  const usingCommonCaption = !variant.caption.trim()
  const captionValue = usingCommonCaption ? commonCaption : variant.caption
  const captionLength = captionValue.length
  const overLimit = captionLength > limits.captionMax

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={`caption-${account._id}`} className="text-xs font-medium">
            Caption
          </Label>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-[11px] tabular-nums',
                overLimit ? 'font-medium text-destructive' : 'text-muted-foreground',
              )}
            >
              {captionLength}/{limits.captionMax}
            </span>
            {!usingCommonCaption ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground"
                onClick={() => onClearField('caption')}
              >
                <RotateCcwIcon className="size-3" strokeWidth={1.75} />
                Use common
              </Button>
            ) : (
              <span className="text-[11px] text-muted-foreground">Using common</span>
            )}
          </div>
        </div>
        <Textarea
          id={`caption-${account._id}`}
          value={captionValue}
          placeholder={commonCaption || 'Write a platform-specific caption…'}
          className={cn(
            'min-h-24 resize-y rounded-xl border-border/60 text-sm shadow-xs',
            overLimit && 'border-destructive/50 focus-visible:ring-destructive/30',
          )}
          onChange={event => onChange({ caption: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={`description-${account._id}`} className="text-xs font-medium">
            Description
          </Label>
          {variant.description.trim() ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground"
              onClick={() => onClearField('description')}
            >
              <RotateCcwIcon className="size-3" strokeWidth={1.75} />
              Clear
            </Button>
          ) : null}
        </div>
        <Textarea
          id={`description-${account._id}`}
          value={variant.description}
          placeholder="Optional longer description…"
          className="min-h-16 resize-y rounded-xl border-border/60 text-sm shadow-xs"
          onChange={event => onChange({ description: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={`alt-${account._id}`} className="text-xs font-medium">
            Alt text
          </Label>
          {variant.altText.trim() ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground"
              onClick={() => onClearField('altText')}
            >
              <RotateCcwIcon className="size-3" strokeWidth={1.75} />
              Clear
            </Button>
          ) : null}
        </div>
        <Input
          id={`alt-${account._id}`}
          value={variant.altText}
          placeholder="Accessibility description for images…"
          className="h-9 rounded-xl border-border/60 text-sm shadow-xs"
          onChange={event => onChange({ altText: event.target.value })}
        />
      </div>
    </div>
  )
}
