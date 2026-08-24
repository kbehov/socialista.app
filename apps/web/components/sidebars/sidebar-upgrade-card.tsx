'use client'

import { Button } from '@/components/ui/button'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { useWorkspaceStore } from '@/store/workspace.store'
import { ArrowUpRightIcon, SparklesIcon } from 'lucide-react'
import Link from 'next/link'

function UpgradeSummary() {
  return (
    <div className="rounded-lg border border-sidebar-border/80 bg-sidebar-accent/60 px-3 py-2.5 group-data-[collapsible=icon]:hidden">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-amber-500 shadow-xs">
          <SparklesIcon className="size-3.5" strokeWidth={1.5} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-tight text-sidebar-foreground">Upgrade to Pro</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            Growth charts, more seats, and AI credits.
          </p>
        </div>
      </div>

      <Button asChild size="sm" className="mt-2.5 h-7 w-full text-xs font-medium">
        <Link href={DASHBOARD_ROUTES.UPGRADE}>
          View plans
          <ArrowUpRightIcon className="size-3.5 opacity-70" />
        </Link>
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
            <SidebarMenuButton asChild size="sm" className={cn('text-amber-500 hover:text-amber-500')}>
              <Link href={DASHBOARD_ROUTES.UPGRADE}>
                <SparklesIcon strokeWidth={1.5} />
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
