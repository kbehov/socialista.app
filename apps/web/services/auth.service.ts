'use server'
import { AUTH_ROUTES } from '@/constants/routes'
import { publicApi } from '@/lib/api-public'
import type {
  ApiResponse,
  AuthResponse,
  ForgotPasswordResult,
  RefreshTokenResponse,
  ResetPasswordResult,
  SocialLoginInput,
} from '@socialista/types'

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

export const forgotPassword = async (email: string): Promise<ApiResponse<ForgotPasswordResult>> => {
  return publicApi.post<ForgotPasswordResult>(AUTH_ROUTES.FORGOT_PASSWORD, { email })
}

export const resetPassword = async (
  token: string,
  password: string,
): Promise<ApiResponse<ResetPasswordResult>> => {
  return publicApi.post<ResetPasswordResult>(AUTH_ROUTES.RESET_PASSWORD, { token, password })
}
