import type { AppContext } from '@/middlewares/auth.middleware.js'
import { getQueryString, parseParamId, requireTrimmedString } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import {
  parseNotificationResource,
  parseOptionalMetadata,
  parseOptionalObjectId,
  serializeNotification,
} from '@/utils/notification.utils.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  countUnreadNotifications,
  createNotification,
  getNotificationById,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notifyWorkspaceOwnersAndAdmins,
  type INotification,
} from '@socialista/db'
import { NotificationType } from '@socialista/types'
import type { Context } from 'hono'

export const getWorkspaceNotifications = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const params = new URLSearchParams(getQueryString(c.req.url))
  params.set('workspace', workspaceId)
  params.set('userId', userId)
  const data = await getNotifications(params.toString())
  return successResponse(
    c,
    200,
    {
      notifications: data.notifications.map(notification =>
        serializeNotification(notification as INotification),
      ),
    },
    data.meta,
  )
}

export const getUnreadNotificationCount = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const count = await countUnreadNotifications(workspaceId, userId)
  return successResponse(c, 200, { count })
}

export const markNotificationAsRead = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'notification ID')

  const existing = await getNotificationById(id)
  if (!existing || existing.userId.toString() !== userId) {
    throw new HttpError(404, 'Notification not found')
  }

  await getWorkspaceAsMember(existing.workspace.toString(), userId)

  const notification = await markNotificationRead(id, userId)
  if (!notification) {
    throw new HttpError(404, 'Notification not found')
  }

  return successResponse(c, 200, { notification: serializeNotification(notification) })
}

export const markWorkspaceNotificationsRead = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const modifiedCount = await markAllNotificationsRead(workspaceId, userId)
  return successResponse(c, 200, { modifiedCount })
}

export const createInternalNotification = async (c: Context) => {
  const body = (await c.req.json()) as Record<string, unknown>
  const workspaceId = parseParamId(
    typeof body.workspaceId === 'string' ? body.workspaceId : undefined,
    'workspace ID',
  )
  const title = requireTrimmedString(body.title, 'title')
  const bodyText =
    typeof body.body === 'string' && body.body.trim() ? body.body.trim() : undefined
  const userId = parseOptionalObjectId(body.userId, 'user ID')
  const resource = parseNotificationResource(body.resource)
  const metadata = parseOptionalMetadata(body.metadata)
  const dedupeKey =
    typeof body.dedupeKey === 'string' && body.dedupeKey.trim()
      ? body.dedupeKey.trim()
      : undefined

  const payload = {
    workspace: workspaceId,
    type: NotificationType.SYSTEM,
    title,
    ...(bodyText ? { body: bodyText } : {}),
    ...(resource ? { resource } : {}),
    ...(metadata ? { metadata } : {}),
    ...(dedupeKey ? { dedupeKey } : {}),
  }

  if (userId) {
    const notification = await createNotification({ ...payload, userId })
    return successResponse(c, 201, {
      notifications: notification ? [serializeNotification(notification)] : [],
    })
  }

  const notifications = await notifyWorkspaceOwnersAndAdmins(payload)
  return successResponse(c, 201, {
    notifications: notifications.map(serializeNotification),
  })
}
