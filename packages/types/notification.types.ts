export const NotificationType = {
  GENERATION_IMAGE_COMPLETED: 'generation.image.completed',
  GENERATION_IMAGE_FAILED: 'generation.image.failed',
  GENERATION_VIDEO_COMPLETED: 'generation.video.completed',
  GENERATION_VIDEO_FAILED: 'generation.video.failed',
  GENERATION_STATIC_AD_COMPLETED: 'generation.static_ad.completed',
  GENERATION_STATIC_AD_FAILED: 'generation.static_ad.failed',
  POST_PUBLISHED: 'post.published',
  POST_FAILED: 'post.failed',
  BILLING_SUBSCRIPTION_CREATED: 'billing.subscription.created',
  BILLING_SUBSCRIPTION_RENEWED: 'billing.subscription.renewed',
  BILLING_SUBSCRIPTION_CANCELED: 'billing.subscription.canceled',
  SYSTEM: 'system',
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export const NOTIFICATION_TYPE_VALUES = Object.values(NotificationType)

const NOTIFICATION_TYPE_SET = new Set<string>(NOTIFICATION_TYPE_VALUES)

export function isNotificationType(value: unknown): value is NotificationType {
  return typeof value === 'string' && NOTIFICATION_TYPE_SET.has(value)
}

export const NotificationResourceKind = {
  GENERATION: 'generation',
  POST: 'post',
  VIDEO: 'video',
  BILLING: 'billing',
  SYSTEM: 'system',
} as const

export type NotificationResourceKind =
  (typeof NotificationResourceKind)[keyof typeof NotificationResourceKind]

export const NOTIFICATION_RESOURCE_KIND_VALUES = Object.values(NotificationResourceKind)

const NOTIFICATION_RESOURCE_KIND_SET = new Set<string>(NOTIFICATION_RESOURCE_KIND_VALUES)

export function isNotificationResourceKind(value: unknown): value is NotificationResourceKind {
  return typeof value === 'string' && NOTIFICATION_RESOURCE_KIND_SET.has(value)
}

export type NotificationResource = {
  kind: NotificationResourceKind
  id: string
}

export type Notification = {
  _id: string
  workspaceId: string
  userId: string
  type: NotificationType
  title: string
  body?: string
  readAt?: Date | null
  resource?: NotificationResource
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export type GetNotificationsResponse = {
  notifications: Notification[]
}

export type GetUnreadCountResponse = {
  count: number
}

export type CreateSystemNotificationPayload = {
  workspaceId: string
  userId?: string
  title: string
  body?: string
  resource?: NotificationResource
  metadata?: Record<string, unknown>
  dedupeKey?: string
}
