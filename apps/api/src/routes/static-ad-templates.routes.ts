import {
  createStaticAdTemplate,
  createStaticAdTemplateCategory,
  deleteStaticAdTemplate,
  deleteStaticAdTemplateCategory,
  listStaticAdTemplateCategories,
  listStaticAdTemplates,
  uploadStaticAdTemplatePreview,
} from '@/controllers/static-ad-template.controller.js'
import { adminMiddleware } from '@/middlewares/admin.middleware.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const staticAdTemplateRoutes = new Hono<AppContext>()

staticAdTemplateRoutes.get('/', listStaticAdTemplates)
staticAdTemplateRoutes.post('/upload-preview', authMiddleware, adminMiddleware, uploadStaticAdTemplatePreview)
staticAdTemplateRoutes.post('/', authMiddleware, adminMiddleware, createStaticAdTemplate)

staticAdTemplateRoutes.use('/categories', authMiddleware)
staticAdTemplateRoutes.get('/categories', listStaticAdTemplateCategories)
staticAdTemplateRoutes.post('/categories', authMiddleware, adminMiddleware, createStaticAdTemplateCategory)
staticAdTemplateRoutes.delete('/categories/:id', authMiddleware, adminMiddleware, deleteStaticAdTemplateCategory)

staticAdTemplateRoutes.delete('/:id', authMiddleware, adminMiddleware, deleteStaticAdTemplate)

export default staticAdTemplateRoutes
