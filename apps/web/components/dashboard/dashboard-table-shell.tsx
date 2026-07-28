import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

import { dashboardSurface } from './surface'

export type DashboardTableShellProps = ComponentProps<'div'>

function DashboardTableShell({ className, ...props }: DashboardTableShellProps) {
  return <div data-slot="dashboard-table-shell" className={cn(dashboardSurface.tableShell, className)} {...props} />
}

export { DashboardTableShell }
