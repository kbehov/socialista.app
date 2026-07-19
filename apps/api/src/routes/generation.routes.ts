import { getGeneration, getWorkspaceGenerations } from '@/controllers/generation.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const generationRoutes = new Hono<AppContext>()

generationRoutes.use('/*', authMiddleware)

generationRoutes.get('/workspace/:workspaceId', getWorkspaceGenerations)
generationRoutes.get('/:id', getGeneration)

export default generationRoutes
