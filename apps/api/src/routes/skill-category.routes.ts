import {
  createSkillCategory,
  deleteSkillCategory,
  getSkillCategory,
  getWorkspaceSkillCategories,
  updateSkillCategory,
} from '@/controllers/skill-category.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const skillCategoryRoutes = new Hono<AppContext>()

skillCategoryRoutes.use('/*', authMiddleware)

skillCategoryRoutes.get('/workspace/:workspaceId', getWorkspaceSkillCategories)
skillCategoryRoutes.post('/', createSkillCategory)
skillCategoryRoutes.get('/:id', getSkillCategory)
skillCategoryRoutes.patch('/:id', updateSkillCategory)
skillCategoryRoutes.delete('/:id', deleteSkillCategory)

export default skillCategoryRoutes
