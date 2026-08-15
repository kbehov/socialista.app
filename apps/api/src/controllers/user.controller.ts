import { uploadBufferToR2 } from '@/lib/aws.js'
import {
  assertHasUpdates,
  getQueryString,
  parseParamId,
  type AuthContext,
} from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import {
  assertAppAdmin,
  assertCanAccessUser,
  assertEmailUnique,
  assertPasswordChangeAllowed,
  getUserOrThrow,
  pickUserUpdates,
  processAvatarFile,
  serializeUser,
} from '@/utils/user.utils.js'
import {
  deleteUser as deleteUserRecord,
  getUsers as getUsersFromDb,
  updateUser as updateUserRecord,
  type UserDocument,
} from '@socialista/db'

const applyUserUpdates = async (c: AuthContext, id: string) => {
  const requesterId = c.get('userId')
  const requester = await assertCanAccessUser(requesterId, id)
  const body = (await c.req.json()) as Record<string, unknown>
  const updates = pickUserUpdates(body, requester, requesterId, id)
  assertHasUpdates(updates)

  if (updates.password) {
    await assertPasswordChangeAllowed(id, body, requesterId === id)
  }

  if (updates.email) {
    await assertEmailUnique(updates.email, id)
  }

  const user = await updateUserRecord(id, updates)
  if (!user) {
    throw new HttpError(404, 'User not found')
  }

  return successResponse(c, 200, { user: serializeUser(user) })
}

export const getMe = async (c: AuthContext) => {
  const user = await getUserOrThrow(c.get('userId'), { includePassword: true })
  return successResponse(c, 200, { user: serializeUser(user) })
}

export const getUser = async (c: AuthContext) => {
  const requesterId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'user ID')

  await assertCanAccessUser(requesterId, id)

  const user = await getUserOrThrow(id, { includePassword: true })
  return successResponse(c, 200, { user: serializeUser(user) })
}

export const getUsers = async (c: AuthContext) => {
  assertAppAdmin(await getUserOrThrow(c.get('userId')))

  const { users, meta } = await getUsersFromDb(getQueryString(c.req.url))
  return successResponse(
    c,
    200,
    { users: users.map(user => serializeUser(user as UserDocument)) },
    meta,
  )
}

export const updateMe = async (c: AuthContext) => applyUserUpdates(c, c.get('userId'))

export const updateUser = async (c: AuthContext) => {
  const id = parseParamId(c.req.param('id'), 'user ID')
  return applyUserUpdates(c, id)
}

export const uploadMyAvatar = async (c: AuthContext) => {
  const userId = c.get('userId')
  const formData = await c.req.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    throw new HttpError(400, 'File is required')
  }

  const { buffer, mimeType, ext } = await processAvatarFile(file)
  const key = `users/${userId}/avatar-${crypto.randomUUID()}.${ext}`
  const url = await uploadBufferToR2(key, buffer, mimeType)

  const user = await updateUserRecord(userId, { avatar: url })
  if (!user) {
    throw new HttpError(404, 'User not found')
  }

  return successResponse(c, 200, { user: serializeUser(user) })
}

export const deleteUser = async (c: AuthContext) => {
  const requesterId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'user ID')

  await assertCanAccessUser(requesterId, id)
  await getUserOrThrow(id)
  await deleteUserRecord(id)

  return successResponse(c, 200, { message: 'User deleted successfully' })
}
