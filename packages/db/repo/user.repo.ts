import { compare } from 'bcrypt'
import { UserModel } from '../models/user.model.js'
import { IUser } from '../types/user.types.js'
import { buildFilters } from '../utils/build-filters.js'

export const getUserByEmail = async (email: string) => {
  return await UserModel.findOne({ email })
}

export const authenticateUser = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email }).select('+password')
  if (!user?.password) return null
  const valid = await compare(password, user.password)
  if (!valid) return null
  return await UserModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date() }, { new: true })
}

// Get user by id
export const getUserById = async (id: string) => {
  return await UserModel.findById(id)
}

// Create user
export const createUser = async (user: Partial<IUser>) => {
  return await UserModel.create(user)
}

// Update user (runs validators; password changes go through save hook for hashing)
export const updateUser = async (id: string, updates: Partial<IUser>) => {
  const user = await UserModel.findById(id)
  if (!user) return null

  const { password, ...rest } = updates
  Object.assign(user, rest)
  if (password) {
    user.password = password
  }
  await user.save()
  return user
}

// Delete user
export const deleteUser = async (id: string) => {
  return await UserModel.findByIdAndDelete(id)
}

export const getUsers = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const users = await UserModel.find(match).skip(pagination.skip).limit(pagination.limit).sort(sort).lean()
  const total = await UserModel.countDocuments(match)
  return {
    users,
    meta: {
      total,
      page: pagination.page,
      limit: pagination.limit,
    },
  }
}
