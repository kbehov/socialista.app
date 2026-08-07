import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { dashboardSurface } from './surface'

export type DashboardSegmentProps = ComponentProps<'div'> & {
  label?: string
}

function DashboardSegment({ className, label, children, ...props }: DashboardSegmentProps) {
  return (
    <div
      data-slot="dashboard-segment"
      className={cn(dashboardSurface.segment, className)}
      role="tablist"
      aria-label={label}
      {...props}
    >
      {children}
    </div>
  )
}

export type DashboardSegmentItemProps = ComponentProps<'button'> & {
  active?: boolean
}

function DashboardSegmentButton({ active, className, type = 'button', ...props }: DashboardSegmentItemProps) {
  return (
    <button
      type={type}
      role="tab"
      aria-selected={active}
      className={cn(
        dashboardSurface.segmentItem,
        'inline-flex h-7 flex-row flex-nowrap items-center gap-1.5 px-2.5 whitespace-nowrap',
        active ? dashboardSurface.segmentItemActive : dashboardSurface.segmentItemInactive,
        className,
      )}
      {...props}
    />
  )
}

export type DashboardSegmentLinkProps = ComponentProps<'a'> & {
  active?: boolean
  children: ReactNode
}

function dashboardSegmentLinkClass(active?: boolean, className?: string) {
  return cn(
    'inline-flex h-7 items-center gap-1.5 px-2.5 whitespace-nowrap',
    dashboardSurface.segmentItem,
    active ? dashboardSurface.segmentItemActive : dashboardSurface.segmentItemInactive,
    className,
  )
}

export { DashboardSegment, DashboardSegmentButton, dashboardSegmentLinkClass }
