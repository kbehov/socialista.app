import {
  acceptInvitation,
  createInvitation,
  deleteInvitation,
  getInvitation,
  getInvitations,
  rejectInvitation,
} from '@/controllers/invitation.controller.js'
import { authMiddleware, type AppContext } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const invitationRoutes = new Hono<AppContext>()

invitationRoutes.use('/*', authMiddleware)

invitationRoutes.post('/accept', acceptInvitation)
invitationRoutes.post('/reject', rejectInvitation)
invitationRoutes.get('/', getInvitations)
invitationRoutes.post('/', createInvitation)
invitationRoutes.get('/:id', getInvitation)
invitationRoutes.delete('/:id', deleteInvitation)

export default invitationRoutes
