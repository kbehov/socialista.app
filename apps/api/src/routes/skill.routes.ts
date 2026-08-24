import {
  createSkill,
  deleteSkill,
  getSkill,
  getWorkspaceSkills,
  updateSkill,
} from '@/controllers/skill.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const skillRoutes = new Hono<AppContext>()

skillRoutes.use('/*', authMiddleware)

skillRoutes.get('/workspace/:workspaceId', getWorkspaceSkills)
skillRoutes.post('/', createSkill)
skillRoutes.get('/:id', getSkill)
skillRoutes.patch('/:id', updateSkill)
skillRoutes.delete('/:id', deleteSkill)

export default skillRoutes
