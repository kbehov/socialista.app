export const API_URL = 'http://localhost:8080'

export const AUTH_ROUTES = {
  SIGN_IN: `/auth/sign-in`,
  SIGN_UP: `/auth/sign-up`,
  REFRESH: `/auth/refresh`,
  SOCIAL_LOGIN: `/auth/social`,
}

export const USER_ROUTES = {
  ME: `/user/me`,
  GET_USER: `/user/:id`,
  GET_USERS: `/users`,
  UPDATE_USER: `/user/:id`,
  DELETE_USER: `/user/:id`,
}

export const WORKSPACE_ROUTES = {
  GET_WORKSPACE: (workspaceId: string) => `/workspaces/${workspaceId}`,
  GET_WORKSPACES: `/workspaces`,
  GET_WORKSPACE_BILLING: (workspaceId: string) => `/workspaces/${workspaceId}/billing`,
  GET_WORKSPACE_USAGE: (workspaceId: string) => `/workspaces/${workspaceId}/usage`,
  GET_WORKSPACE_BALANCE: (workspaceId: string) => `/workspaces/${workspaceId}/balance`,
  PROCESS_POLAR_WEBHOOK: `/workspaces/billing/polar/events`,
  GET_WORKSPACE_BILLING_STATUS: (workspaceId: string) => `/workspaces/billing/status/${workspaceId}`,
  CREATE_WORKSPACE: `/workspaces`,
  UPDATE_WORKSPACE: (workspaceId: string) => `/workspaces/${workspaceId}`,
  DELETE_WORKSPACE: (workspaceId: string) => `/workspaces/${workspaceId}`,
  GET_MEMBERS: (workspaceId: string) => `/workspaces/${workspaceId}/members`,
  ADD_MEMBER: (workspaceId: string) => `/workspaces/${workspaceId}/members`,
  REMOVE_MEMBER: (workspaceId: string, memberId: string) => `/workspaces/${workspaceId}/members/${memberId}`,
  UPDATE_MEMBER: (workspaceId: string, memberId: string) => `/workspaces/${workspaceId}/members/${memberId}`,
} as const

export const BILLING_ROUTES = {
  CHECKOUT: '/api/checkout',
  PORTAL: '/api/portal',
} as const

export const INSPIRATION_ROUTES = {
  GET_INSPIRATIONS: `/inspirations`,
  CREATE_INSPIRATION: `/inspirations`,
  UPDATE_INSPIRATION: `/inspirations/:id`,
  DELETE_INSPIRATION: `/inspirations/:id`,
  VIEW_INSPIRATION: `/inspirations/:id/view`,
  GET_CATEGORIES: `/inspirations/categories`,
  CREATE_CATEGORY: `/inspirations/categories`,
  UPDATE_CATEGORY: `/inspirations/categories/:id`,
  DELETE_CATEGORY: `/inspirations/categories/:id`,
  GET_NICHES: `/inspirations/niches`,
  CREATE_NICHE: `/inspirations/niches`,
  UPDATE_NICHE: `/inspirations/niches/:id`,
  DELETE_NICHE: `/inspirations/niches/:id`,
} as const
/** Backend file/folder API paths (served under /collections). */
export const FILES_API_ROUTES = {
  CREATE_FOLDER: `/collections`,
  GET_FOLDERS: `/collections`,
  GET_WORKSPACE_FILES: (workspaceId: string) => `/collections/workspace/${workspaceId}/images`,
  UPLOAD_TO_WORKSPACE: (workspaceId: string) => `/collections/workspace/${workspaceId}/files`,
  UPLOAD_TO_FOLDER: (workspaceId: string, folderId: string) =>
    `/collections/workspace/${workspaceId}/collection/${folderId}/files`,
  DELETE_FILE: (workspaceId: string, fileId: string) => `/collections/workspace/${workspaceId}/files/${fileId}`,
  DELETE_FOLDER: (workspaceId: string, folderId: string) => `/collections/workspace/${workspaceId}/folder/${folderId}`,
} as const

export const SLIDESHOW_ROUTES = {
  CREATE: '/slideshows',
  GET_BY_ID: (id: string) => `/slideshows/${id}`,
  UPDATE: (id: string) => `/slideshows/${id}`,
  DELETE: (id: string) => `/slideshows/${id}`,
  DUPLICATE: (id: string) => `/slideshows/${id}/duplicate`,
  GET_WORKSPACE_SLIDESHOWS: (workspaceId: string) => `/slideshows/workspace/${workspaceId}`,
} as const

export const VIDEO_ROUTES = {
  CREATE: '/videos',
  GET_BY_ID: (id: string) => `/videos/${id}`,
  UPDATE: (id: string) => `/videos/${id}`,
  DELETE: (id: string) => `/videos/${id}`,
  DUPLICATE: (id: string) => `/videos/${id}/duplicate`,
  GET_WORKSPACE_VIDEOS: (workspaceId: string) => `/videos/workspace/${workspaceId}`,
} as const
export function inspirationRoute(template: string, id: string): string {
  return template.replace(':id', id)
}
export const MODEL_ROUTES = {
  GET_MODELS: `/models`,
  GET_MODEL: (id: string) => `/models/${id}`,
  CREATE_MODEL: `/models`,
  UPDATE_MODEL: (id: string) => `/models/${id}`,
  DELETE_MODEL: (id: string) => `/models/${id}`,
} as const
