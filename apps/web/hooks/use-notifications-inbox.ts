'use client'

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notification.service'
import type { Notification } from '@socialista/types'
import { useCallback, useEffect, useState } from 'react'

const POLL_INTERVAL_MS = 60_000
const INBOX_LIMIT = 8

type InboxState = {
  workspaceId: string
  notifications: Notification[]
  unreadCount: number
}

async function fetchInbox(workspaceId: string): Promise<InboxState> {
  const [listResponse, countResponse] = await Promise.all([
    getNotifications(workspaceId, { page: 1, limit: INBOX_LIMIT, sort: '-createdAt' }),
    getUnreadNotificationCount(workspaceId),
  ])

  return {
    workspaceId,
    notifications: listResponse.success ? (listResponse.data?.notifications ?? []) : [],
    unreadCount: countResponse.success ? (countResponse.data?.count ?? 0) : 0,
  }
}

export function useNotificationsInbox(workspaceId: string | undefined) {
  const [inbox, setInbox] = useState<InboxState | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const notifications = inbox?.workspaceId === workspaceId ? inbox.notifications : []
  const unreadCount = inbox?.workspaceId === workspaceId ? inbox.unreadCount : 0

  const refresh = useCallback(async () => {
    if (!workspaceId) return
    setInbox(await fetchInbox(workspaceId))
  }, [workspaceId])

  useEffect(() => {
    if (!workspaceId) return

    let cancelled = false
    const apply = () =>
      fetchInbox(workspaceId)
        .then(next => {
          if (!cancelled) setInbox(next)
        })
        .catch(() => undefined)

    const loadingTimeout = window.setTimeout(() => {
      if (!cancelled) setIsLoading(true)
    }, 0)

    void apply().finally(() => {
      if (!cancelled) setIsLoading(false)
    })

    const intervalId = window.setInterval(() => {
      if (document.hidden) return
      void apply()
    }, POLL_INTERVAL_MS)

    const onFocus = () => {
      void apply()
    }
    const onVisibility = () => {
      if (!document.hidden) void apply()
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      window.clearTimeout(loadingTimeout)
      window.clearInterval(intervalId)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [workspaceId])

  const markRead = useCallback(
    async (id: string) => {
      if (!workspaceId) return
      setInbox(current => {
        if (!current || current.workspaceId !== workspaceId) return current
        return {
          ...current,
          notifications: current.notifications.map(notification =>
            notification._id === id ? { ...notification, readAt: new Date() } : notification,
          ),
          unreadCount: Math.max(0, current.unreadCount - 1),
        }
      })
      await markNotificationRead(id, workspaceId)
      await refresh()
    },
    [refresh, workspaceId],
  )

  const markAllRead = useCallback(async () => {
    if (!workspaceId) return
    setInbox(current => {
      if (!current || current.workspaceId !== workspaceId) return current
      return {
        ...current,
        notifications: current.notifications.map(notification => ({
          ...notification,
          readAt: notification.readAt ?? new Date(),
        })),
        unreadCount: 0,
      }
    })
    await markAllNotificationsRead(workspaceId)
    await refresh()
  }, [refresh, workspaceId])

  return {
    notifications,
    unreadCount,
    isLoading,
    refresh,
    markRead,
    markAllRead,
  }
}
