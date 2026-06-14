import { UserModel } from '../models/user.model.js'
import { IUser } from '../types/user.types.js'
import { buildFilters } from '../utils/build-filters.js'
// Get user by email
export const getUserByEmail = async (email: string) => {
  return await UserModel.findOne({ email })
}

// Get user by id
export const getUserById = async (id: string) => {
  return await UserModel.findById(id)
}

// Create user
export const createUser = async (user: IUser) => {
  return await UserModel.create(user)
}

// Update user
export const updateUser = async (id: string, user: IUser) => {
  return await UserModel.findByIdAndUpdate(id, user, { new: true })
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
