import {
  createInspiration,
  createInspirationCategory,
  createInspirationNiche,
  deleteInspiration,
  deleteInspirationCategory,
  deleteInspirationNiche,
  getInspirationCategories,
  getInspirationNiches,
  getInspirations,
  updateInspiration,
  updateInspirationCategory,
  updateInspirationNiche,
  uploadInspirationVideo,
  viewInspiration,
} from '@/controllers/inspirations.controller.js'
import { adminMiddleware } from '@/middlewares/admin.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const inspirationRoutes = new Hono()

inspirationRoutes.get('/', getInspirations)
inspirationRoutes.post('/upload-video', authMiddleware, adminMiddleware, uploadInspirationVideo)
inspirationRoutes.post('/', authMiddleware, adminMiddleware, createInspiration)
inspirationRoutes.put('/:id', authMiddleware, adminMiddleware, updateInspiration)
inspirationRoutes.delete('/:id', authMiddleware, adminMiddleware, deleteInspiration)
inspirationRoutes.post('/:id/view', viewInspiration)
inspirationRoutes.get('/categories', getInspirationCategories)
inspirationRoutes.post('/categories', authMiddleware, adminMiddleware, createInspirationCategory)
inspirationRoutes.put('/categories/:id', authMiddleware, adminMiddleware, updateInspirationCategory)
inspirationRoutes.delete('/categories/:id', authMiddleware, adminMiddleware, deleteInspirationCategory)
inspirationRoutes.get('/niches', getInspirationNiches)
inspirationRoutes.post('/niches', authMiddleware, adminMiddleware, createInspirationNiche)
inspirationRoutes.put('/niches/:id', authMiddleware, adminMiddleware, updateInspirationNiche)
inspirationRoutes.delete('/niches/:id', authMiddleware, adminMiddleware, deleteInspirationNiche)

export default inspirationRoutes
