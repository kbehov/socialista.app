'use client'

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useWorkspaceStore } from '@/store/workspace.store'
import { ArrowUpRightIcon } from 'lucide-react'
import Link from 'next/link'

function UpgradeSummary() {
  return (
    <Link
      href={DASHBOARD_ROUTES.UPGRADE}
      className="sidebar-upgrade-card group-data-[collapsible=icon]:hidden block"
    >
      <p className="text-[13px] font-medium leading-tight tracking-tight text-sidebar-foreground">Upgrade to Pro</p>
      <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">Growth charts, more seats, and AI credits.</p>
    </Link>
  )
}

function UpgradeCollapsed() {
  return (
    <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
      <SidebarMenuItem>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton asChild size="sm">
              <Link href={DASHBOARD_ROUTES.UPGRADE}>
                <ArrowUpRightIcon strokeWidth={1.5} />
                <span className="sr-only">Upgrade to Pro</span>
              </Link>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" className="text-xs">
            <p className="font-medium">Upgrade to Pro</p>
            <p className="text-muted-foreground">View plans</p>
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    </SidebarMenu>
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
