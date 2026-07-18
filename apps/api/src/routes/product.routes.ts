import {
  createProduct,
  deleteProduct,
  extractProduct,
  getProduct,
  getWorkspaceProducts,
  updateProduct,
} from '@/controllers/product.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const productRoutes = new Hono<AppContext>()

productRoutes.use('/*', authMiddleware)

productRoutes.post('/extract', extractProduct)
productRoutes.post('/', createProduct)
productRoutes.get('/workspace/:workspaceId', getWorkspaceProducts)
productRoutes.get('/:id', getProduct)
productRoutes.patch('/:id', updateProduct)
productRoutes.delete('/:id', deleteProduct)

export default productRoutes
