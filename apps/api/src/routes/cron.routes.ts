import { refreshExpiringAccountTokens } from '@/controllers/cron.controller.js'
import { internalApiMiddleware } from '@/middlewares/internal-api.middleware.js'
import { Hono } from 'hono'

const cronRoutes = new Hono()

cronRoutes.use('/*', internalApiMiddleware)
cronRoutes.post('/accounts/refresh-expiring', refreshExpiringAccountTokens)

export { cronRoutes }
