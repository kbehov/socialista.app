import { getSkillById, incrementSkillUsage } from '@socialista/db'
import type { PromptKey } from '@socialista/types'

/** Returns the skill's content to use as the system prompt, or undefined for the default. */
export async function loadSkillOverride(input: {
  skillId?: string
  target: PromptKey
  workspaceId: string
}): Promise<string | undefined> {
  if (!input.skillId) return undefined
  try {
    const skill = await getSkillById(input.skillId)
    if (!skill) return undefined
    if (skill.workspaceId.toString() !== input.workspaceId) return undefined
    if (skill.target !== input.target) return undefined
    void incrementSkillUsage(input.skillId).catch(() => undefined)
    return skill.content
  } catch {
    return undefined
  }
}
