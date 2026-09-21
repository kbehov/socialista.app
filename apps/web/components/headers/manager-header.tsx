'use client'

import { UserDropdown } from '@/components/common/user-dropdown'
import { FilesHeaderLink } from '@/components/headers/files-header-link'
import { HeaderTooltip } from '@/components/headers/header-tooltip'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { MANAGER_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'

type ManagerHeaderProps = {
  className?: string
}

const headerIconClassName = 'dashboard-header-icon size-7 rounded-[6px]'

export function ManagerHeader({ className }: ManagerHeaderProps) {
  return (
    <TooltipProvider delayDuration={400}>
      <header className={cn('dashboard-header relative flex items-center justify-between gap-3 px-3', className)}>
        <div className="flex min-w-0 items-center gap-2">
          <HeaderTooltip label="Toggle sidebar">
            <SidebarTrigger className={cn(headerIconClassName, '-ml-0.5')} />
          </HeaderTooltip>
          <span className="truncate text-[13px] font-medium tracking-tight text-muted-foreground">Manager</span>
        </div>

        <div className="dashboard-header-actions shrink-0">
          <HeaderTooltip label="Files">
            <FilesHeaderLink href={MANAGER_ROUTES.FILES} className={headerIconClassName} />
          </HeaderTooltip>
          <HeaderTooltip label="Account">
            <UserDropdown className={headerIconClassName} />
          </HeaderTooltip>
        </div>
      </header>
    </TooltipProvider>
  )
}
