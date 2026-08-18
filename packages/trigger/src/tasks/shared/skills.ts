import { getSystemSkillBySlot, renderSkillContent } from '@socialista/ai'
import {
  findDefaultSkill,
  getSkillById,
  incrementSkillUsage,
  type ISkill,
} from '@socialista/db'
import type { SkillModelConfig, SkillSlot } from '@socialista/types'

export type LoadedSkill = {
  content: string
  modelConfig?: SkillModelConfig
  skillId?: string
}

function toLoadedSkill(skill: ISkill, variables?: Record<string, unknown>): LoadedSkill {
  return {
    content: renderSkillContent(skill.content, skill.variables ?? [], variables),
    modelConfig: skill.modelConfig,
    skillId: skill._id.toString(),
  }
}

/**
 * Resolve a skill for a generation task. Prefer explicit skillId, then the
 * workspace/system default for `slot`, then the in-code SYSTEM_SKILLS constant.
 * Never throws on a missing DB row — generation must still run.
 */
export async function loadSkillForTask(input: {
  skillId?: string
  slot: SkillSlot
  workspaceId: string
  variables?: Record<string, unknown>
}): Promise<LoadedSkill> {
  try {
    if (input.skillId) {
      const byId = await getSkillById(input.skillId)
      if (byId) {
        const workspaceId = byId.workspaceId?.toString()
        const allowed = workspaceId === undefined || workspaceId === null || workspaceId === input.workspaceId
        if (allowed) {
          await incrementSkillUsage(byId._id.toString()).catch(() => undefined)
          return toLoadedSkill(byId, input.variables)
        }
      }
    }

    const fallback = await findDefaultSkill(input.slot, input.workspaceId)
    if (fallback) {
      await incrementSkillUsage(fallback._id.toString()).catch(() => undefined)
      return toLoadedSkill(fallback, input.variables)
    }
  } catch (error) {
    console.error('[loadSkillForTask] db lookup failed, using system constant', error)
  }

  const system = getSystemSkillBySlot(input.slot)
  if (!system) {
    throw new Error(`No system skill registered for slot "${input.slot}"`)
  }

  return {
    content: renderSkillContent(system.content, system.variables ?? [], input.variables),
    modelConfig: system.modelConfig,
  }
}
