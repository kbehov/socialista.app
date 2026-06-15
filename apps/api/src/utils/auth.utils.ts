import { createStripeCustomer } from '@/lib/stripe.js'
import { HttpError } from '@/utils/http-response.js'
import { assertEmailUnique } from '@/utils/user.utils.js'
import { defaultWorkspaceBilling } from '@/utils/workspace.utils.js'
import {
  authenticateUser,
  createUser,
  createWorkspace,
  isValidEmail,
  isValidPassword,
  updateWorkspace,
  UserStatus,
  type UserDocument,
} from '@socialista/db'

type SignUpBody = { email?: string; password?: string; name?: string }
type SignInBody = { email?: string; password?: string }

export const parseSignUpInput = (body: SignUpBody) => {
  const { email, password, name } = body

  if (!email || !password || !name) {
    throw new HttpError(400, 'Email, password, and name are required')
  }
  if (!isValidEmail(email)) {
    throw new HttpError(400, 'Invalid email address')
  }
  if (!isValidPassword(password)) {
    throw new HttpError(400, 'Password must be at least 8 characters')
  }

  return { email, password, name }
}

export const parseSignInInput = (body: SignInBody) => {
  const { email, password } = body

  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required')
  }

  return { email, password }
}

export const authenticateActiveUser = async (email: string, password: string) => {
  const user = await authenticateUser(email, password)
  if (!user || user.status !== UserStatus.ACTIVE) {
    throw new HttpError(401, 'Invalid email or password')
  }
  return user
}

export const setupDefaultWorkspace = async (user: UserDocument, name: string): Promise<void> => {
  const workspace = await createWorkspace(
    { name: `${name}'s Workspace`, billing: defaultWorkspaceBilling() },
    user._id,
  )

  const stripeCustomer = await createStripeCustomer(user.email, name, workspace._id)

  await updateWorkspace(workspace._id, {
    billing: { ...defaultWorkspaceBilling(), stripeCustomerId: stripeCustomer.id },
  })
}

export const registerUser = async (email: string, password: string, name: string) => {
  await assertEmailUnique(email)
  const user = await createUser({ email, password, name })
  await setupDefaultWorkspace(user, name)
  return user
}
