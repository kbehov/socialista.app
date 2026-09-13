import {
  listStaticAdTemplateCategories,
  listStaticAdTemplates,
} from '@/controllers/static-ad-template.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const staticAdTemplateRoutes = new Hono<AppContext>()

staticAdTemplateRoutes.get('/', listStaticAdTemplates)

staticAdTemplateRoutes.use('/categories', authMiddleware)
staticAdTemplateRoutes.get('/categories', listStaticAdTemplateCategories)

export default staticAdTemplateRoutes
