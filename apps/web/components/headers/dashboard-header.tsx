import Logo from '@/components/common/logo'
import { UserDropdown } from '@/components/common/user-dropdown'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { ThemeToggle } from '@/components/theme-toggle'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { WorkspaceBalanceHeader } from '@/components/workspace-balance-header'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'

type DashboardHeaderProps = {
  workspaceBalance: number
  className?: string
}

const headerIconClassName = 'dashboard-header-icon size-7 rounded-[6px]'

function DashboardHeader({ workspaceBalance, className }: DashboardHeaderProps) {
  return (
    <header className={cn('dashboard-header flex items-center gap-2 px-3', className)}>
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <SidebarTrigger className={cn(headerIconClassName, '-ml-0.5')} />
        <Logo compact href={DASHBOARD_ROUTES.ROOT} className="hidden sm:flex" />
      </div>

      <div className="dashboard-header-actions">
        <WorkspaceBalanceHeader balance={workspaceBalance} />
        <div className="dashboard-header-actions-divider hidden sm:block" aria-hidden />
        <div className="dashboard-header-actions-cluster">
          <ThemeToggle className={headerIconClassName} />
          <NotificationBell className={headerIconClassName} />
          <UserDropdown className={headerIconClassName} />
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
