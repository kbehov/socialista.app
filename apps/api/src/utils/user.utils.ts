import { ALLOWED_MIME_TYPES, MAX_IMAGE_SIZE } from '@/config/api.config.js'
import { HttpError } from '@/utils/http-response.js'
import {
  getUserByEmail,
  getUserById,
  isValidEmail,
  isValidPassword,
  userHasPassword,
  UserRole,
  verifyUserPassword,
  type IUser,
  type UserDocument,
} from '@socialista/db'
import { Buffer } from 'node:buffer'
import sharp from 'sharp'

const AVATAR_MIME_TYPES = new Set(
  [...ALLOWED_MIME_TYPES].filter(type => type.startsWith('image/') && type !== 'image/svg+xml'),
)

export const serializeUser = (user: UserDocument) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  avatar: user.avatar || undefined,
  status: user.status,
  role: user.role,
  hasPassword: typeof user.isSelected === 'function' && user.isSelected('password') ? Boolean(user.password) : undefined,
  connectedProviders: user.oauthAccounts?.map(account => account.provider) ?? [],
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

export const getUserOrThrow = async (id: string, options?: { includePassword?: boolean }) => {
  const user = await getUserById(id, options)
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

export const assertPasswordChangeAllowed = async (
  userId: string,
  body: Record<string, unknown>,
  isSelf: boolean,
): Promise<void> => {
  if (!isSelf) return

  const hasPassword = await userHasPassword(userId)
  if (!hasPassword) return

  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''
  if (!currentPassword) {
    throw new HttpError(400, 'Current password is required')
  }

  const valid = await verifyUserPassword(userId, currentPassword)
  if (!valid) {
    throw new HttpError(400, 'Current password is incorrect')
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

  if (typeof body.name === 'string' && body.name.trim()) {
    const name = body.name.trim()
    if (name.length < 2) {
      throw new HttpError(400, 'Name must be at least 2 characters')
    }
    updates.name = name
  }

  if (body.avatar !== undefined) {
    if (body.avatar === null || body.avatar === '') {
      updates.avatar = ''
    } else if (typeof body.avatar === 'string') {
      updates.avatar = body.avatar
    }
  }

  if (typeof body.password === 'string' && body.password) {
    if (!isValidPassword(body.password)) {
      throw new HttpError(400, 'Password must be at least 8 characters')
    }
    updates.password = body.password
  }

  if (typeof body.email === 'string' && body.email && (isSelf || isAdmin)) {
    const email = body.email.trim().toLowerCase()
    if (!isValidEmail(email)) {
      throw new HttpError(400, 'Invalid email address')
    }
    updates.email = email
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

export const processAvatarFile = async (file: File) => {
  if (!AVATAR_MIME_TYPES.has(file.type)) {
    throw new HttpError(400, 'Choose a JPEG, PNG, WebP, GIF, or AVIF image')
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new HttpError(400, 'Image is too large')
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer())
  const image = sharp(rawBuffer).rotate()
  const { width, height } = await image.metadata()
  if (!width || !height) {
    throw new HttpError(400, 'Could not read image')
  }

  const buffer = await image.resize(512, 512, { fit: 'cover' }).webp({ quality: 85 }).toBuffer()
  return { buffer, mimeType: 'image/webp', ext: 'webp' as const }
}
