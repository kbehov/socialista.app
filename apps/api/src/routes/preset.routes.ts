import {
  createPreset,
  deletePreset,
  getPreset,
  getPresets,
  updatePreset,
} from '@/controllers/preset.controller.js'
import { adminMiddleware } from '@/middlewares/admin.middleware.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const presetRoutes = new Hono<AppContext>()

presetRoutes.use('/*', authMiddleware)

presetRoutes.get('/', getPresets)
presetRoutes.get('/:id', getPreset)
presetRoutes.post('/', adminMiddleware, createPreset)
presetRoutes.patch('/:id', adminMiddleware, updatePreset)
presetRoutes.delete('/:id', adminMiddleware, deletePreset)

export default presetRoutes
