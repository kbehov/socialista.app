import { compare } from 'bcrypt'
import { UserModel } from '../models/user.model.js'
import { IUser } from '../types/user.types.js'
import { buildFilters, buildPaginationMeta } from '../utils/build-filters.js'

export const getUserByEmail = async (email: string) => {
  return await UserModel.findOne({ email })
}

export const getUserByOAuthAccount = async (provider: string, providerAccountId: string) => {
  return await UserModel.findOne({
    oauthAccounts: { $elemMatch: { provider, providerAccountId } },
  })
}

export const authenticateUser = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email }).select('+password')
  if (!user?.password) return null
  const valid = await compare(password, user.password)
  if (!valid) return null
  return await UserModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date() }, { new: true })
}

export const getUserById = async (id: string, options?: { includePassword?: boolean }) => {
  const query = UserModel.findById(id)
  if (options?.includePassword) {
    query.select('+password')
  }
  return await query
}

export const getUsersByIds = async (ids: string[]) => {
  if (ids.length === 0) return []
  return UserModel.find({ _id: { $in: ids } })
}

export const userHasPassword = async (id: string) => {
  const user = await UserModel.findById(id).select('+password')
  return Boolean(user?.password)
}

export const verifyUserPassword = async (id: string, password: string) => {
  const user = await UserModel.findById(id).select('+password')
  if (!user?.password) return false
  return compare(password, user.password)
}

export const createUser = async (user: Partial<IUser>) => {
  return await UserModel.create(user)
}

export const updateUser = async (id: string, updates: Partial<IUser>) => {
  const user = await UserModel.findById(id).select('+password')
  if (!user) return null

  const { password, avatar, ...rest } = updates
  Object.assign(user, rest)
  if (password) {
    user.password = password
  }
  if (avatar) {
    user.avatar = avatar
  } else if ('avatar' in updates) {
    user.set('avatar', undefined)
  }
  await user.save()
  return user
}

export const deleteUser = async (id: string) => {
  return await UserModel.findByIdAndDelete(id)
}

export const getUsers = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const [users, total] = await Promise.all([
    UserModel.find(match).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    UserModel.countDocuments(match),
  ])
  return {
    users,
    meta: buildPaginationMeta(total, pagination, sort),
  }
}

export const setPasswordResetToken = async (userId: string, tokenHash: string, expiresAt: Date) => {
  return UserModel.findByIdAndUpdate(userId, {
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: expiresAt,
  })
}

export const findUserByPasswordResetToken = async (tokenHash: string) => {
  return UserModel.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+passwordResetTokenHash +passwordResetExpiresAt')
}

export const clearPasswordResetToken = async (userId: string) => {
  return UserModel.findByIdAndUpdate(userId, {
    $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 },
  })
}
