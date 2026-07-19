import {
  connectAccount,
  createAccount,
  deleteAccount,
  disconnectAccount,
  getAccount,
  getWorkspaceAccounts,
  updateAccount,
} from '@/controllers/account.controller.js'
import type { AppContext } from '@/middlewares/auth.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const accountRoutes = new Hono<AppContext>()

accountRoutes.use('/*', authMiddleware)

accountRoutes.post('/connect', connectAccount)
accountRoutes.post('/', createAccount)
accountRoutes.get('/workspace/:workspaceId', getWorkspaceAccounts)
accountRoutes.get('/:id', getAccount)
accountRoutes.patch('/:id', updateAccount)
accountRoutes.post('/:id/disconnect', disconnectAccount)
accountRoutes.delete('/:id', deleteAccount)

export default accountRoutes
