import { HttpError } from '@/utils/http-response.js'
import { isValidId, type INotification } from '@socialista/db'
import type { Notification, NotificationResource } from '@socialista/types'
import { isNotificationResourceKind } from '@socialista/types'

export const serializeNotification = (notification: INotification): Notification => ({
  _id: notification._id.toString(),
  workspaceId: notification.workspace.toString(),
  userId: notification.userId.toString(),
  type: notification.type,
  title: notification.title,
  body: notification.body,
  readAt: notification.readAt,
  resource: notification.resource,
  metadata: notification.metadata,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
})

export const parseNotificationResource = (value: unknown): NotificationResource | undefined => {
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
  if (!isNotificationResourceKind(record.kind)) {
    throw new HttpError(400, 'Invalid notification resource kind')
  }
  if (typeof record.id !== 'string' || !record.id.trim()) {
    throw new HttpError(400, 'Notification resource id is required')
  }
  return { kind: record.kind, id: record.id.trim() }
}

export const parseOptionalObjectId = (value: unknown, label: string): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string' || !isValidId(value)) {
    throw new HttpError(400, `Invalid ${label}`)
  }
  return value
}

export const parseOptionalMetadata = (value: unknown): Record<string, unknown> | undefined => {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'metadata must be an object')
  }
  return value as Record<string, unknown>
}
