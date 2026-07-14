import { PenLineIcon } from 'lucide-react'
import Link from 'next/link'
import Logo from '../common/logo'
import { UserDropdown } from '../common/user-dropdown'
import { ThemeToggle } from '../theme-toggle'
import { SidebarTrigger } from '../ui/sidebar'
import { WorkspaceBalanceHeader } from '../workspace-balance-header'

const DashboardHeader = () => {
  return (
    <header className="h-16.25 border-b border-border flex items-center gap-3 px-3 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <SidebarTrigger className="-ml-0.5 text-muted-foreground hover:bg-muted hover:text-foreground" />
        <div className="hidden h-3.5 w-px bg-border sm:block" aria-hidden />
        <div className="hidden sm:block">
          <Logo />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link href="/dashboard/posts" className="header-create-btn">
          <PenLineIcon className="size-3.5" strokeWidth={1.75} />
          <span>Create</span>
        </Link>

        <div className="hidden h-3.5 w-px bg-border sm:block" aria-hidden />

        <div className="dashboard-header-actions">
          <WorkspaceBalanceHeader />
          <ThemeToggle className="text-muted-foreground hover:bg-muted hover:text-foreground" />
          <UserDropdown />
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
