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
    <div className="rounded-lg border border-sidebar-border/80 bg-sidebar-accent/30 px-3.5 py-3 group-data-[collapsible=icon]:hidden">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <SparklesIcon className="size-3.5 shrink-0 text-amber-500" />
            <p className="text-xs font-medium text-sidebar-foreground">Upgrade to Pro</p>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-sidebar-foreground/55">
            $25/mo · 5 members · 400 posts · $8 AI credits
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
          Pro
        </span>
      </div>

      <Button
        asChild
        size="sm"
        className="mt-3 h-8 w-full rounded-[min(var(--radius-md),10px)] text-xs font-medium"
      >
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
            <SidebarMenuButton asChild size="sm" className={cn('relative text-amber-500 hover:text-amber-500')}>
              <Link href={DASHBOARD_ROUTES.UPGRADE}>
                <SparklesIcon />
                <span className="absolute right-1 bottom-1 size-1.5 rounded-full bg-primary" />
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
    <div className="px-1 pb-1">
      <UpgradeSummary />
      <UpgradeCollapsed />
    </div>
  )
}
