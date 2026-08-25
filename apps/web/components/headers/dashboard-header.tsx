import Logo from '@/components/common/logo'
import { UserDropdown } from '@/components/common/user-dropdown'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { ThemeToggle } from '@/components/theme-toggle'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { WorkspaceBalanceHeader } from '@/components/workspace-balance-header'
import { cn } from '@/lib/utils'

type DashboardHeaderProps = {
  workspaceBalance: number
  className?: string
}

const headerIconClassName = 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'

function DashboardHeader({ workspaceBalance, className }: DashboardHeaderProps) {
  return (
    <header className={cn('dashboard-header flex items-center gap-4 px-5 sm:px-6 lg:px-8', className)}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <SidebarTrigger className={cn('-ml-1.5', headerIconClassName)} />
        <Logo className="hidden sm:flex" />
      </div>

      <div className="dashboard-header-actions">
        <WorkspaceBalanceHeader balance={workspaceBalance} />
        <div className="dashboard-header-actions-divider hidden h-4 w-px bg-border sm:block" aria-hidden />
        <div className="dashboard-header-actions-cluster">
          <ThemeToggle className={headerIconClassName} />
          <NotificationBell className={headerIconClassName} />
          <UserDropdown />
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
