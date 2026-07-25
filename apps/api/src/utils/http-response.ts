import type { MetaResponse } from '@socialista/types'
import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export class HttpError extends Error {
  constructor(
    public status: ContentfulStatusCode,
    message: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export const errorResponse = (c: Context, status: ContentfulStatusCode, message: string) => {
  return c.json({ success: false, message }, status)
}

/**
 * Standard success envelope: `{ success: true, data, meta? }`.
 * Put pagination in `meta` (4th arg), never nest it inside `data`.
 */
export const successResponse = <T>(
  c: Context,
  status: ContentfulStatusCode,
  data: T,
  meta?: MetaResponse,
) => {
  return c.json({ success: true, data, ...(meta ? { meta } : {}) }, status)
}
