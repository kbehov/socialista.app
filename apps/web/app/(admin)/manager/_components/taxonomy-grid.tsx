import { EmptyState } from '@/components/common/empty-state'
import { dashboardSurface } from '@/components/dashboard'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { TagsIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type TaxonomyItem = {
  _id: string
  name: string
  icon?: string
  count?: number
}

type TaxonomyGridProps = {
  items: TaxonomyItem[]
  emptyIcon?: LucideIcon
  emptyTitle: string
  emptyDescription: string
  emptyAction?: ReactNode
  countLabel?: (count: number) => string
}

export function TaxonomyGrid({
  items,
  emptyIcon: EmptyIcon = TagsIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  countLabel,
}: TaxonomyGridProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        minHeight="lg"
        icon={EmptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        variant="hero"
        iconClassName={dashboardSurface.emptyIcon}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(item => {
        const count = item.count
        const meta = typeof count === 'number' && countLabel ? countLabel(count) : null

        return (
          <div
            key={item._id}
            className={cn(
              'flex items-center gap-2.5 rounded-lg border border-transparent px-2 py-2',
              'transition-colors duration-150 hover:border-border/55 hover:bg-muted/30',
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/50 text-base leading-none">
              {item.icon ? <span aria-hidden>{item.icon}</span> : <TagsIcon className="size-3.5 text-muted-foreground" strokeWidth={1.5} />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium tracking-tight">{item.name}</p>
              {meta ? <p className="truncate text-xs text-muted-foreground">{meta}</p> : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
