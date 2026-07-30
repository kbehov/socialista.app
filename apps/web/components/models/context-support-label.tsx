import { getContextSupportOption } from '@/lib/model-context-support'
import { cn } from '@/lib/utils'
import type { ContextSupport } from '@socialista/types'

type ContextSupportLabelsProps = {
  supports: ContextSupport[] | undefined
  className?: string
}

export function ContextSupportLabels({ supports, className }: ContextSupportLabelsProps) {
  const items = supports?.length ? supports : []

  if (items.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {items.map(support => {
        const option = getContextSupportOption(support)
        if (!option) {
          return (
            <span
              key={support}
              className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              {support}
            </span>
          )
        }

        const Icon = option.icon
        return (
          <span
            key={support}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-xs"
          >
            <Icon className="size-3 shrink-0 text-muted-foreground" aria-hidden />
            {option.label}
          </span>
        )
      })}
    </div>
  )
}
