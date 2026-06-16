import { AUTH_ROUTES } from '@/constants/routes'
import { publicApi } from '@/lib/api'
import type { ApiResponse, AuthResponse, RefreshTokenResponse, SocialLoginInput } from '@socialista/types'

export const signIn = async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
  return publicApi.post<AuthResponse>(AUTH_ROUTES.SIGN_IN, { email, password })
}

export const signUp = async (email: string, password: string, name: string): Promise<ApiResponse<AuthResponse>> => {
  return publicApi.post<AuthResponse>(AUTH_ROUTES.SIGN_UP, { email, password, name })
}

export const refreshTokens = async (refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> => {
  return publicApi.post<RefreshTokenResponse>(AUTH_ROUTES.REFRESH, { refreshToken })
}

export const socialLogin = async (input: SocialLoginInput): Promise<ApiResponse<AuthResponse>> => {
  return publicApi.post<AuthResponse>(AUTH_ROUTES.SOCIAL_LOGIN, input)
}
