import { PROMPT_KEY_VALUES, type PromptKey } from '@socialista/types'

export type ImportedSkillDraft = {
  name: string
  description: string
  target: PromptKey
  icon: string
  content: string
}

const TARGETS = new Set<PromptKey>(PROMPT_KEY_VALUES)

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/

function parseSimpleYaml(yaml: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of yaml.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf(':')
    if (separator === -1) continue
    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (key) result[key] = value
  }
  return result
}

function nameFromFilename(filename: string) {
  const base = filename.replace(/\.(md|markdown)$/i, '').replace(/[-_]+/g, ' ').trim()
  if (!base) return 'Untitled skill'
  return base.charAt(0).toUpperCase() + base.slice(1)
}

function asTarget(value: string | undefined): PromptKey {
  if (value && TARGETS.has(value as PromptKey)) return value as PromptKey
  return 'image-prompt'
}

export function parseSkillMarkdown(markdown: string, filename: string): ImportedSkillDraft {
  const match = markdown.match(FRONTMATTER_RE)
  if (!match) {
    return {
      name: nameFromFilename(filename),
      description: '',
      target: 'image-prompt',
      icon: '',
      content: markdown.trim(),
    }
  }

  const frontmatter = parseSimpleYaml(match[1] ?? '')
  const content = (match[2] ?? '').trim()

  return {
    name: frontmatter.name?.trim() || nameFromFilename(filename),
    description: frontmatter.description?.trim() ?? '',
    target: asTarget(frontmatter.target?.trim() ?? frontmatter.binding?.trim()),
    icon: frontmatter.icon?.trim() ?? '',
    content,
  }
}
