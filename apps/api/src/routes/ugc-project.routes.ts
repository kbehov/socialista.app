import {
  createUgcClip,
  createUgcProject,
  deleteUgcClip,
  deleteUgcProject,
  duplicateUgcClip,
  generateUgcClipScript,
  generateUgcProjectScript,
  getUgcProject,
  getWorkspaceUgcProjects,
  openUgcClipEditor,
  openUgcProjectEditor,
  applyUgcCampaignPreset,
  searchUgcProjectVoices,
  updateUgcClipHandler,
  updateUgcProject,
} from '@/controllers/ugc-project.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const ugcProjectRoutes = new Hono<AppContext>()

ugcProjectRoutes.use('/*', authMiddleware)

ugcProjectRoutes.get('/voices', searchUgcProjectVoices)
ugcProjectRoutes.get('/workspace/:workspaceId', getWorkspaceUgcProjects)
ugcProjectRoutes.post('/', createUgcProject)
ugcProjectRoutes.get('/:id', getUgcProject)
ugcProjectRoutes.patch('/:id', updateUgcProject)
ugcProjectRoutes.delete('/:id', deleteUgcProject)
ugcProjectRoutes.post('/:id/clips', createUgcClip)
ugcProjectRoutes.post('/:id/presets', applyUgcCampaignPreset)
ugcProjectRoutes.patch('/:id/clips/:clipId', updateUgcClipHandler)
ugcProjectRoutes.delete('/:id/clips/:clipId', deleteUgcClip)
ugcProjectRoutes.post('/:id/clips/:clipId/duplicate', duplicateUgcClip)
ugcProjectRoutes.post('/:id/script', generateUgcProjectScript)
ugcProjectRoutes.post('/:id/clips/:clipId/script', generateUgcClipScript)
ugcProjectRoutes.post('/:id/clips/:clipId/open-editor', openUgcClipEditor)
ugcProjectRoutes.post('/:id/open-editor', openUgcProjectEditor)

export { ugcProjectRoutes }
