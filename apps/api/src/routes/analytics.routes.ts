import {
  exportAccountAnalyticsCsv,
  exportWorkspaceAnalyticsSummaryCsv,
  getAccountAnalytics,
  getAnalyticsAccountPerformance,
  getAnalyticsAnomalies,
  getAnalyticsGrowth,
  getAnalyticsOverview,
  getAnalyticsPlatforms,
  getWorkspaceAnalyticsSummary,
} from '@/controllers/analytics.controller.js'
import {
  analyticsWorkspaceMiddleware,
  requireAnalyticsAccess,
  type AnalyticsContext,
} from '@/middlewares/analytics-access.middleware.js'
import { Hono } from 'hono'

const analyticsRoutes = new Hono<AnalyticsContext>()

analyticsRoutes.use('/*', analyticsWorkspaceMiddleware)

analyticsRoutes.get('/overview', getAnalyticsOverview)

analyticsRoutes.use('/growth', requireAnalyticsAccess)
analyticsRoutes.get('/growth', getAnalyticsGrowth)

analyticsRoutes.use('/platforms', requireAnalyticsAccess)
analyticsRoutes.get('/platforms', getAnalyticsPlatforms)

analyticsRoutes.use('/anomalies', requireAnalyticsAccess)
analyticsRoutes.get('/anomalies', getAnalyticsAnomalies)

analyticsRoutes.use('/performance', requireAnalyticsAccess)
analyticsRoutes.get('/performance', getAnalyticsAccountPerformance)

analyticsRoutes.use('/summary', requireAnalyticsAccess)
analyticsRoutes.get('/summary', getWorkspaceAnalyticsSummary)

analyticsRoutes.use('/summary/export', requireAnalyticsAccess)
analyticsRoutes.get('/summary/export', exportWorkspaceAnalyticsSummaryCsv)

analyticsRoutes.use('/accounts/*', requireAnalyticsAccess)
analyticsRoutes.get('/accounts/:accountId', getAccountAnalytics)
analyticsRoutes.get('/accounts/:accountId/export', exportAccountAnalyticsCsv)

export default analyticsRoutes
