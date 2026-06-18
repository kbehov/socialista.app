export type WorkspaceResponse = {
  id: string
  _id: string
  logo?: string
  name: string
  ownerId: string
  settings: {
    timezone: string
    language?: string
  }
  avatar?: string
  status: 'active' | 'inactive'
  members: {
    id: string
    role: 'owner' | 'admin' | 'member'
  }[]
  limits: {
    members: number
    storage: number
    accounts: number
    posts: number
  }
  usage: {
    storage: number
    accounts: number
    posts: number
  }
  billing: {
    plan: 'free' | 'pro' | 'enterprise'
    status: 'active' | 'inactive' | 'pending' | 'cancelled' | 'expired'
  }
  createdAt: Date
  updatedAt: Date
}
