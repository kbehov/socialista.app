import {
  getAccountAnalytics,
  getWorkspaceAnalyticsSummary,
} from '@/controllers/analytics.controller.js'
import {
  analyticsAccessMiddleware,
  type AnalyticsContext,
} from '@/middlewares/analytics-access.middleware.js'
import { Hono } from 'hono'

const analyticsRoutes = new Hono<AnalyticsContext>()

analyticsRoutes.use('/*', analyticsAccessMiddleware)

analyticsRoutes.get('/accounts/:accountId', getAccountAnalytics)
analyticsRoutes.get('/summary', getWorkspaceAnalyticsSummary)

export default analyticsRoutes
