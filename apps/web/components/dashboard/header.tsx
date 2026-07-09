import Logo from '../common/logo'
import { UserDropdown } from '../common/user-dropdown'
import { ThemeToggle } from '../theme-toggle'
import { SidebarTrigger } from '../ui/sidebar'
import { WorkspaceBalanceHeader } from '../workspace-balance-header'
const DashboardHeader = () => {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Logo />
      <div className="flex items-center gap-2">
        <WorkspaceBalanceHeader />
        <ThemeToggle />
        <UserDropdown />
      </div>
    </header>
  )
}

export default DashboardHeader
