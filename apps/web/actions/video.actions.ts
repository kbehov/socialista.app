'use server'

import { auth } from '@/auth'
import { getModels } from '@/services/models.service'
import { deductWorkspaceAiCredits } from '@/services/workspace.service'
import { loadSkillOverride } from '@/services/skill.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { generateVideoScript } from '@socialista/ai'
import {
  DEFAULT_GENERATION_CREDIT_COST,
  ModelType,
  PROMPT_KEYS,
  type Model,
  type VideoScriptSegment,
  type VideoScriptTone,
} from '@socialista/types'

export type GenerateVideoScriptActionResult =
  | { success: true; title: string; segments: VideoScriptSegment[] }
  | { success: false; error: string }

const MIN_DURATION = 5
const MAX_DURATION = 600

async function resolveTextModel(
  value?: string,
): Promise<{ ok: true; model?: Model; cost: number } | { ok: false; error: string }> {
  const trimmed = value?.trim()
  if (!trimmed) return { ok: true, cost: DEFAULT_GENERATION_CREDIT_COST }

  const modelsRes = await getModels(
    `limit=1&modelType=${ModelType.TEXT}&value=${encodeURIComponent(trimmed)}`,
  )
  const model = modelsRes.data?.models[0]
  if (!model || model.modelType !== ModelType.TEXT) {
    return { ok: false, error: 'Select a text model to write the script.' }
  }
  return { ok: true, model, cost: model.cost }
}

export async function generateVideoScriptAction(
  description: string,
  duration: number,
  tone?: VideoScriptTone,
  skillId?: string,
  textModel?: string,
): Promise<GenerateVideoScriptActionResult> {
  const trimmed = description.trim()
  if (!trimmed) {
    return { success: false, error: 'Enter a description of your video first' }
  }

  if (!Number.isFinite(duration) || duration < MIN_DURATION || duration > MAX_DURATION) {
    return {
      success: false,
      error: `Duration must be between ${MIN_DURATION} and ${MAX_DURATION} seconds`,
    }
  }

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'You must be signed in to generate a script' }
    }

    const workspaceId = await getCurrentWorkspace()
    if (!workspaceId) {
      return { success: false, error: 'You must be in a workspace to generate a script' }
    }

    const textModelRes = await resolveTextModel(textModel)
    if (!textModelRes.ok) {
      return { success: false, error: textModelRes.error }
    }

    const systemOverride = await loadSkillOverride(workspaceId._id, PROMPT_KEYS.videoScript, skillId)
    const result = await generateVideoScript({
      description: trimmed,
      duration,
      tone,
      systemOverride,
      ...(textModelRes.model ? { model: textModelRes.model.value } : {}),
    })
    if (result.segments.length === 0) {
      return { success: false, error: 'No script segments were generated' }
    }

    await deductWorkspaceAiCredits(workspaceId._id, textModelRes.cost)
    return { success: true, title: result.title, segments: result.segments }
  } catch (error) {
    console.error('[generateVideoScriptAction]', error)
    return { success: false, error: 'Failed to generate script. Please try again.' }
  }
}
