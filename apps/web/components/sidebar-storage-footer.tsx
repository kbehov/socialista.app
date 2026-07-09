'use client'

import { Progress } from '@/components/ui/progress'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { getWorkspaceStorageStats, type WorkspaceStorageStats } from '@/lib/workspace-storage'
import { useWorkspaceStore } from '@/store/workspace.store'
import { formatStorageSize } from '@/utils/format'
import { HardDriveIcon } from 'lucide-react'

function StorageProgress({
  percentUsed,
  isFull,
  isNearFull,
}: Pick<WorkspaceStorageStats, 'percentUsed' | 'isFull' | 'isNearFull'>) {
  return (
    <Progress
      value={percentUsed}
      className={cn(
        'h-1.5 bg-sidebar-border/80',
        isFull && '[&_[data-slot=progress-indicator]]:bg-destructive',
        isNearFull && !isFull && '[&_[data-slot=progress-indicator]]:bg-amber-500',
        !isNearFull && !isFull && '[&_[data-slot=progress-indicator]]:bg-primary',
      )}
    />
  )
}

function StorageSummary({ usedBytes, remainingBytes, percentUsed, isFull, isNearFull }: WorkspaceStorageStats) {
  return (
    <div className="rounded-lg border border-sidebar-border/80 bg-sidebar-accent/30 px-4 py-3.5 group-data-[collapsible=icon]:hidden">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <HardDriveIcon className="size-3.5 shrink-0 text-sidebar-foreground/60" />
          <span className="text-xs font-medium text-sidebar-foreground">Storage</span>
        </div>
        <span
          className={cn(
            'shrink-0 text-xs font-medium tabular-nums',
            isFull
              ? 'text-destructive'
              : isNearFull
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-sidebar-foreground/60',
          )}
        >
          {Math.round(percentUsed)}%
        </span>
      </div>

      <StorageProgress percentUsed={percentUsed} isFull={isFull} isNearFull={isNearFull} />

      <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] leading-none text-sidebar-foreground/55">
        <span className="truncate tabular-nums">{formatStorageSize(usedBytes)} used</span>
        <span className={cn('shrink-0 tabular-nums', isFull && 'text-destructive/90')}>
          {formatStorageSize(remainingBytes)} left
        </span>
      </div>
    </div>
  )
}

function StorageCollapsedIcon({
  usedBytes,
  limitBytes,
  percentUsed,
  isFull,
}: Pick<WorkspaceStorageStats, 'usedBytes' | 'limitBytes' | 'percentUsed' | 'isFull'>) {
  return (
    <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
      <SidebarMenuItem>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              size="sm"
              className={cn('relative', isFull && 'text-destructive hover:text-destructive')}
            >
              <HardDriveIcon />
              <span
                className={cn(
                  'absolute right-1 bottom-1 size-1.5 rounded-full',
                  isFull ? 'bg-destructive' : percentUsed >= 85 ? 'bg-amber-500' : 'bg-primary',
                )}
              />
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" className="text-xs">
            <p className="font-medium">Storage</p>
            <p className="text-muted-foreground">
              {formatStorageSize(usedBytes)} of {formatStorageSize(limitBytes)} used
            </p>
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function SidebarStorageFooter() {
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)

  if (!currentWorkspace) {
    return null
  }

  const stats = getWorkspaceStorageStats(currentWorkspace)

  return (
    <div className="px-1 pb-1">
      <StorageSummary {...stats} />
      <StorageCollapsedIcon
        usedBytes={stats.usedBytes}
        limitBytes={stats.limitBytes}
        percentUsed={stats.percentUsed}
        isFull={stats.isFull}
      />
    </div>
  )
}
