'use server'

import { auth } from '@/auth'
import { NOTIFICATION_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  GetNotificationsResponse,
  GetUnreadCountResponse,
  Notification,
} from '@socialista/types'
import { revalidateTag } from 'next/cache'

const NOTIFICATIONS_CACHE_REVALIDATE = 60

function notificationsTag(workspaceId: string, userId: string) {
  return `notifications-${workspaceId}-${userId}`
}

async function currentUserId() {
  const session = await auth()
  return session?.user?.id ?? 'anon'
}

async function revalidateNotifications(workspaceId: string) {
  const userId = await currentUserId()
  revalidateTag(notificationsTag(workspaceId, userId), 'max')
}

export type GetNotificationsQuery = {
  page?: number
  limit?: number
  sort?: string
  unread?: boolean
  type?: string
}

export const getNotifications = async (
  workspaceId: string,
  query?: GetNotificationsQuery,
): Promise<ApiResponse<GetNotificationsResponse>> => {
  const userId = await currentUserId()
  const params = new URLSearchParams()
  if (query?.page) params.set('page', String(query.page))
  if (query?.limit) params.set('limit', String(query.limit))
  if (query?.sort) params.set('sort', query.sort)
  if (query?.unread) params.set('unread', 'true')
  if (query?.type) params.set('type', query.type)

  const search = params.toString()
  const path = `${NOTIFICATION_ROUTES.GET_WORKSPACE_NOTIFICATIONS(workspaceId)}${search ? `?${search}` : ''}`
  return api.get<GetNotificationsResponse>(path, {
    next: {
      revalidate: NOTIFICATIONS_CACHE_REVALIDATE,
      tags: [notificationsTag(workspaceId, userId)],
    },
  })
}

export const getUnreadNotificationCount = async (
  workspaceId: string,
): Promise<ApiResponse<GetUnreadCountResponse>> => {
  const userId = await currentUserId()
  return api.get<GetUnreadCountResponse>(NOTIFICATION_ROUTES.GET_UNREAD_COUNT(workspaceId), {
    next: {
      revalidate: NOTIFICATIONS_CACHE_REVALIDATE,
      tags: [notificationsTag(workspaceId, userId)],
    },
  })
}

export const markNotificationRead = async (
  id: string,
  workspaceId: string,
): Promise<ApiResponse<{ notification: Notification }>> => {
  const response = await api.patch<{ notification: Notification }>(NOTIFICATION_ROUTES.MARK_READ(id))
  if (response.success) {
    await revalidateNotifications(workspaceId)
  }
  return response
}

export const markAllNotificationsRead = async (
  workspaceId: string,
): Promise<ApiResponse<{ modifiedCount: number }>> => {
  const response = await api.post<{ modifiedCount: number }>(
    NOTIFICATION_ROUTES.MARK_ALL_READ(workspaceId),
  )
  if (response.success) {
    await revalidateNotifications(workspaceId)
  }
  return response
}
