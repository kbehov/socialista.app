import type { PromptKey, Skill } from '@socialista/types'

export type SkillListItem = {
  _id: string
  name: string
  slug: string
  target: PromptKey
  usageCount: number
  icon?: string
}

export type SkillsSort = 'usage' | 'recent'

export function toSkillListItem(skill: Skill): SkillListItem {
  return {
    _id: skill._id,
    name: skill.name,
    slug: skill.slug,
    target: skill.target,
    usageCount: skill.usageCount,
    ...(skill.icon ? { icon: skill.icon } : {}),
  }
}

export function maxSkillUsage(skills: readonly SkillListItem[]): number {
  let max = 0
  for (const skill of skills) {
    if (skill.usageCount > max) max = skill.usageCount
  }
  return max
}

export function sortWorkspaceSkills(skills: Skill[], sort: SkillsSort): Skill[] {
  if (sort === 'recent') {
    return skills.toSorted((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  return skills.toSorted((a, b) => {
    const usageDelta = b.usageCount - a.usageCount
    if (usageDelta !== 0) return usageDelta
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}
