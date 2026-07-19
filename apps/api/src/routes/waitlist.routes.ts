import { joinWaitlist } from '@/controllers/waitlist.controller.js'
import { internalApiMiddleware } from '@/middlewares/internal-api.middleware.js'
import { Hono } from 'hono'

const waitlistRoutes = new Hono()

waitlistRoutes.use('/*', internalApiMiddleware)
waitlistRoutes.post('/', joinWaitlist)

export default waitlistRoutes
