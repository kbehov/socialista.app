'use server'

import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { INFLUENCER_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CloneInfluencerPayload,
  CloneInfluencerResponse,
  CreateInfluencerPayload,
  CreateInfluencerResponse,
  DeleteInfluencerResponse,
  ExploreInfluencersQuery,
  GetInfluencerCloneRequestResponse,
  GetInfluencersResponse,
  Influencer,
  UpdateInfluencerPayload,
  WorkspaceInfluencersQuery,
} from '@socialista/types'
import { revalidatePath } from 'next/cache'

const STUDIO_INFLUENCERS_PATH = DASHBOARD_ROUTES.STUDIO.INFLUENCERS

function revalidateInfluencerPaths(influencerId?: string) {
  revalidatePath(STUDIO_INFLUENCERS_PATH)
  if (influencerId) {
    revalidatePath(DASHBOARD_ROUTES.STUDIO.influencer(influencerId))
  }
}

function appendInfluencerQuery(params: URLSearchParams, query?: ExploreInfluencersQuery | WorkspaceInfluencersQuery) {
  if (!query) return

  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.sort) params.set('sort', query.sort)
  if (query.query) params.set('query', query.query)
  if (query.gender) params.set('gender', query.gender)
  if (query.ageRange) params.set('ageRange', query.ageRange)
  if (query.hairColor) params.set('hairColor', query.hairColor)
  if (query.hairStyle) params.set('hairStyle', query.hairStyle)
  if (query.eyeColor) params.set('eyeColor', query.eyeColor)
  if (query.skinTone) params.set('skinTone', query.skinTone)
  if (query.bodyShape) params.set('bodyShape', query.bodyShape)
  if (query.status) params.set('status', query.status)

  if (query.niche) {
    const niche = Array.isArray(query.niche) ? query.niche.join(',') : query.niche
    if (niche) params.set('niche', niche)
  }

  if ('visibility' in query && query.visibility) {
    params.set('visibility', query.visibility)
  }
  if ('source' in query && query.source) {
    params.set('source', query.source)
  }
  if ('projectId' in query && query.projectId) {
    params.set('project', query.projectId)
  }
}

export const exploreInfluencers = async (
  query?: ExploreInfluencersQuery,
): Promise<ApiResponse<GetInfluencersResponse>> => {
  const params = new URLSearchParams()
  appendInfluencerQuery(params, query)
  const search = params.toString()
  const path = `${INFLUENCER_ROUTES.EXPLORE}${search ? `?${search}` : ''}`
  return api.get<GetInfluencersResponse>(path)
}

export const getWorkspaceInfluencers = async (
  workspaceId: string,
  query?: WorkspaceInfluencersQuery,
): Promise<ApiResponse<GetInfluencersResponse>> => {
  const params = new URLSearchParams()
  appendInfluencerQuery(params, query)
  const search = params.toString()
  const path = `${INFLUENCER_ROUTES.GET_WORKSPACE_INFLUENCERS(workspaceId)}${search ? `?${search}` : ''}`
  return api.get<GetInfluencersResponse>(path)
}

export const getInfluencer = async (id: string): Promise<ApiResponse<{ influencer: Influencer }>> => {
  return api.get<{ influencer: Influencer }>(INFLUENCER_ROUTES.GET_BY_ID(id))
}

export const createInfluencer = async (
  payload: CreateInfluencerPayload,
): Promise<ApiResponse<CreateInfluencerResponse>> => {
  const response = await api.post<CreateInfluencerResponse>(INFLUENCER_ROUTES.CREATE, payload)
  revalidateInfluencerPaths(response.data?.influencer._id)
  return response
}

export const cloneInfluencer = async (
  payload: CloneInfluencerPayload,
): Promise<ApiResponse<CloneInfluencerResponse>> => {
  const response = await api.post<CloneInfluencerResponse>(INFLUENCER_ROUTES.CLONE, payload)
  revalidateInfluencerPaths(response.data?.cloneRequest.resultInfluencerId)
  return response
}

export const getInfluencerCloneRequest = async (
  id: string,
): Promise<ApiResponse<GetInfluencerCloneRequestResponse>> => {
  return api.get<GetInfluencerCloneRequestResponse>(INFLUENCER_ROUTES.GET_CLONE_REQUEST(id))
}

export const updateInfluencer = async (
  id: string,
  payload: UpdateInfluencerPayload,
): Promise<ApiResponse<{ influencer: Influencer }>> => {
  const response = await api.patch<{ influencer: Influencer }>(INFLUENCER_ROUTES.UPDATE(id), payload)
  revalidateInfluencerPaths(id)
  return response
}

export const deleteInfluencer = async (id: string): Promise<ApiResponse<DeleteInfluencerResponse>> => {
  const response = await api.delete<DeleteInfluencerResponse>(INFLUENCER_ROUTES.DELETE(id))
  revalidateInfluencerPaths(id)
  return response
}
