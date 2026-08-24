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
  className,
}: Pick<WorkspaceStorageStats, 'percentUsed' | 'isFull' | 'isNearFull'> & { className?: string }) {
  return (
    <Progress
      value={percentUsed}
      className={cn(
        'h-1 rounded-full bg-sidebar-border/80',
        isFull && '**:data-[slot=progress-indicator]:bg-destructive',
        isNearFull && !isFull && '**:data-[slot=progress-indicator]:bg-amber-500',
        !isNearFull && !isFull && '**:data-[slot=progress-indicator]:bg-primary',
        className,
      )}
      indicatorClassName="rounded-full"
    />
  )
}

function statusClassName(isFull: boolean, isNearFull: boolean) {
  if (isFull) return 'text-destructive'
  if (isNearFull) return 'text-amber-600 dark:text-amber-400'
  return 'text-muted-foreground'
}

function StorageQuietRow({ usedBytes, limitBytes, percentUsed, isFull, isNearFull }: WorkspaceStorageStats) {
  return (
    <div className="px-1 py-1.5 group-data-[collapsible=icon]:hidden">
      <div className="flex items-center gap-2">
        <HardDriveIcon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <div className="min-w-0 flex-1">
          <StorageProgress percentUsed={percentUsed} isFull={isFull} isNearFull={isNearFull} />
        </div>
        <span className={cn('shrink-0 text-[11px] font-medium tabular-nums', statusClassName(isFull, isNearFull))}>
          {Math.round(percentUsed)}%
        </span>
      </div>
      <p className="mt-1.5 truncate pl-5.5 text-[11px] tabular-nums text-muted-foreground">
        {formatStorageSize(usedBytes)} of {formatStorageSize(limitBytes)}
      </p>
    </div>
  )
}

function StorageSummary({ usedBytes, limitBytes, percentUsed, isFull, isNearFull }: WorkspaceStorageStats) {
  return (
    <div className="rounded-lg border border-sidebar-border/80 bg-sidebar-accent/60 px-3 py-2.5 group-data-[collapsible=icon]:hidden">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <HardDriveIcon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-xs font-medium tracking-tight text-sidebar-foreground">Storage</span>
        </div>
        <span className={cn('shrink-0 text-[11px] font-medium tabular-nums', statusClassName(isFull, isNearFull))}>
          {Math.round(percentUsed)}%
        </span>
      </div>

      <StorageProgress percentUsed={percentUsed} isFull={isFull} isNearFull={isNearFull} />

      <p className="mt-2 truncate text-[11px] leading-snug tabular-nums text-muted-foreground">
        {formatStorageSize(usedBytes)} of {formatStorageSize(limitBytes)}
      </p>
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
              <HardDriveIcon strokeWidth={1.5} />
              <span
                className={cn(
                  'absolute right-1.5 bottom-1.5 size-1.5 rounded-full',
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
  const showDetailedStorage = stats.isNearFull || stats.isFull

  return (
    <>
      {showDetailedStorage ? <StorageSummary {...stats} /> : <StorageQuietRow {...stats} />}
      <StorageCollapsedIcon
        usedBytes={stats.usedBytes}
        limitBytes={stats.limitBytes}
        percentUsed={stats.percentUsed}
        isFull={stats.isFull}
      />
    </>
  )
}
