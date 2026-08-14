'use client'

import { NotificationItem } from '@/components/notifications/notification-item'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useNotificationsInbox } from '@/hooks/use-notifications-inbox'
import { notificationHref } from '@/lib/notifications/notification-href'
import { cn } from '@/lib/utils'
import { getWorkspaceId, useWorkspaceStore } from '@/store/workspace.store'
import { BellIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function unreadLabel(count: number) {
  if (count > 99) return '99+'
  return String(count)
}

export function NotificationBell({ className }: { className?: string }) {
  const router = useRouter()
  const currentWorkspace = useWorkspaceStore(s => s.currentWorkspace)
  const workspaceId = getWorkspaceId(currentWorkspace)
  const { notifications, unreadCount, isLoading, refresh, markRead, markAllRead } =
    useNotificationsInbox(workspaceId)
  const [open, setOpen] = useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) void refresh()
  }

  const handleSelect = (notificationId: string, href: string, unread: boolean) => {
    setOpen(false)
    if (unread) void markRead(notificationId)
    router.push(href)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={
            unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
          }
          className={cn('relative', className)}
        >
          <BellIcon strokeWidth={1.75} />
          {unreadCount > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground tabular-nums">
              {unreadLabel(unreadCount)}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="flex w-80 flex-col overflow-hidden p-0 sm:w-96"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
          <p className="text-sm font-medium">Notifications</p>
          {unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={() => void markAllRead()}
            >
              Mark all as read
            </Button>
          ) : null}
        </div>

        <ScrollArea className="max-h-80">
          <div className="flex flex-col gap-0.5 p-1.5">
            {isLoading && notifications.length === 0 ? (
              <>
                <Skeleton className="h-14 rounded-lg" />
                <Skeleton className="h-14 rounded-lg" />
                <Skeleton className="h-14 rounded-lg" />
              </>
            ) : notifications.length === 0 ? (
              <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                You are all caught up.
              </p>
            ) : (
              notifications.map(notification => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  compact
                  onSelect={item =>
                    handleSelect(item._id, notificationHref(item), item.readAt == null)
                  }
                />
              ))
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-border/60 p-1.5">
          <Button variant="ghost" size="sm" className="h-8 w-full text-xs" asChild>
            <Link href={DASHBOARD_ROUTES.NOTIFICATIONS} onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
