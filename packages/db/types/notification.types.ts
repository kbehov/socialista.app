import type {
  NotificationResource,
  NotificationType,
} from '@socialista/types'
import type { HydratedDocument, Types } from 'mongoose'

export type { NotificationResource, NotificationResourceKind, NotificationType } from '@socialista/types'

export interface INotification {
  _id: Types.ObjectId
  workspace: Types.ObjectId
  userId: Types.ObjectId
  type: NotificationType
  title: string
  body?: string
  readAt?: Date | null
  resource?: NotificationResource
  metadata?: Record<string, unknown>
  dedupeKey?: string
  createdAt: Date
  updatedAt: Date
}

export type NotificationDocument = HydratedDocument<INotification>

export type CreateNotificationInput = {
  workspace: string
  userId: string
  type: NotificationType
  title: string
  body?: string
  resource?: NotificationResource
  metadata?: Record<string, unknown>
  dedupeKey?: string
}

export type NotifyWorkspaceInput = Omit<CreateNotificationInput, 'userId'>
