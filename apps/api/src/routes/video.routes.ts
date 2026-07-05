import {
  createVideo,
  deleteVideo,
  duplicateVideo,
  getVideo,
  getWorkspaceVideos,
  updateVideo,
} from '@/controllers/video.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const videoRoutes = new Hono<AppContext>()

videoRoutes.use('/*', authMiddleware)

videoRoutes.post('/', createVideo)
videoRoutes.get('/workspace/:workspaceId', getWorkspaceVideos)
videoRoutes.post('/:id/duplicate', duplicateVideo)
videoRoutes.get('/:id', getVideo)
videoRoutes.patch('/:id', updateVideo)
videoRoutes.delete('/:id', deleteVideo)

export { videoRoutes }
