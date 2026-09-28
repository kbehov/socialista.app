import type { ImportedSkillDraft } from './parse-skill-markdown'
import { normalizeSkillTarget } from '@socialista/types'

export const SKILL_IMPORT_STORAGE_KEY = 'socialista:skill-import:v1'

export function storeImportedSkillDraft(draft: ImportedSkillDraft) {
  try {
    sessionStorage.setItem(SKILL_IMPORT_STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Private browsing / quota
  }
}

export function consumeImportedSkillDraft(): ImportedSkillDraft | null {
  try {
    const raw = sessionStorage.getItem(SKILL_IMPORT_STORAGE_KEY)
    if (!raw) return null
    sessionStorage.removeItem(SKILL_IMPORT_STORAGE_KEY)
    const parsed = JSON.parse(raw) as Partial<ImportedSkillDraft>
    if (typeof parsed.content !== 'string') return null
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      description: typeof parsed.description === 'string' ? parsed.description : '',
      target:
        typeof parsed.target === 'string'
          ? (normalizeSkillTarget(parsed.target) ?? 'image-prompt')
          : 'image-prompt',
      icon: typeof parsed.icon === 'string' ? parsed.icon : '',
      content: parsed.content,
    }
  } catch {
    return null
  }
}
