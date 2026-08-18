import type { Skill, SkillBinding, SkillCategory, SkillStatus } from '@socialista/types'

export const SKILL_BINDING_LABELS: Record<SkillBinding, string> = {
  image: 'Image',
  video: 'Video',
  text: 'Text',
}

export const SKILL_STATUS_LABELS: Record<SkillStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

export function isMutableSkill(skill: Pick<Skill, 'source' | 'workspaceId'>) {
  return skill.source !== 'system' && skill.workspaceId !== null
}

export function isMutableCategory(category: Pick<SkillCategory, 'source' | 'workspaceId'>) {
  return category.source !== 'system' && category.workspaceId !== null
}
