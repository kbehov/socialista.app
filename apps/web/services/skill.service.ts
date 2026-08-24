'use server'

import { SKILL_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CreateSkillPayload,
  GetSkillResponse,
  GetSkillsResponse,
  PromptKey,
  Skill,
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
    target?: PromptKey
    query?: string
  },
): Promise<ApiResponse<GetSkillsResponse>> => {
  const params = new URLSearchParams()
  if (query?.page) params.set('page', String(query.page))
  if (query?.limit) params.set('limit', String(query.limit))
  if (query?.sort) params.set('sort', query.sort)
  if (query?.target) params.set('target', query.target)
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

export async function loadSkillOverride(
  workspaceId: string,
  target: PromptKey,
  skillId?: string,
): Promise<string | undefined> {
  if (!skillId) return undefined
  try {
    const response = await getSkill(skillId)
    const skill = response.data?.skill
    if (!skill) return undefined
    if (skill.workspaceId !== workspaceId) return undefined
    if (skill.target !== target) return undefined
    return skill.content
  } catch {
    return undefined
  }
}
