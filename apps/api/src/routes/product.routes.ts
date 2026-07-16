import { extractProduct, getProduct, getProducts } from '@/controllers/product.controller.js'
import { Hono } from 'hono'

const productRoutes = new Hono()

productRoutes.post('/extract', extractProduct)
productRoutes.get('/', getProducts)
productRoutes.get('/:id', getProduct)
export default productRoutes
