import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { ImageIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { landingEyebrow } from '../landing-classes'

export type MockupNavItem = {
  id: string
  label: string
  icon: LucideIcon
}

type ProductMockupProps = {
  active?: string
  navItems: MockupNavItem[]
  children: ReactNode
  inspector?: ReactNode
  title?: string
  actionLabel?: string
  className?: string
}

export function ProductMockup({
  active,
  navItems,
  children,
  inspector,
  title = 'Studio',
  actionLabel = 'Generate',
  className,
}: ProductMockupProps) {
  const activeId = active ?? navItems[0]?.id

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[calc(var(--radius)+6px)] border border-border bg-surface-0 shadow-[0_0_0_1px_color-mix(in_oklch,var(--border)_60%,transparent),0_1px_2px_color-mix(in_oklch,var(--foreground)_4%,transparent),0_24px_48px_-20px_color-mix(in_oklch,var(--foreground)_14%,transparent)]',
        className,
      )}
      aria-hidden="true"
    >
      <div className="grid min-h-[22rem] grid-cols-[2.75rem_1fr] md:min-h-[26rem] md:grid-cols-[11rem_1fr_10rem]">
        <aside className="flex flex-col gap-1.5 border-r border-border bg-background p-2 px-2 py-3">
          <div className="mb-2 flex items-center gap-1.5 px-1">
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
          </div>
          <p className={`${landingEyebrow} hidden px-2 py-1 md:block`}>Studio</p>
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = item.id === activeId
            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-2 rounded-[calc(var(--radius)-2px)] p-1.5 text-muted-foreground md:px-2 md:py-1.5',
                  isActive && 'bg-surface-1 text-foreground',
                )}
              >
                <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                <span className="hidden text-xs font-medium md:block">{item.label}</span>
              </div>
            )
          })}
        </aside>

        <div className="flex min-w-0 flex-col bg-background">
          <div className="flex items-center justify-between gap-3 border-b border-border px-3.5 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <ImageIcon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <span className="truncate text-xs font-medium">{title}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="hidden rounded-md border border-border px-2 py-0.5 text-[0.625rem] font-medium text-muted-foreground sm:inline">
                Draft
              </span>
              <span className="rounded-md bg-foreground px-2 py-0.5 text-[0.625rem] font-medium text-background">
                {actionLabel}
              </span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden p-3.5">{children}</div>
        </div>

        {inspector ? (
          <aside className="hidden flex-col gap-3 border-l border-border bg-background p-3 md:flex">{inspector}</aside>
        ) : null}
      </div>
    </div>
  )
}
