import { UserModel } from '../models/user.model.js'
import { IUser } from '../types/user.types.js'

export const getUserByEmail = async (email: string) => {
  return await UserModel.findOne({ email })
}

export const getUserById = async (id: string) => {
  return await UserModel.findById(id)
}

export const createUser = async (user: IUser) => {
  return await UserModel.create(user)
}

export const updateUser = async (id: string, user: IUser) => {
  return await UserModel.findByIdAndUpdate(id, user, { new: true })
}

export const deleteUser = async (id: string) => {
  return await UserModel.findByIdAndDelete(id)
}

export const getUsers = async () => {
  return await UserModel.find()
}
