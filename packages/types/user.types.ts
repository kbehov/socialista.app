export type User = {
  id: string
  email: string
  name: string
  avatar?: string
  status: string
  role: string
  hasPassword?: boolean
  connectedProviders?: string[]
}

export type UpdateUserPayload = {
  name?: string
  email?: string
  avatar?: string | null
  password?: string
  currentPassword?: string
}
