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
