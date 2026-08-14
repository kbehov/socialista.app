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

function DashboardHeader({ workspaceBalance, className }: DashboardHeaderProps) {
  return (
    <header className={cn('dashboard-header flex items-center gap-3 px-4 lg:px-6', className)}>
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <SidebarTrigger
          className={cn(
            '-ml-1 size-8 rounded-lg text-muted-foreground',
            'hover:bg-muted/60 hover:text-foreground',
            'focus-visible:ring-2 focus-visible:ring-ring/40',
          )}
        />
        <div className="hidden h-4 w-px bg-border/60 sm:block" aria-hidden />
        <Logo className="hidden sm:flex" />
      </div>

      <div className="dashboard-header-actions">
        <WorkspaceBalanceHeader balance={workspaceBalance} />
        <ThemeToggle className="size-7 rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground" />
        <NotificationBell className="size-7 rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground" />
        <UserDropdown />
      </div>
    </header>
  )
}

export default DashboardHeader
