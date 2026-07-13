import { uploadGeneratedImage } from '@/controllers/generated-image.controller.js'
import { internalApiMiddleware } from '@/middlewares/internal-api.middleware.js'
import { Hono } from 'hono'

const generatedImageRoutes = new Hono()

generatedImageRoutes.use('/*', internalApiMiddleware)
generatedImageRoutes.post('/workspace/:workspaceId', uploadGeneratedImage)

export { generatedImageRoutes }
