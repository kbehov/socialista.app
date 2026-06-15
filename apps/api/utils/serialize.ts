import type { UserDocument } from '@socialista/db'
export const serializeUser = (user: UserDocument) => {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    status: user.status,
    role: user.role,
  }
}
