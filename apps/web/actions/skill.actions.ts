'use server'

import { auth } from '@/auth'
import { ApiError } from '@/lib/api'
import { getBrand } from '@/services/brand.service'
import { getModels } from '@/services/models.service'
import { createSkill } from '@/services/skill.service'
import { deductWorkspaceAiCredits } from '@/services/workspace.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { generateSkill } from '@socialista/ai'
import {
  DEFAULT_GENERATION_CREDIT_COST,
  ModelType,
  PROMPT_KEY_VALUES,
  type Brand,
  type PromptKey,
  type Skill,
  type SkillBrandContext,
} from '@socialista/types'

export type GenerateSkillActionInput = {
  description: string
  target?: PromptKey
  model?: string
  brandId?: string
}

export type GenerateSkillActionResult =
  | { success: true; skill: Skill }
  | { success: false; error: string }

function isPromptKey(value: string): value is PromptKey {
  return (PROMPT_KEY_VALUES as readonly string[]).includes(value)
}

function toSkillBrandContext(brand: Brand): SkillBrandContext | undefined {
  const name = brand.name.trim()
  if (!name) return undefined

  return {
    name,
    ...(brand.description?.trim() ? { description: brand.description.trim() } : {}),
    ...(brand.industry?.trim() ? { industry: brand.industry.trim() } : {}),
    ...(brand.website?.trim() ? { website: brand.website.trim() } : {}),
    ...(brand.colors.length > 0 ? { colors: brand.colors } : {}),
  }
}

async function loadBrandForWorkspace(brandId: string, workspace: { id: string; _id: string }) {
  try {
    const response = await getBrand(brandId)
    const brand = response.data?.brand
    if (!response.success || !brand) return null
    if (brand.workspaceId !== workspace.id && brand.workspaceId !== workspace._id) return null
    return brand
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      return null
    }
    throw error
  }
}

export async function generateSkillAction({
  description,
  target,
  model,
  brandId,
}: GenerateSkillActionInput): Promise<GenerateSkillActionResult> {
  const trimmed = description.trim()
  if (!trimmed) {
    return { success: false, error: 'Describe the skill you want to generate' }
  }

  const modelValue = model?.trim()
  if (!modelValue) {
    return { success: false, error: 'Select a text model' }
  }

  const pinnedTarget = target && isPromptKey(target) ? target : undefined
  const resolvedBrandId = brandId?.trim() || undefined

  try {
    const sessionPromise = auth()
    const workspacePromise = getCurrentWorkspace()
    const modelsPromise = getModels(
      `limit=1&modelType=${ModelType.TEXT}&value=${encodeURIComponent(modelValue)}`,
    )
    const brandPromise = resolvedBrandId
      ? workspacePromise.then(workspace =>
          workspace ? loadBrandForWorkspace(resolvedBrandId, workspace) : null,
        )
      : Promise.resolve(null)

    const session = await sessionPromise
    if (!session?.user?.id) {
      return { success: false, error: 'You must be signed in to generate a skill' }
    }

    const [workspace, modelsRes, loadedBrand] = await Promise.all([
      workspacePromise,
      modelsPromise,
      brandPromise,
    ])
    if (!workspace) {
      return { success: false, error: 'You must be in a workspace to generate a skill' }
    }

    const catalogModel = modelsRes.data?.models[0]
    if (!catalogModel || catalogModel.modelType !== ModelType.TEXT) {
      return { success: false, error: 'Select a text model' }
    }

    if (resolvedBrandId && !loadedBrand) {
      return { success: false, error: 'Brand not found' }
    }
    const brand = loadedBrand ? toSkillBrandContext(loadedBrand) : undefined

    const result = await generateSkill({
      description: trimmed,
      target: pinnedTarget,
      model: catalogModel.value,
      brand,
    })
    if (!result.content.trim()) {
      return { success: false, error: 'No skill was generated' }
    }

    const created = await createSkill({
      workspaceId: workspace.id,
      name: result.name,
      description: result.description,
      target: result.target,
      icon: result.icon || undefined,
      content: result.content,
    })
    if (!created.success || !created.data?.skill) {
      return { success: false, error: created.message ?? 'Generated the skill but failed to save it' }
    }

    try {
      await deductWorkspaceAiCredits(workspace._id, DEFAULT_GENERATION_CREDIT_COST)
    } catch (error) {
      console.error('[generateSkillAction] credits', error)
    }

    return { success: true, skill: created.data.skill }
  } catch (error) {
    console.error('[generateSkillAction]', error)
    return { success: false, error: 'Failed to generate skill. Please try again.' }
  }
}
