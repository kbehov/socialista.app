'use client'

import { Button } from '@/components/ui/button'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useWorkspaceStore } from '@/store/workspace.store'
import { ArrowUpRightIcon } from 'lucide-react'
import Link from 'next/link'

function UpgradeSummary() {
  return (
    <div className="px-2 py-2 group-data-[collapsible=icon]:hidden">
      <p className="text-[13px] font-medium tracking-tight text-sidebar-foreground">Upgrade to Pro</p>
      <p className="mt-0.5 text-xs leading-snug text-muted-foreground">Growth charts, more seats, and AI credits.</p>
      <Button asChild size="sm" variant="outline" className="mt-2.5 h-7 w-full text-xs font-medium">
        <Link href={DASHBOARD_ROUTES.UPGRADE}>View plans</Link>
      </Button>
    </div>
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
