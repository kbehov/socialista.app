import type { StudioTemplateCategoryDto } from '@socialista/types'

export function mergeStudioTemplateCategories(
  groups: StudioTemplateCategoryDto[][],
): StudioTemplateCategoryDto[] {
  const byName = new Map<string, StudioTemplateCategoryDto>()
  for (const category of groups.flat()) {
    const existing = byName.get(category.name)
    if (!existing) {
      byName.set(category.name, { ...category })
      continue
    }
    byName.set(category.name, {
      ...existing,
      templatesCount: existing.templatesCount + category.templatesCount,
    })
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))
}
