import { uploadGeneratedVideo } from '@/controllers/generated-video.controller.js'
import { internalApiMiddleware } from '@/middlewares/internal-api.middleware.js'
import { Hono } from 'hono'

const generatedVideoRoutes = new Hono()

generatedVideoRoutes.use('/*', internalApiMiddleware)
generatedVideoRoutes.post('/workspace/:workspaceId', uploadGeneratedVideo)

export { generatedVideoRoutes }
