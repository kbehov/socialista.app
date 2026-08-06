import {
  cloneInfluencer,
  createInfluencer,
  deleteInfluencer,
  exploreInfluencers,
  getCloneRequest,
  getInfluencer,
  getWorkspaceInfluencers,
  updateInfluencer,
} from '@/controllers/influencer.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const influencerRoutes = new Hono<AppContext>()

influencerRoutes.use('/*', authMiddleware)

influencerRoutes.get('/explore', exploreInfluencers)
influencerRoutes.get('/workspace/:workspaceId', getWorkspaceInfluencers)
influencerRoutes.post('/clone', cloneInfluencer)
influencerRoutes.get('/clone-requests/:id', getCloneRequest)
influencerRoutes.post('/', createInfluencer)
influencerRoutes.get('/:id', getInfluencer)
influencerRoutes.patch('/:id', updateInfluencer)
influencerRoutes.delete('/:id', deleteInfluencer)

export { influencerRoutes }
