import { createUser, getUserByEmail } from '@socialista/db'
import { Context } from 'hono'
export const signUp = async (c: Context) => {
  const { email, password, name } = await c.req.json()
  const user = await getUserByEmail(email)
  if (user) {
    return c.json({ error: 'User already exists' }, 400)
  }
  const newUser = await createUser({ email, password, name })
  return c.json(newUser)
}
