export type WorkspaceResponse = {
  id: string
  _id: string
  logo?: string
  name: string
  ownerId: string
  description?: string
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
    nextBillingDate: Date
    nextBillingAmount: number
    aiCreditsBalance: number
    polarCustomerId?: string
    polarSubscriptionId?: string
    currentPeriodStart?: Date
    currentPeriodEnd?: Date
  }
  createdAt: Date
  updatedAt: Date
}

export type WorkspaceUsageQuota = {
  used: number
  limit: number
  remaining: number
  percentUsed: number
}

export type WorkspaceUsageSummary = {
  storage: WorkspaceUsageQuota
  posts: WorkspaceUsageQuota
  accounts: WorkspaceUsageQuota
  members: WorkspaceUsageQuota
}

export type WorkspaceBalanceResponse = {
  aiCreditsBalance: number
  plan: WorkspaceResponse['billing']['plan']
  status: WorkspaceResponse['billing']['status']
  usage: WorkspaceUsageSummary
}

export type WorkspaceBillingResponse = {
  billing: WorkspaceResponse['billing']
  limits: WorkspaceResponse['limits']
  usage: WorkspaceResponse['usage']
}

export type WorkspaceMemberUser = {
  id: string
  name?: string
  email?: string
  avatar?: string
}

export type WorkspaceMemberResponse = {
  userId: string
  role: 'owner' | 'admin' | 'member'
  user?: WorkspaceMemberUser
}

export type CreateWorkspacePayload = {
  name: string
  description?: string
  avatar?: string
  settings?: WorkspaceResponse['settings']
}

export type UpdateWorkspacePayload = {
  name?: string
  description?: string
  avatar?: string
  settings?: WorkspaceResponse['settings']
}

export type AddWorkspaceMemberPayload = {
  userId: string
  role: 'admin' | 'member'
}

export type UpdateWorkspaceMemberPayload = {
  role: 'admin' | 'member'
}
