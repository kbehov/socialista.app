'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { ComponentType, ReactNode } from 'react'

type TabIcon = ComponentType<{ className?: string; strokeWidth?: number }>

type EditorSegmentedTab<T extends string> = {
  id: T
  label: string
  icon?: TabIcon
}

export function EditorPanelHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[13px] font-semibold leading-snug tracking-[-0.015em] text-foreground">
        {title}
      </p>
      {description ? (
        <p className="mt-0.5 text-[11px] leading-[1.4] tracking-[0.005em] text-muted-foreground/85">
          {description}
        </p>
      ) : null}
    </div>
  )
}

/** @deprecated Use EditorPanelHeader */
export const StudioPanelHeader = EditorPanelHeader

export function EditorPanelSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('flex flex-col gap-2.5', className)}>
      {title || action ? (
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            {title ? (
              <h3 className="text-[11px] font-medium tracking-[0.02em] text-muted-foreground">{title}</h3>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-[11px] leading-[1.45] text-muted-foreground/80">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : description ? (
        <p className="text-[11px] leading-[1.45] text-muted-foreground/80">{description}</p>
      ) : null}
      {children}
    </section>
  )
}

/** @deprecated Use EditorPanelSection */
export const StudioPanelSection = EditorPanelSection

export function EditorEmptyState({
  title,
  description,
  className,
}: {
  title: string
  description?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/15 px-4 py-8 text-center',
        className,
      )}
    >
      <p className="text-[12px] font-medium tracking-tight text-foreground/80">{title}</p>
      {description ? (
        <p className="mt-1 max-w-[18rem] text-[11px] leading-[1.45] text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

/** @deprecated Use EditorEmptyState */
export const StudioEmptyState = EditorEmptyState

export function EditorSegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  size = 'sm',
  className,
  ariaLabel = 'Panel sections',
}: {
  tabs: EditorSegmentedTab<T>[]
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

/** @deprecated Use EditorSegmentedTabs */
export const StudioSegmentedTabs = EditorSegmentedTabs

export function EditorPanelScrollArea({
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
      <div className={cn('flex flex-col gap-5 p-3.5 pb-5', contentClassName)}>{children}</div>
    </ScrollArea>
  )
}

/** @deprecated Use EditorPanelScrollArea */
export const StudioPanelScrollArea = EditorPanelScrollArea
