import type { User } from './user.types.js'
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export type AuthResponse = {
  user: User
  accessToken: string
  refreshToken: string
  accessExpiresAt: Date
  refreshExpiresAt: Date
}

export type RefreshTokenResponse = {
  accessToken: string
  refreshToken: string
  accessExpiresAt: Date
  refreshExpiresAt: Date
}

export type SocialLoginInput = {
  provider: string
  providerAccountId: string
  email: string
  name: string
  avatar?: string
}
