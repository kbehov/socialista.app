import type { Notification } from '@socialista/types'

export function isNotificationUnread(notification: Notification) {
  return notification.readAt == null
}
