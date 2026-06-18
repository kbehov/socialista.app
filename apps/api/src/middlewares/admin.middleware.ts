import { errorResponse } from '@/utils/http-response.js'
import { getUserById, UserRole } from '@socialista/db'
import { createMiddleware } from 'hono/factory'
import type { AppContext } from './auth.middleware.js'
export const adminMiddleware = createMiddleware<AppContext>(async (c, next) => {
  const userId = c.get('userId')
  const user = await getUserById(userId)
  if (!user || user.role !== UserRole.ADMIN) {
    return errorResponse(c, 403, 'Forbidden')
  }
  await next()
})
