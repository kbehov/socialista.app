import type { AspectRatio } from './image-generation.types.js'

export const STATIC_AD_TEMPLATE_PAGE_SIZE = 24

export const STATIC_AD_TEMPLATE_FORMATS = [
  'ugc',
  'apparel-ugc',
  'screenshot',
  'meme',
  'cinematic',
  'demo',
  'graphic',
  'lifestyle',
] as const

export type StaticAdTemplateFormat = (typeof STATIC_AD_TEMPLATE_FORMATS)[number]

export const STATIC_AD_TEMPLATE_BLUEPRINT_VERSION = 1

export type StaticAdTemplatePaletteSwatch = {
  hex: string
  role: string
}

/** Precomputed layout contract for high-fidelity template recreation. */
export type StaticAdTemplateBlueprint = {
  format: StaticAdTemplateFormat
  layout: string
  typeHierarchy: string
  palette: StaticAdTemplatePaletteSwatch[]
  hookStyle: string
  sceneJob: string
  aspectRatioHint?: AspectRatio
  analyzedAt: Date
  version: number
}

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
  blueprint?: StaticAdTemplateBlueprint
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
