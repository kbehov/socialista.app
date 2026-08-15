import {
  forgotPassword,
  refreshTokens,
  resetPassword,
  signIn,
  signUp,
  socialLogin,
} from '@/controllers/auth.controller.js'
import { Hono } from 'hono'

const authRoutes = new Hono()

authRoutes.post('/sign-up', signUp)
authRoutes.post('/sign-in', signIn)
authRoutes.post('/refresh', refreshTokens)
authRoutes.post('/social', socialLogin)
authRoutes.post('/forgot-password', forgotPassword)
authRoutes.post('/reset-password', resetPassword)

export default authRoutes
