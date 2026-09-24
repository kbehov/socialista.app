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
      <p className="text-[0.8125rem] font-medium leading-[1.3] tracking-[-0.011em] text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 text-xs leading-[1.45] tracking-[-0.006em] text-muted-foreground">{description}</p>
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
    <section className={cn('flex flex-col gap-3', className)}>
      {title || action ? (
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            {title ? (
              <h3 className="text-xs font-medium leading-[1.3] tracking-[-0.011em] text-muted-foreground">{title}</h3>
            ) : null}
            {description ? (
              <p className="mt-1 text-xs leading-[1.45] tracking-[-0.006em] text-muted-foreground/80">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : description ? (
        <p className="text-xs leading-[1.45] tracking-[-0.006em] text-muted-foreground/80">{description}</p>
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
  children,
  className,
}: {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('px-0.5 py-6', className)}>
      <p className="text-[0.8125rem] font-medium leading-[1.3] tracking-[-0.018em] text-foreground">{title}</p>
      {description ? (
        <p className="mt-2 max-w-72 text-xs leading-normal text-muted-foreground">{description}</p>
      ) : null}
      {children}
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
  return (
    <div
      className={cn('editor-segment', className)}
      data-size={size}
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
            className="editor-segment-tab"
          >
            {Icon ? <Icon strokeWidth={1.5} /> : null}
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
      <div className={cn('flex flex-col gap-6 p-4 pb-6', contentClassName)}>{children}</div>
    </ScrollArea>
  )
}

/** @deprecated Use EditorPanelScrollArea */
export const StudioPanelScrollArea = EditorPanelScrollArea
