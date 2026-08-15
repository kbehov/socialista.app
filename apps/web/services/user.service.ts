'use server'

import { unstable_update as updateSession } from '@/auth'
import { USER_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import { mapApiUserToSessionUser } from '@/utils/auth.utils'
import type { ApiResponse, UpdateUserPayload, User } from '@socialista/types'

async function withUserError<T>(request: () => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> {
  try {
    return await request()
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Request failed',
    }
  }
}

async function syncSession(user: User) {
  await updateSession({
    user: mapApiUserToSessionUser(user),
  })
}

export const getMe = async (): Promise<ApiResponse<{ user: User }>> => {
  return withUserError(() =>
    api.get<{ user: User }>(USER_ROUTES.ME, {
      cache: 'no-store',
    }),
  )
}

export const updateUser = async (payload: UpdateUserPayload): Promise<ApiResponse<{ user: User }>> => {
  const response = await withUserError(() => api.patch<{ user: User }>(USER_ROUTES.UPDATE_ME, payload))
  if (response.success && response.data?.user) {
    await syncSession(response.data.user)
  }
  return response
}

export const uploadUserAvatar = async (formData: FormData): Promise<ApiResponse<{ user: User }>> => {
  const response = await withUserError(() => api.post<{ user: User }>(USER_ROUTES.UPLOAD_AVATAR, formData))
  if (response.success && response.data?.user) {
    await syncSession(response.data.user)
  }
  return response
}
