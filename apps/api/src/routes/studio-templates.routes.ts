import {
  createStudioTemplate,
  createStudioTemplateCategory,
  deleteStudioTemplate,
  deleteStudioTemplateCategory,
  listStudioTemplateCategories,
  listStudioTemplates,
  uploadStudioTemplatePreview,
} from '@/controllers/studio-template.controller.js'
import { adminMiddleware } from '@/middlewares/admin.middleware.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const studioTemplateRoutes = new Hono<AppContext>()

studioTemplateRoutes.get('/', listStudioTemplates)
studioTemplateRoutes.post('/upload-preview', authMiddleware, adminMiddleware, uploadStudioTemplatePreview)
studioTemplateRoutes.post('/', authMiddleware, adminMiddleware, createStudioTemplate)

studioTemplateRoutes.get('/categories', authMiddleware, listStudioTemplateCategories)
studioTemplateRoutes.post('/categories', authMiddleware, adminMiddleware, createStudioTemplateCategory)
studioTemplateRoutes.delete('/categories/:id', authMiddleware, adminMiddleware, deleteStudioTemplateCategory)

studioTemplateRoutes.delete('/:id', authMiddleware, adminMiddleware, deleteStudioTemplate)

export default studioTemplateRoutes
