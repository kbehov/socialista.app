import { isValidObjectId, Types } from 'mongoose'
export const isValidId = (id: string): boolean => {
  return isValidObjectId(id)
}

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8
}

export function toObjectId(id: string): Types.ObjectId {
  return new Types.ObjectId(id)
}
