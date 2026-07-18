import { dashboardMainClassName } from '../_lib/studio-shell'

type DashboardMainProps = {
  children: React.ReactNode
}

export function DashboardMain({ children }: DashboardMainProps) {
  return <main className={dashboardMainClassName}>{children}</main>
}
