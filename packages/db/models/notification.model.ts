import { NotificationResourceKind, NotificationType } from '@socialista/types'
import { model, Schema } from 'mongoose'
import type { INotification } from '../types/notification.types.js'

const notificationResourceSchema = new Schema(
  {
    kind: {
      type: String,
      enum: Object.values(NotificationResourceKind),
      required: true,
    },
    id: { type: String, required: true },
  },
  { _id: false },
)

const notificationSchema = new Schema<INotification>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    body: { type: String },
    readAt: { type: Date, default: null },
    resource: { type: notificationResourceSchema },
    metadata: { type: Schema.Types.Mixed },
    dedupeKey: { type: String },
  },
  { timestamps: true },
)

notificationSchema.index({ workspace: 1, userId: 1, createdAt: -1 })
notificationSchema.index(
  { workspace: 1, userId: 1 },
  { partialFilterExpression: { readAt: null }, name: 'unread_notifications' },
)
notificationSchema.index({ dedupeKey: 1 }, { unique: true, sparse: true })

export const NotificationModel = model<INotification>('Notification', notificationSchema)
