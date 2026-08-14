'use client'

import { NotificationTypeIcon } from '@/components/notifications/notification-type-icon'
import { notificationHref } from '@/lib/notifications/notification-href'
import { isNotificationUnread } from '@/lib/notifications/notification-meta'
import { cn } from '@/lib/utils'
import type { Notification } from '@socialista/types'
import { formatDistanceToNow } from 'date-fns'

type NotificationItemProps = {
  notification: Notification
  onSelect: (notification: Notification) => void
  compact?: boolean
}

function formatNotificationTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return formatDistanceToNow(date, { addSuffix: true })
}

export function NotificationItem({ notification, onSelect, compact = false }: NotificationItemProps) {
  const unread = isNotificationUnread(notification)
  const href = notificationHref(notification)

  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg text-left transition-colors',
        'hover:bg-muted/60 active:scale-[0.99] motion-reduce:active:scale-100',
        compact ? 'px-2.5 py-2' : 'px-3 py-3',
        unread ? 'bg-muted/35' : '',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background',
          unread ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        <NotificationTypeIcon type={notification.type} className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className={cn('text-sm leading-snug', unread ? 'font-medium text-foreground' : 'text-foreground')}>
            {notification.title}
          </span>
          {unread ? (
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
          ) : null}
        </span>
        {notification.body ? (
          <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {notification.body}
          </span>
        ) : null}
        <span className="mt-1 block text-[11px] text-muted-foreground" suppressHydrationWarning>
          {formatNotificationTime(notification.createdAt)}
        </span>
        <span className="sr-only">{href}</span>
      </span>
    </button>
  )
}
