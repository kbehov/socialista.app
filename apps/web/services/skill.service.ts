'use server'

import { SKILL_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CreateSkillPayload,
  ForkSkillPayload,
  GetSkillResponse,
  GetSkillsResponse,
  ResolveSkillQuery,
  ResolveSkillResponse,
  Skill,
  SkillSlot,
  SkillVariableValue,
  UpdateSkillPayload,
} from '@socialista/types'

export const createSkill = async (
  payload: CreateSkillPayload,
): Promise<ApiResponse<{ skill: Skill }>> => {
  return api.post<{ skill: Skill }>(SKILL_ROUTES.CREATE, payload)
}

export const getSkill = async (id: string): Promise<ApiResponse<GetSkillResponse>> => {
  return api.get<GetSkillResponse>(SKILL_ROUTES.GET_BY_ID(id))
}

export const getWorkspaceSkills = async (
  workspaceId: string,
  query?: {
    page?: number
    limit?: number
    sort?: string
    categoryId?: string
    source?: string
    status?: string
    binding?: string
    slot?: string
    query?: string
  },
): Promise<ApiResponse<GetSkillsResponse>> => {
  const params = new URLSearchParams()
  if (query?.page) params.set('page', String(query.page))
  if (query?.limit) params.set('limit', String(query.limit))
  if (query?.sort) params.set('sort', query.sort)
  if (query?.categoryId) params.set('categoryId', query.categoryId)
  if (query?.source) params.set('source', query.source)
  if (query?.status) params.set('status', query.status)
  if (query?.binding) params.set('binding', query.binding)
  if (query?.slot) params.set('slot', query.slot)
  if (query?.query) params.set('query', query.query)

  const search = params.toString()
  const path = `${SKILL_ROUTES.GET_WORKSPACE_SKILLS(workspaceId)}${search ? `?${search}` : ''}`
  return api.get<GetSkillsResponse>(path)
}

export const updateSkill = async (
  id: string,
  payload: UpdateSkillPayload,
): Promise<ApiResponse<{ skill: Skill }>> => {
  return api.patch<{ skill: Skill }>(SKILL_ROUTES.UPDATE(id), payload)
}

export const deleteSkill = async (id: string): Promise<ApiResponse<{ id: string }>> => {
  return api.delete<{ id: string }>(SKILL_ROUTES.DELETE(id))
}

export const forkSkill = async (
  id: string,
  payload: ForkSkillPayload,
): Promise<ApiResponse<{ skill: Skill }>> => {
  return api.post<{ skill: Skill }>(SKILL_ROUTES.FORK(id), payload)
}

export const publishSkill = async (id: string): Promise<ApiResponse<{ skill: Skill }>> => {
  return api.post<{ skill: Skill }>(SKILL_ROUTES.PUBLISH(id), {})
}

export const archiveSkill = async (id: string): Promise<ApiResponse<{ skill: Skill }>> => {
  return api.post<{ skill: Skill }>(SKILL_ROUTES.ARCHIVE(id), {})
}

export const resolveSkill = async (
  query: ResolveSkillQuery,
): Promise<ApiResponse<ResolveSkillResponse>> => {
  const params = new URLSearchParams()
  params.set('workspaceId', query.workspaceId)
  if (query.slot) params.set('slot', query.slot)
  if (query.skillId) params.set('skillId', query.skillId)
  if (query.variables) params.set('variables', JSON.stringify(query.variables))
  return api.get<ResolveSkillResponse>(`${SKILL_ROUTES.RESOLVE}?${params.toString()}`)
}

export async function resolveSkillForSlot(
  workspaceId: string,
  slot: SkillSlot,
  options?: {
    skillId?: string
    variables?: Record<string, SkillVariableValue>
  },
): Promise<ResolveSkillResponse | null> {
  try {
    const response = await resolveSkill({
      workspaceId,
      slot,
      skillId: options?.skillId,
      variables: options?.variables,
    })
    return response.data ?? null
  } catch {
    return null
  }
}
