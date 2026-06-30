import { getModelTypeOption } from '@/lib/model-type'
import { cn } from '@/lib/utils'
import type { ModelType } from '@socialista/types'

type ModelTypeIconProps = {
  type: ModelType
  className?: string
}

export function ModelTypeIcon({ type, className }: ModelTypeIconProps) {
  const option = getModelTypeOption(type)
  if (!option) return null

  const Icon = option.icon
  return <Icon className={cn('size-4 shrink-0', className)} aria-hidden />
}

type ModelTypeLabelProps = {
  type: ModelType
  className?: string
  iconClassName?: string
}

export function ModelTypeLabel({ type, className, iconClassName }: ModelTypeLabelProps) {
  const option = getModelTypeOption(type)
  if (!option) return <span className={className}>{type}</span>

  const Icon = option.icon

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <Icon className={cn('size-4 shrink-0 text-muted-foreground', iconClassName)} aria-hidden />
      <span>{option.label}</span>
    </span>
  )
}
