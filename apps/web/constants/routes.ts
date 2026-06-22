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
  GET_WORKSPACE: `/workspace/:id`,
  GET_WORKSPACES: `/workspaces`,
  CREATE_WORKSPACE: `/workspace`,
  UPDATE_WORKSPACE: `/workspace/:id`,
  DELETE_WORKSPACE: `/workspace/:id`,
  ADD_MEMBER: `/workspace/:id/member`,
  REMOVE_MEMBER: `/workspace/:id/member/:memberId`,
  UPDATE_MEMBER: `/workspace/:id/member/:memberId`,
}

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
export const COLLECTION_ROUTES = {
  CREATE_COLLECTION: `/collections`,
  GET_COLLECTIONS: `/collections`,
  GET_WORKSPACE_IMAGES: (workspaceId: string) => `/collections/workspace/${workspaceId}/images`,
  UPLOAD_TO_WORKSPACE: (workspaceId: string) => `/collections/workspace/${workspaceId}/files`,
  UPLOAD_TO_COLLECTION: (workspaceId: string, collectionId: string) =>
    `/collections/workspace/${workspaceId}/collection/${collectionId}/files`,
  DELETE_FILE: (workspaceId: string, fileId: string) => `/collections/workspace/${workspaceId}/files/${fileId}`,
  DELETE_FOLDER: (workspaceId: string, folderId: string) => `/collections/workspace/${workspaceId}/folder/${folderId}`,
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
