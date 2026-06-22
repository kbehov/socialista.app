import { createModel, deleteModel, getModel, getModels, updateModel } from '@/controllers/models.controller.js'
import { adminMiddleware } from '@/middlewares/admin.middleware.js'
import { authMiddleware, type AppContext } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'
const modelRoutes = new Hono<AppContext>()

modelRoutes.use('/*', authMiddleware)

modelRoutes.get('/', getModels)
modelRoutes.get('/:id', getModel)
modelRoutes.post('/', adminMiddleware, createModel)
modelRoutes.put('/:id', adminMiddleware, updateModel)
modelRoutes.delete('/:id', adminMiddleware, deleteModel)

export default modelRoutes
