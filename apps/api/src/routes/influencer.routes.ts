import {
  cloneInfluencer,
  createInfluencer,
  createInfluencerHookVideo,
  createInfluencerImage,
  createLibraryInfluencer,
  deleteAdminInfluencer,
  deleteInfluencer,
  exploreInfluencers,
  getAdminInfluencer,
  getCloneRequest,
  getInfluencer,
  getWorkspaceInfluencers,
  listAdminInfluencers,
  updateInfluencer,
} from '@/controllers/influencer.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { adminMiddleware } from '@/middlewares/admin.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const influencerRoutes = new Hono<AppContext>()

influencerRoutes.use('/*', authMiddleware)

influencerRoutes.get('/explore', exploreInfluencers)
influencerRoutes.get('/workspace/:workspaceId', getWorkspaceInfluencers)
influencerRoutes.get('/admin', adminMiddleware, listAdminInfluencers)
influencerRoutes.get('/admin/:id', adminMiddleware, getAdminInfluencer)
influencerRoutes.post('/admin', adminMiddleware, createLibraryInfluencer)
influencerRoutes.delete('/admin/:id', adminMiddleware, deleteAdminInfluencer)
influencerRoutes.post('/clone', cloneInfluencer)
influencerRoutes.get('/clone-requests/:id', getCloneRequest)
influencerRoutes.post('/', createInfluencer)
influencerRoutes.get('/:id', getInfluencer)
influencerRoutes.post('/:id/hook-videos', createInfluencerHookVideo)
influencerRoutes.post('/:id/images', createInfluencerImage)
influencerRoutes.patch('/:id', updateInfluencer)
influencerRoutes.delete('/:id', deleteInfluencer)

export { influencerRoutes }
