export const STATIC_AD_TEMPLATE_PAGE_SIZE = 24

export type StaticAdTemplateCategoryDto = {
  _id: string
  name: string
  slug: string
  templatesCount: number
  createdAt: Date
}

export type StaticAdTemplateDto = {
  _id: string
  imageUrl: string
  categories: string[]
  name?: string
  createdAt: Date
}

export type StaticAdTemplateListResponse = {
  templates: StaticAdTemplateDto[]
}

export type StaticAdTemplateCategoriesListResponse = {
  categories: StaticAdTemplateCategoryDto[]
}

export type CreateStaticAdTemplateBody = {
  categories: string[]
  imageUrl: string
  name?: string
}

export type CreateStaticAdTemplateCategoryBody = {
  name: string
}

export type UploadStaticAdTemplatePreviewResponse = {
  url: string
}
