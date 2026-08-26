'use server'

import { auth } from '@/auth'
import { getModels } from '@/services/models.service'
import { createSkill } from '@/services/skill.service'
import { deductWorkspaceAiCredits } from '@/services/workspace.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { generateSkill } from '@socialista/ai'
import { ModelType, PROMPT_KEY_VALUES, type PromptKey, type Skill } from '@socialista/types'

export type GenerateSkillActionResult =
  | { success: true; skill: Skill }
  | { success: false; error: string }

function isPromptKey(value: string): value is PromptKey {
  return (PROMPT_KEY_VALUES as readonly string[]).includes(value)
}

export async function generateSkillAction(
  description: string,
  target?: PromptKey,
  model?: string,
): Promise<GenerateSkillActionResult> {
  const trimmed = description.trim()
  if (!trimmed) {
    return { success: false, error: 'Describe the skill you want to generate' }
  }

  const modelValue = model?.trim()
  if (!modelValue) {
    return { success: false, error: 'Select a text model' }
  }

  const pinnedTarget = target && isPromptKey(target) ? target : undefined

  try {
    const sessionPromise = auth()
    const workspacePromise = getCurrentWorkspace()
    const modelsPromise = getModels(
      `limit=1&modelType=${ModelType.TEXT}&value=${encodeURIComponent(modelValue)}`,
    )

    const session = await sessionPromise
    if (!session?.user?.id) {
      return { success: false, error: 'You must be signed in to generate a skill' }
    }

    const [workspace, modelsRes] = await Promise.all([workspacePromise, modelsPromise])
    if (!workspace) {
      return { success: false, error: 'You must be in a workspace to generate a skill' }
    }

    const catalogModel = modelsRes.data?.models[0]
    if (!catalogModel || catalogModel.modelType !== ModelType.TEXT) {
      return { success: false, error: 'Select a text model' }
    }

    const result = await generateSkill({
      description: trimmed,
      target: pinnedTarget,
      model: catalogModel.value,
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
      await deductWorkspaceAiCredits(workspace._id, 0.02)
    } catch (error) {
      console.error('[generateSkillAction] credits', error)
    }

    return { success: true, skill: created.data.skill }
  } catch (error) {
    console.error('[generateSkillAction]', error)
    return { success: false, error: 'Failed to generate skill. Please try again.' }
  }
}
