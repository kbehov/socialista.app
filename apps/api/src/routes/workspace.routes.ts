import {
  addWorkspaceMember,
  createWorkspace,
  deleteWorkspace,
  getUserWorkspaces,
  getWorkspace,
  getWorkspaceBalance,
  getWorkspaceBilling,
  getWorkspaceMembers,
  getWorkspaceUsage,
  removeWorkspaceMember,
  updateWorkspace,
  updateWorkspaceMember,
} from '@/controllers/workspace.controller.js'
import workspaceBillingRoutes from '@/routes/workspace-billing.routes.js'
import { authMiddleware, type AppContext } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const workspaceRoutes = new Hono<AppContext>()

workspaceRoutes.route('/billing', workspaceBillingRoutes)

workspaceRoutes.use('/*', authMiddleware)

workspaceRoutes.get('/', getUserWorkspaces)
workspaceRoutes.post('/', createWorkspace)
workspaceRoutes.get('/:id/members', getWorkspaceMembers)
workspaceRoutes.get('/:id/billing', getWorkspaceBilling)
workspaceRoutes.get('/:id/usage', getWorkspaceUsage)
workspaceRoutes.get('/:id/balance', getWorkspaceBalance)
workspaceRoutes.post('/:id/members', addWorkspaceMember)
workspaceRoutes.patch('/:id/members/:userId', updateWorkspaceMember)
workspaceRoutes.delete('/:id/members/:userId', removeWorkspaceMember)
workspaceRoutes.get('/:id', getWorkspace)
workspaceRoutes.patch('/:id', updateWorkspace)
workspaceRoutes.delete('/:id', deleteWorkspace)

export default workspaceRoutes
