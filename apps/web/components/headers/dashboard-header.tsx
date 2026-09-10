'use client'

import { UserDropdown } from '@/components/common/user-dropdown'
import { CommandPalette } from '@/components/command-palette'
import { FeedbackButton } from '@/components/headers/feedback-button'
import { FilesHeaderLink } from '@/components/headers/files-header-link'
import { HeaderTooltip } from '@/components/headers/header-tooltip'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { WorkspaceBalanceHeader } from '@/components/workspace-balance-header'
import { cn } from '@/lib/utils'

type DashboardHeaderProps = {
  workspaceBalance: number
  className?: string
}

const headerIconClassName = 'dashboard-header-icon size-7 rounded-[6px]'
const headerTextBtnClassName = 'dashboard-header-text-btn'

function DashboardHeader({ workspaceBalance, className }: DashboardHeaderProps) {
  return (
    <TooltipProvider delayDuration={400}>
      <header className={cn('dashboard-header relative flex items-center justify-between gap-3 px-3', className)}>
        <div className="flex min-w-0 shrink-0 items-center">
          <HeaderTooltip label="Toggle sidebar">
            <SidebarTrigger className={cn(headerIconClassName, '-ml-0.5')} />
          </HeaderTooltip>
        </div>

        <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 w-full max-w-[min(26rem,calc(100%-11rem))] -translate-x-1/2 -translate-y-1/2">
          <CommandPalette className="pointer-events-auto w-full" />
        </div>

        <div className="dashboard-header-actions shrink-0">
          <HeaderTooltip label="AI credits">
            <WorkspaceBalanceHeader balance={workspaceBalance} />
          </HeaderTooltip>
          <div className="dashboard-header-actions-divider" aria-hidden />
          <HeaderTooltip label="Feedback">
            <FeedbackButton className={headerTextBtnClassName} />
          </HeaderTooltip>
          <HeaderTooltip label="Files">
            <FilesHeaderLink className={headerIconClassName} />
          </HeaderTooltip>
          <HeaderTooltip label="Notifications">
            <NotificationBell className={headerIconClassName} />
          </HeaderTooltip>
          <HeaderTooltip label="Account">
            <UserDropdown className={headerIconClassName} />
          </HeaderTooltip>
        </div>
      </header>
    </TooltipProvider>
  )
}

export default DashboardHeader
