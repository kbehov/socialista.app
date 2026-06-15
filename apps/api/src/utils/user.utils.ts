import { HttpError } from '@/utils/http-response.js'
import {
  getUserByEmail,
  getUserById,
  isValidEmail,
  isValidPassword,
  UserRole,
  type IUser,
  type UserDocument,
} from '@socialista/db'

export const serializeUser = (user: UserDocument) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  avatar: user.avatar,
  status: user.status,
  role: user.role,
})

export const assertSelfOrAppAdmin = (requester: UserDocument, requesterId: string, targetId: string): void => {
  if (requesterId === targetId || requester.role === UserRole.ADMIN) {
    return
  }
  throw new HttpError(403, 'Forbidden')
}

export const assertAppAdmin = (user: UserDocument): void => {
  if (user.role !== UserRole.ADMIN) {
    throw new HttpError(403, 'Forbidden')
  }
}

export const getUserOrThrow = async (id: string) => {
  const user = await getUserById(id)
  if (!user) {
    throw new HttpError(404, 'User not found')
  }
  return user
}

export const assertCanAccessUser = async (requesterId: string, targetId: string) => {
  const requester = await getUserOrThrow(requesterId)
  assertSelfOrAppAdmin(requester, requesterId, targetId)
  return requester
}

export const assertEmailUnique = async (email: string, excludeUserId?: string): Promise<void> => {
  const existing = await getUserByEmail(email)
  if (existing && existing._id.toString() !== excludeUserId) {
    throw new HttpError(400, 'Email address already in use')
  }
}

export const pickUserUpdates = (
  body: Record<string, unknown>,
  requester: UserDocument,
  requesterId: string,
  targetId: string,
): Partial<IUser> => {
  const updates: Partial<IUser> = {}
  const isSelf = requesterId === targetId
  const isAdmin = requester.role === UserRole.ADMIN

  if (typeof body.name === 'string' && body.name) {
    updates.name = body.name
  }
  if (body.avatar !== undefined) {
    updates.avatar = body.avatar as string | undefined
  }

  if (typeof body.password === 'string' && body.password) {
    if (!isValidPassword(body.password)) {
      throw new HttpError(400, 'Password must be at least 8 characters')
    }
    updates.password = body.password
  }

  if (typeof body.email === 'string' && body.email && (isSelf || isAdmin)) {
    if (!isValidEmail(body.email)) {
      throw new HttpError(400, 'Invalid email address')
    }
    updates.email = body.email
  }

  if (isAdmin) {
    if (typeof body.status === 'string') {
      updates.status = body.status as IUser['status']
    }
    if (typeof body.role === 'string') {
      updates.role = body.role as IUser['role']
    }
  }

  return updates
}
