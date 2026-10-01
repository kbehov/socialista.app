import {
  createBrand,
  deleteBrand,
  extractBrand,
  getBrand,
  getWorkspaceBrands,
  updateBrand,
} from '@/controllers/brand.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const brandRoutes = new Hono<AppContext>()

brandRoutes.use('/*', authMiddleware)

brandRoutes.post('/extract', extractBrand)
brandRoutes.post('/', createBrand)
brandRoutes.get('/workspace/:workspaceId', getWorkspaceBrands)
brandRoutes.get('/:id', getBrand)
brandRoutes.patch('/:id', updateBrand)
brandRoutes.delete('/:id', deleteBrand)

export default brandRoutes
