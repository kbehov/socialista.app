import type { AppContext } from '@/middlewares/auth.middleware.js'
import { HttpError } from '@/utils/http-response.js'
import { isValidId } from '@socialista/db'
import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export type AuthContext = Context<AppContext>

export const parseParamId = (id: string | undefined, label = 'ID'): string => {
  if (!id || !isValidId(id)) {
    throw new HttpError(400, `Invalid ${label}`)
  }
  return id
}

export const getQueryString = (url: string): string => url.split('?')[1] ?? ''

export const assertHasUpdates = (updates: object): void => {
  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, 'No valid fields to update')
  }
}

const REPO_ERROR_STATUS: Record<string, ContentfulStatusCode> = {
  'Workspace not found': 404,
  'Invitation not found': 404,
  'User already a member of the workspace': 409,
  'A pending invitation already exists for this email': 409,
  'Invitation is no longer pending': 400,
  'Invitation has expired': 400,
  'User is not a member of the workspace': 400,
  'User ID is required': 400,
  'Workspace ID, User ID and Role are required': 400,
  'Workspace ID and User ID are required': 400,
  'Workspace ID is required': 400,
  'Workspace, email, invitedBy and role are required': 400,
}

export const toHttpError = (error: unknown): HttpError => {
  if (error instanceof HttpError) {
    return error
  }
  if (error instanceof Error) {
    const status = REPO_ERROR_STATUS[error.message] ?? 500
    return new HttpError(status, error.message)
  }
  return new HttpError(500, 'Internal server error')
}
