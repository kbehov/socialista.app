export type ProjectStatus = 'active' | 'archived'

export type ProjectResponse = {
  id: string
  _id: string
  workspaceId: string
  name: string
  description?: string
  color?: string
  icon?: string
  timezone: string
  status: ProjectStatus
  isDefault: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type CreateProjectPayload = {
  workspaceId: string
  name: string
  timezone?: string
  description?: string
  color?: string
  icon?: string
}

export type UpdateProjectPayload = {
  name?: string
  description?: string | null
  color?: string | null
  icon?: string | null
  timezone?: string
  status?: ProjectStatus
}
