import { signIn, signUp } from '@/controllers/auth.controller.js'
import { Hono } from 'hono'

const authRoutes = new Hono()

authRoutes.post('/sign-up', signUp)
authRoutes.post('/sign-in', signIn)

export default authRoutes
