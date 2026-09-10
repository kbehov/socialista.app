import {
  createFeedback,
  deleteFeedback,
  getFeedback,
  getWorkspaceFeedbacks,
  updateFeedback,
} from '@/controllers/feedback.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const feedbackRoutes = new Hono<AppContext>()

feedbackRoutes.use('/*', authMiddleware)

feedbackRoutes.post('/', createFeedback)
feedbackRoutes.get('/workspace/:workspaceId', getWorkspaceFeedbacks)
feedbackRoutes.get('/:id', getFeedback)
feedbackRoutes.patch('/:id', updateFeedback)
feedbackRoutes.delete('/:id', deleteFeedback)

export default feedbackRoutes
