import { getWorkspaceBillingStatus, processPolarBillingWebhook } from '@/controllers/workspace-billing.controller.js'
import { internalWebhookMiddleware } from '@/middlewares/internal-webhook.middleware.js'
import { Hono } from 'hono'

const workspaceBillingRoutes = new Hono()

workspaceBillingRoutes.use('/*', internalWebhookMiddleware)
workspaceBillingRoutes.post('/polar/events', processPolarBillingWebhook)
workspaceBillingRoutes.get('/status/:workspaceId', getWorkspaceBillingStatus)

export default workspaceBillingRoutes
