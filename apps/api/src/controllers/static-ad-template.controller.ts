import type { AppContext } from '@/middlewares/auth.middleware.js'
import { getQueryString } from '@/utils/common.utils.js'
import { successResponse } from '@/utils/http-response.js'
import {
  listStaticAdTemplateCategories as listCategoriesFromDb,
  listStaticAdTemplates as listTemplatesFromDb,
  type IStaticAdTemplate,
  type IStaticAdTemplateCategory,
} from '@socialista/db'
import type { StaticAdTemplateCategoryDto, StaticAdTemplateDto } from '@socialista/types'
import type { Context } from 'hono'

function serializeTemplate(template: IStaticAdTemplate): StaticAdTemplateDto {
  return {
    _id: template._id.toString(),
    imageUrl: template.imageUrl,
    categories: template.categories,
    ...(template.name ? { name: template.name } : {}),
    createdAt: template.createdAt,
  }
}

function serializeCategory(category: IStaticAdTemplateCategory): StaticAdTemplateCategoryDto {
  return {
    _id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    templatesCount: category.templatesCount,
    createdAt: category.createdAt,
  }
}

export const listStaticAdTemplates = async (c: Context<AppContext>) => {
  const query = getQueryString(c.req.url)
  const { templates, meta } = await listTemplatesFromDb(query)
  return successResponse(c, 200, { templates: templates.map(serializeTemplate) }, meta)
}

export const listStaticAdTemplateCategories = async (c: Context<AppContext>) => {
  const categories = await listCategoriesFromDb()
  return successResponse(c, 200, { categories: categories.map(serializeCategory) })
}
