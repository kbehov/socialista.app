export type AiCompany = {
  _id: string
  name: string
  logo: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

/** Nested on a Model after populate — name + logo for UI. */
export type ModelCompany = {
  _id: string
  name: string
  logo: string
}

export type GetAiCompaniesResponse = {
  companies: AiCompany[]
}

export type CreateAiCompanyInput = {
  name: string
  logo: string
}

export type UpdateAiCompanyInput = Partial<CreateAiCompanyInput>

export type UploadAiCompanyLogoResponse = {
  url: string
}
