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
  getUserOrThrow,
  pickUserUpdates,
  serializeUser,
} from '@/utils/user.utils.js'
import {
  deleteUser as deleteUserRecord,
  getUsers as getUsersFromDb,
  updateUser as updateUserRecord,
  type UserDocument,
} from '@socialista/db'

export const getMe = async (c: AuthContext) => {
  const user = await getUserOrThrow(c.get('userId'))
  return successResponse(c, 200, { user: serializeUser(user) })
}

export const getUser = async (c: AuthContext) => {
  const requesterId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'user ID')

  await assertCanAccessUser(requesterId, id)

  const user = await getUserOrThrow(id)
  return successResponse(c, 200, { user: serializeUser(user) })
}

export const getUsers = async (c: AuthContext) => {
  assertAppAdmin(await getUserOrThrow(c.get('userId')))

  const { users, meta } = await getUsersFromDb(getQueryString(c.req.url))
  return successResponse(c, 200, {
    users: users.map(user => serializeUser(user as UserDocument)),
    meta,
  })
}

export const updateUser = async (c: AuthContext) => {
  const requesterId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'user ID')
  const requester = await assertCanAccessUser(requesterId, id)

  const updates = pickUserUpdates(await c.req.json(), requester, requesterId, id)
  assertHasUpdates(updates)

  if (updates.email) {
    await assertEmailUnique(updates.email, id)
  }

  const user = await updateUserRecord(id, updates)
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
