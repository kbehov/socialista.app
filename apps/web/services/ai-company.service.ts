'use server'

import { AI_COMPANY_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  AiCompany,
  ApiResponse,
  CreateAiCompanyInput,
  GetAiCompaniesResponse,
  UpdateAiCompanyInput,
  UploadAiCompanyLogoResponse,
} from '@socialista/types'
import { revalidatePath } from 'next/cache'

const COMPANIES_PATH = '/manager/models/companies'
const MODELS_PATH = '/manager/models'

function revalidateCompanyPaths() {
  revalidatePath(COMPANIES_PATH)
  revalidatePath(MODELS_PATH)
}

export const getAiCompanies = async (query?: string): Promise<ApiResponse<GetAiCompaniesResponse>> => {
  return api.get<GetAiCompaniesResponse>(`${AI_COMPANY_ROUTES.GET_COMPANIES}${query ? `?${query}` : ''}`)
}

export const getAiCompany = async (id: string): Promise<ApiResponse<AiCompany>> => {
  return api.get<AiCompany>(AI_COMPANY_ROUTES.GET_COMPANY(id))
}

export const createAiCompany = async (body: CreateAiCompanyInput): Promise<ApiResponse<AiCompany>> => {
  const response = await api.post<AiCompany>(AI_COMPANY_ROUTES.CREATE_COMPANY, body)
  if (response.success) {
    revalidateCompanyPaths()
  }
  return response
}

export const updateAiCompany = async (
  id: string,
  body: UpdateAiCompanyInput,
): Promise<ApiResponse<AiCompany>> => {
  const response = await api.put<AiCompany>(AI_COMPANY_ROUTES.UPDATE_COMPANY(id), body)
  if (response.success) {
    revalidateCompanyPaths()
  }
  return response
}

export const deleteAiCompany = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete<{ message: string }>(AI_COMPANY_ROUTES.DELETE_COMPANY(id))
  if (response.success) {
    revalidateCompanyPaths()
  }
  return response
}

export const uploadAiCompanyLogo = async (
  formData: FormData,
): Promise<ApiResponse<UploadAiCompanyLogoResponse>> => {
  return api.post<UploadAiCompanyLogoResponse>(AI_COMPANY_ROUTES.UPLOAD_LOGO, formData)
}
