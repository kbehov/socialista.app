import {
  createSlideshow,
  deleteSlideshow,
  getSlideshow,
  getWorkspaceSlideshows,
  updateSlideshow,
} from '@/controllers/slideshow.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const slideshowRoutes = new Hono<AppContext>()

slideshowRoutes.use('/*', authMiddleware)

slideshowRoutes.post('/', createSlideshow)
slideshowRoutes.get('/workspace/:workspaceId', getWorkspaceSlideshows)
slideshowRoutes.get('/:id', getSlideshow)
slideshowRoutes.patch('/:id', updateSlideshow)
slideshowRoutes.delete('/:id', deleteSlideshow)

export { slideshowRoutes }
