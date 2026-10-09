'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useWorkspaceStore } from '@/store/workspace.store'
import { ChevronRightIcon, CrownIcon } from 'lucide-react'
import Link from 'next/link'

function UpgradeSummary() {
  return (
    <Link href={DASHBOARD_ROUTES.UPGRADE} className="sidebar-upgrade-card group-data-[collapsible=icon]:hidden">
      <span className="sidebar-upgrade-card-icon" aria-hidden>
        <CrownIcon strokeWidth={1.5} />
      </span>
      <span className="sidebar-upgrade-card-body">
        <span className="sidebar-upgrade-card-title">Upgrade to Pro</span>
        <span className="sidebar-upgrade-card-copy">Growth analytics, seats &amp; credits</span>
      </span>
      <ChevronRightIcon className="sidebar-upgrade-card-chevron" strokeWidth={1.75} aria-hidden />
    </Link>
  )
}

function UpgradeCollapsed() {
  return (
    <div className="hidden justify-center group-data-[collapsible=icon]:flex">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={DASHBOARD_ROUTES.UPGRADE} className="sidebar-upgrade-mark" aria-label="Upgrade to Pro">
            <CrownIcon strokeWidth={1.5} aria-hidden />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" align="center" className="text-xs">
          <p className="font-medium">Upgrade to Pro</p>
          <p className="text-muted-foreground">Growth analytics &amp; more credits</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export function SidebarUpgradeCard() {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)

  if (!currentWorkspace || currentWorkspace.billing.plan !== 'free') {
    return null
  }

  return (
    <>
      <UpgradeSummary />
      <UpgradeCollapsed />
    </>
  )
}
