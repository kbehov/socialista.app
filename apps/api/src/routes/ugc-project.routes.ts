import {
  createUgcProject,
  deleteUgcProject,
  generateUgcScript,
  generateUgcStills,
  generateUgcVideos,
  getUgcProject,
  getWorkspaceUgcProjects,
  openUgcVariantEditor,
  regenerateUgcStill,
  regenerateUgcVideo,
  updateUgcProject,
} from '@/controllers/ugc-project.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const ugcProjectRoutes = new Hono<AppContext>()

ugcProjectRoutes.use('/*', authMiddleware)

ugcProjectRoutes.get('/workspace/:workspaceId', getWorkspaceUgcProjects)
ugcProjectRoutes.post('/', createUgcProject)
ugcProjectRoutes.get('/:id', getUgcProject)
ugcProjectRoutes.patch('/:id', updateUgcProject)
ugcProjectRoutes.delete('/:id', deleteUgcProject)
ugcProjectRoutes.post('/:id/stills', generateUgcStills)
ugcProjectRoutes.post('/:id/script', generateUgcScript)
ugcProjectRoutes.post('/:id/videos', generateUgcVideos)
ugcProjectRoutes.post('/:id/variants/:variantId/stills/:index/regenerate', regenerateUgcStill)
ugcProjectRoutes.post('/:id/variants/:variantId/video/regenerate', regenerateUgcVideo)
ugcProjectRoutes.post('/:id/variants/:variantId/open-editor', openUgcVariantEditor)

export { ugcProjectRoutes }
