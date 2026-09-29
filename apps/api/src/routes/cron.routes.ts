import {
  disconnectExpiredAccounts,
  publishDuePosts,
  refreshExpiringAccountTokens,
  sweepAccountAnalytics,
  sweepPostAnalytics,
} from '@/controllers/cron.controller.js'
import { internalApiMiddleware } from '@/middlewares/internal-api.middleware.js'
import { Hono } from 'hono'

const cronRoutes = new Hono()

cronRoutes.use('/*', internalApiMiddleware)
cronRoutes.post('/accounts/refresh-expiring', refreshExpiringAccountTokens)
cronRoutes.post('/accounts/disconnect-expired', disconnectExpiredAccounts)
cronRoutes.post('/posts/publish-due', publishDuePosts)
cronRoutes.post('/analytics/sweep', sweepAccountAnalytics)
cronRoutes.post('/analytics/posts/sweep', sweepPostAnalytics)

export { cronRoutes }
