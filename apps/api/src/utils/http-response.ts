import type { MetaResponse } from '@socialista/types'
import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
export class HttpError extends Error {
  constructor(
    public status: ContentfulStatusCode,
    message: string,
  ) {
    super(message)
  }
}
export const errorResponse = (c: Context, status: ContentfulStatusCode, message: string) => {
  return c.json({ success: false, message }, status)
}

export const successResponse = <T>(c: Context, status: ContentfulStatusCode, data: T, meta?: MetaResponse) => {
  return c.json({ success: true, data, meta }, status)
}
