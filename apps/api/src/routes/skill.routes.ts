import {
  archiveSkill,
  createSkill,
  deleteSkill,
  forkSkill,
  getSkill,
  getWorkspaceSkills,
  publishSkill,
  resolveSkill,
  updateSkill,
} from '@/controllers/skill.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const skillRoutes = new Hono<AppContext>()

skillRoutes.use('/*', authMiddleware)

skillRoutes.get('/resolve', resolveSkill)
skillRoutes.get('/workspace/:workspaceId', getWorkspaceSkills)
skillRoutes.post('/', createSkill)
skillRoutes.get('/:id', getSkill)
skillRoutes.patch('/:id', updateSkill)
skillRoutes.delete('/:id', deleteSkill)
skillRoutes.post('/:id/fork', forkSkill)
skillRoutes.post('/:id/publish', publishSkill)
skillRoutes.post('/:id/archive', archiveSkill)

export default skillRoutes
