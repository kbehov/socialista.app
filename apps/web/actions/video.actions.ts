'use server'

import { auth } from '@/auth'
import { deductWorkspaceAiCredits } from '@/services/workspace.service'
import { loadSkillOverride } from '@/services/skill.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { generateVideoScript } from '@socialista/ai'
import { PROMPT_KEYS, type VideoScriptSegment, type VideoScriptTone } from '@socialista/types'

export type GenerateVideoScriptActionResult =
  | { success: true; title: string; segments: VideoScriptSegment[] }
  | { success: false; error: string }

const MIN_DURATION = 5
const MAX_DURATION = 600

export async function generateVideoScriptAction(
  description: string,
  duration: number,
  tone?: VideoScriptTone,
  skillId?: string,
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

    const systemOverride = await loadSkillOverride(workspaceId._id, PROMPT_KEYS.videoScript, skillId)
    const result = await generateVideoScript({
      description: trimmed,
      duration,
      tone,
      systemOverride,
    })
    if (result.segments.length === 0) {
      return { success: false, error: 'No script segments were generated' }
    }

    await deductWorkspaceAiCredits(workspaceId._id, 0.02)
    return { success: true, title: result.title, segments: result.segments }
  } catch (error) {
    console.error('[generateVideoScriptAction]', error)
    return { success: false, error: 'Failed to generate script. Please try again.' }
  }
}
