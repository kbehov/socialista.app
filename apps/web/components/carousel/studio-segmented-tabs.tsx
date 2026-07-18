'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { ComponentType, ReactNode } from 'react'

type TabIcon = ComponentType<{ className?: string; strokeWidth?: number }>

type StudioSegmentedTab<T extends string> = {
  id: T
  label: string
  icon?: TabIcon
}

export function StudioPanelHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <p className="text-[13px] font-medium tracking-tight text-foreground">{title}</p>
      {description ? <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{description}</p> : null}
    </div>
  )
}

export function StudioSegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  size = 'sm',
  className,
  ariaLabel = 'Panel sections',
}: {
  tabs: StudioSegmentedTab<T>[]
  value: T | null
  onChange: (id: T) => void
  size?: 'xs' | 'sm'
  className?: string
  ariaLabel?: string
}) {
  const isXs = size === 'xs'

  return (
    <div
      className={cn('flex gap-0.5 rounded-lg bg-muted/25 p-0.5', className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            role="tab"
            id={`studio-tab-${id}`}
            aria-selected={active}
            aria-controls={`studio-tabpanel-${id}`}
            tabIndex={active || value == null ? 0 : -1}
            onClick={() => onChange(id)}
            onKeyDown={event => {
              const currentIndex = Math.max(
                0,
                tabs.findIndex(tab => tab.id === (value ?? tabs[0]?.id)),
              )
              if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault()
                const next = tabs[(currentIndex + 1) % tabs.length]
                if (next) onChange(next.id)
              }
              if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault()
                const prev = tabs[(currentIndex - 1 + tabs.length) % tabs.length]
                if (prev) onChange(prev.id)
              }
            }}
            className={cn(
              'flex min-w-0 flex-1 items-center justify-center rounded-md font-medium transition-colors duration-150',
              isXs ? 'h-7 gap-1 px-1 text-[11px]' : 'h-8 gap-1.5 px-2 text-xs',
              active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {Icon ? (
              <Icon className={cn('shrink-0', isXs ? 'size-3' : 'size-3.5')} strokeWidth={active ? 2 : 1.75} />
            ) : null}
            <span className="truncate">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function StudioPanelScrollArea({
  children,
  className,
  contentClassName,
}: {
  children: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <ScrollArea className={cn('min-h-0 flex-1 bg-background', className)}>
      <div className={cn('flex flex-col gap-3 p-3', contentClassName)}>{children}</div>
    </ScrollArea>
  )
}
