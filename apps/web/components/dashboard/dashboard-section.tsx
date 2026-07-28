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
  const padding = size === 'sm' ? 'px-4' : 'px-6'
  const headerPad = size === 'sm' ? 'pb-3 pt-4' : 'pb-4 pt-6'
  const contentPad = size === 'sm' ? 'pb-4' : 'pb-6'

  return (
    <section data-slot="dashboard-section" className={cn(dashboardSurface.section, className)}>
      <header
        className={cn(
          'grid auto-rows-min items-start gap-1',
          dashboardSurface.sectionHeader,
          padding,
          headerPad,
          description && 'grid-rows-[auto_auto]',
          action && 'grid-cols-[1fr_auto]',
          headerClassName,
        )}
      >
        <h2 className={dashboardSurface.sectionTitle}>{title}</h2>
        {description ? <p className={dashboardSurface.sectionDescription}>{description}</p> : null}
        {action ? <div className="col-start-2 row-span-2 row-start-1 justify-self-end">{action}</div> : null}
      </header>
      <div className={cn(padding, contentPad, 'min-h-0 pt-0', contentClassName)}>{children}</div>
    </section>
  )
}

export { DashboardSection }
