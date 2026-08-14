import { NotificationModel } from '../models/notification.model.js'
import {
  type CreateNotificationInput,
  type INotification,
  type NotifyWorkspaceInput,
} from '../types/notification.types.js'
import { WorkspaceMemberRole, type IWorkspace } from '../types/workspace.types.js'
import { buildFilters, buildPaginationMeta } from '../utils/build-filters.js'
import { isDuplicateKeyError } from '../utils/is-duplicate-key-error.js'
import { toObjectId } from '../utils/isValid.js'
import { getWorkspaceById } from './workspace.repo.js'

function isBulkDuplicateError(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('writeErrors' in error)) return false
  const writeErrors = (error as { writeErrors?: Array<{ code?: number }> }).writeErrors
  return Boolean(writeErrors?.length && writeErrors.every(entry => entry.code === 11000))
}

function assertCreateNotificationInput(input: CreateNotificationInput) {
  const { workspace, userId, type, title } = input
  if (!workspace || !userId || !type || !title) {
    throw new Error('workspace, userId, type and title are required')
  }
}

function mapCreateNotificationFields(input: CreateNotificationInput) {
  const { workspace, userId, type, title, body, resource, metadata, dedupeKey } = input

  return {
    workspace: toObjectId(workspace),
    userId: toObjectId(userId),
    type,
    title,
    ...(body ? { body } : {}),
    ...(resource ? { resource } : {}),
    ...(metadata ? { metadata } : {}),
    ...(dedupeKey ? { dedupeKey } : {}),
  }
}

function ownerAndAdminUserIds(workspace: IWorkspace): string[] {
  const ids = new Set<string>()
  for (const member of workspace.members) {
    if (member.role === WorkspaceMemberRole.OWNER || member.role === WorkspaceMemberRole.ADMIN) {
      ids.add(member.userId.toString())
    }
  }
  if (ids.size === 0) {
    ids.add(workspace.ownerId.toString())
  }
  return [...ids]
}

function stripUnreadParam(query: string): { query: string; unread: boolean } {
  const stripped = query.startsWith('?') ? query.slice(1) : query
  const params = new URLSearchParams(stripped)
  const unreadRaw = params.get('unread')
  params.delete('unread')
  return {
    query: params.toString(),
    unread: unreadRaw === 'true' || unreadRaw === '1',
  }
}

export const createNotification = async (
  input: CreateNotificationInput,
): Promise<INotification | null> => {
  assertCreateNotificationInput(input)
  try {
    const notification = await NotificationModel.create(mapCreateNotificationFields(input))
    return notification.toObject()
  } catch (error) {
    if (isDuplicateKeyError(error)) return null
    throw error
  }
}

export const createNotifications = async (
  inputs: CreateNotificationInput[],
): Promise<INotification[]> => {
  if (inputs.length === 0) return []
  for (const input of inputs) {
    assertCreateNotificationInput(input)
  }

  try {
    const created = await NotificationModel.insertMany(inputs.map(mapCreateNotificationFields), {
      ordered: false,
    })
    return created.map(doc => doc.toObject())
  } catch (error) {
    if (isDuplicateKeyError(error) || isBulkDuplicateError(error)) {
      return []
    }
    throw error
  }
}

export const notifyWorkspaceOwnersAndAdmins = async (
  input: NotifyWorkspaceInput,
): Promise<INotification[]> => {
  const workspace = await getWorkspaceById(input.workspace)
  if (!workspace) {
    throw new Error('Workspace not found')
  }

  const userIds = ownerAndAdminUserIds(workspace)
  return createNotifications(
    userIds.map(userId => ({
      ...input,
      userId,
      ...(input.dedupeKey ? { dedupeKey: `${input.dedupeKey}:${userId}` } : {}),
    })),
  )
}

export const getNotificationById = async (id: string): Promise<INotification | null> => {
  return NotificationModel.findById(id).lean()
}

export const getNotifications = async (query: string) => {
  const { query: withoutUnread, unread } = stripUnreadParam(query)
  const { match, pagination, sort } = buildFilters(withoutUnread)
  if (unread) {
    match.readAt = null
  }

  const [notifications, total] = await Promise.all([
    NotificationModel.find(match).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    NotificationModel.countDocuments(match),
  ])

  return {
    notifications,
    meta: buildPaginationMeta(total, pagination, sort),
  }
}

export const countUnreadNotifications = async (
  workspaceId: string,
  userId: string,
): Promise<number> => {
  return NotificationModel.countDocuments({
    workspace: toObjectId(workspaceId),
    userId: toObjectId(userId),
    readAt: null,
  })
}

export const markNotificationRead = async (
  id: string,
  userId: string,
): Promise<INotification | null> => {
  const notification = await NotificationModel.findOne({
    _id: toObjectId(id),
    userId: toObjectId(userId),
  }).lean()
  if (!notification) return null
  if (notification.readAt) return notification

  return NotificationModel.findByIdAndUpdate(
    notification._id,
    { $set: { readAt: new Date() } },
    { new: true },
  ).lean()
}

export const markAllNotificationsRead = async (
  workspaceId: string,
  userId: string,
): Promise<number> => {
  const result = await NotificationModel.updateMany(
    {
      workspace: toObjectId(workspaceId),
      userId: toObjectId(userId),
      readAt: null,
    },
    { $set: { readAt: new Date() } },
  )
  return result.modifiedCount
}
