import {
  createInternalNotification,
  getUnreadNotificationCount,
  getWorkspaceNotifications,
  markNotificationAsRead,
  markWorkspaceNotificationsRead,
} from '@/controllers/notification.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { internalApiMiddleware } from '@/middlewares/internal-api.middleware.js'
import { Hono } from 'hono'

const notificationRoutes = new Hono<AppContext>()

const internalNotificationRoutes = new Hono()
internalNotificationRoutes.use('/*', internalApiMiddleware)
internalNotificationRoutes.post('/', createInternalNotification)
notificationRoutes.route('/internal', internalNotificationRoutes)

notificationRoutes.use('/*', authMiddleware)
notificationRoutes.get('/workspace/:workspaceId/unread-count', getUnreadNotificationCount)
notificationRoutes.post('/workspace/:workspaceId/read-all', markWorkspaceNotificationsRead)
notificationRoutes.get('/workspace/:workspaceId', getWorkspaceNotifications)
notificationRoutes.patch('/:id/read', markNotificationAsRead)

export default notificationRoutes
