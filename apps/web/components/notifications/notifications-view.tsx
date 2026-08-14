'use client'

import { EmptyState } from '@/components/common/empty-state'
import { SmartPagination } from '@/components/common/smart-pagination'
import {
  DashboardSegment,
  dashboardSegmentLinkClass,
  dashboardSurface,
} from '@/components/dashboard'
import { useReportPageScroll } from '@/components/headers/page-scroll-compact'
import { NotificationItem } from '@/components/notifications/notification-item'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { notificationHref } from '@/lib/notifications/notification-href'
import { cn } from '@/lib/utils'
import { markAllNotificationsRead, markNotificationRead } from '@/services/notification.service'
import type { MetaResponse, Notification } from '@socialista/types'
import { BellIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type NotificationsViewProps = {
  notifications: Notification[]
  meta: MetaResponse
  workspaceId: string
  unreadOnly: boolean
}

export function NotificationsView({
  notifications,
  meta,
  workspaceId,
  unreadOnly,
}: NotificationsViewProps) {
  const router = useRouter()
  const reportPageScroll = useReportPageScroll()
  const allHref = DASHBOARD_ROUTES.NOTIFICATIONS
  const unreadHref = `${DASHBOARD_ROUTES.NOTIFICATIONS}?unread=true`

  const handleSelect = async (notification: Notification) => {
    if (notification.readAt == null) {
      await markNotificationRead(notification._id, workspaceId)
    }
    router.push(notificationHref(notification))
    router.refresh()
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead(workspaceId)
    router.refresh()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <DashboardSegment label="Notification filters">
          <Link href={allHref} className={dashboardSegmentLinkClass(!unreadOnly)} scroll={false}>
            All
          </Link>
          <Link href={unreadHref} className={dashboardSegmentLinkClass(unreadOnly)} scroll={false}>
            Unread
          </Link>
        </DashboardSegment>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground"
          onClick={() => void handleMarkAllRead()}
        >
          Mark all as read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={BellIcon}
          title={unreadOnly ? 'No unread notifications' : 'No notifications yet'}
          description={
            unreadOnly
              ? 'You are all caught up. New activity will show up here.'
              : 'Generations, published posts, and billing updates will appear here.'
          }
          minHeight="lg"
          variant="hero"
          className="flex-1"
          iconClassName={dashboardSurface.emptyIcon}
        />
      ) : (
        <>
          <div className={cn(dashboardSurface.section, 'flex min-h-0 min-w-0 flex-1 flex-col')}>
            <ScrollArea
              className="h-full"
              scrollFade
              scrollbarGutter
              onViewportScroll={event => reportPageScroll(event.currentTarget.scrollTop)}
            >
              <div className="flex flex-col gap-0.5 p-2">
                {notifications.map(notification => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onSelect={item => void handleSelect(item)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
          <SmartPagination meta={meta} className="shrink-0" />
        </>
      )}
    </div>
  )
}
