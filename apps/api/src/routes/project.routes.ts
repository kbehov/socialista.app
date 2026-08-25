import {
  createProject,
  deleteProject,
  getProject,
  getWorkspaceProjects,
  updateProject,
} from '@/controllers/project.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const projectRoutes = new Hono<AppContext>()

projectRoutes.use('/*', authMiddleware)

projectRoutes.get('/workspace/:workspaceId', getWorkspaceProjects)
projectRoutes.post('/', createProject)
projectRoutes.get('/:id', getProject)
projectRoutes.patch('/:id', updateProject)
projectRoutes.delete('/:id', deleteProject)

export default projectRoutes
