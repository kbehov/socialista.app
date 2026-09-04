import {
  createUgcClip,
  createUgcProject,
  deleteUgcClip,
  deleteUgcProject,
  duplicateUgcClip,
  generateUgcClipScript,
  generateUgcClipStills,
  generateUgcClipVideos,
  generateUgcProjectScript,
  generateUgcProjectStills,
  generateUgcProjectVideos,
  getUgcProject,
  getWorkspaceUgcProjects,
  openUgcClipEditor,
  openUgcProjectEditor,
  assembleUgcProject,
  regenerateUgcClipStill,
  regenerateUgcClipVideo,
  updateUgcClipHandler,
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
ugcProjectRoutes.post('/:id/clips', createUgcClip)
ugcProjectRoutes.patch('/:id/clips/:clipId', updateUgcClipHandler)
ugcProjectRoutes.delete('/:id/clips/:clipId', deleteUgcClip)
ugcProjectRoutes.post('/:id/clips/:clipId/duplicate', duplicateUgcClip)
ugcProjectRoutes.post('/:id/script', generateUgcProjectScript)
ugcProjectRoutes.post('/:id/stills', generateUgcProjectStills)
ugcProjectRoutes.post('/:id/videos', generateUgcProjectVideos)
ugcProjectRoutes.post('/:id/clips/:clipId/script', generateUgcClipScript)
ugcProjectRoutes.post('/:id/clips/:clipId/stills', generateUgcClipStills)
ugcProjectRoutes.post('/:id/clips/:clipId/videos', generateUgcClipVideos)
ugcProjectRoutes.post('/:id/clips/:clipId/stills/:index/regenerate', regenerateUgcClipStill)
ugcProjectRoutes.post('/:id/clips/:clipId/video/regenerate', regenerateUgcClipVideo)
ugcProjectRoutes.post('/:id/clips/:clipId/open-editor', openUgcClipEditor)
ugcProjectRoutes.post('/:id/assemble', assembleUgcProject)
ugcProjectRoutes.post('/:id/open-editor', openUgcProjectEditor)

export { ugcProjectRoutes }
