import {
  deleteUser,
  getMe,
  getUser,
  getUsers,
  updateMe,
  updateUser,
  uploadMyAvatar,
} from '@/controllers/user.controller.js'
import { authMiddleware, type AppContext } from '@/middlewares/auth.middleware.js'
import { Hono } from 'hono'

const userRoutes = new Hono<AppContext>()

userRoutes.use('/*', authMiddleware)
userRoutes.get('/me', getMe)
userRoutes.patch('/me', updateMe)
userRoutes.post('/me/avatar', uploadMyAvatar)
userRoutes.get('/', getUsers)
userRoutes.get('/:id', getUser)
userRoutes.patch('/:id', updateUser)
userRoutes.delete('/:id', deleteUser)

export default userRoutes
