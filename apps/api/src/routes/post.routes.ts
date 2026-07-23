import {
  cancelPost,
  createPost,
  deletePost,
  getAccountPosts,
  getPost,
  getWorkspacePostStats,
  getWorkspacePosts,
  schedulePost,
  updatePost,
} from '@/controllers/post.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const postRoutes = new Hono<AppContext>()

postRoutes.use('/*', authMiddleware)

postRoutes.post('/', createPost)
postRoutes.get('/workspace/:workspaceId', getWorkspacePosts)
postRoutes.get('/workspace/:workspaceId/stats', getWorkspacePostStats)
postRoutes.get('/account/:accountId', getAccountPosts)
postRoutes.get('/:id', getPost)
postRoutes.patch('/:id', updatePost)
postRoutes.delete('/:id', deletePost)
postRoutes.post('/:id/schedule', schedulePost)
postRoutes.post('/:id/cancel', cancelPost)

export default postRoutes
