import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { dashboardSurface } from './surface'

export type DashboardSectionProps = {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  headerClassName?: string
  size?: 'default' | 'sm'
}

function DashboardSection({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  headerClassName,
  size = 'sm',
}: DashboardSectionProps) {
  const isSm = size === 'sm'
  const padding = isSm ? 'px-4' : 'px-5'
  const headerPad = isSm ? 'pb-3 pt-3.5' : 'pb-4 pt-5'
  const contentPad = isSm ? 'pb-4' : 'pb-5'

  return (
    <section data-slot="dashboard-section" className={cn(dashboardSurface.section, className)}>
      <header
        className={cn(
          'flex items-start justify-between gap-3',
          dashboardSurface.sectionHeader,
          padding,
          headerPad,
          headerClassName,
        )}
      >
        <div className="min-w-0 space-y-0.5">
          <h2 className={dashboardSurface.sectionTitle}>{title}</h2>
          {description ? <p className={dashboardSurface.sectionDescription}>{description}</p> : null}
        </div>
        {action ? <div className="shrink-0 self-center">{action}</div> : null}
      </header>
      <div className={cn(padding, contentPad, 'min-h-0 pt-3', contentClassName)}>{children}</div>
    </section>
  )
}

export { DashboardSection }
