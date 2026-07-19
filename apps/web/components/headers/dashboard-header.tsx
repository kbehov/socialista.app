import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { PenLineIcon } from 'lucide-react'
import Link from 'next/link'
import Logo from '../common/logo'
import { UserDropdown } from '../common/user-dropdown'
import { ThemeToggle } from '../theme-toggle'
import { SidebarTrigger } from '../ui/sidebar'
import { WorkspaceBalanceHeader } from '../workspace-balance-header'

const DashboardHeader = ({ workspaceBalance }: { workspaceBalance: number }) => {
  return (
    <header className="dashboard-header flex items-center gap-3 px-3 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <SidebarTrigger className="-ml-0.5 rounded-lg border border-transparent text-muted-foreground hover:border-border/70 hover:bg-background/80 hover:text-foreground hover:shadow-xs" />
        <div className="hidden h-4 w-px bg-border/80 sm:block" aria-hidden />
        <div className="hidden sm:block">
          <Logo />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <Link href={DASHBOARD_ROUTES.STUDIO.IMAGES} className="header-create-btn">
          <PenLineIcon className="size-3.5" strokeWidth={1.75} />
          <span>Create</span>
        </Link>

        <div className="dashboard-header-actions">
          <WorkspaceBalanceHeader balance={workspaceBalance} />
          <ThemeToggle className="rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground" />
          <UserDropdown />
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
