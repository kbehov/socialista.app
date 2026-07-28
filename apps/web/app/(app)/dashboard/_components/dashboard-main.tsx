'use client'

import { PageScrollCompactProvider } from '@/components/headers/page-scroll-compact'
import { dashboardMainClassName } from '../_lib/studio-shell'

type DashboardMainProps = {
  children: React.ReactNode
}

export function DashboardMain({ children }: DashboardMainProps) {
  return (
    <main data-dashboard-scroll className={dashboardMainClassName}>
      <PageScrollCompactProvider>{children}</PageScrollCompactProvider>
    </main>
  )
}
