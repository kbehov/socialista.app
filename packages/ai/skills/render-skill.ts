import type { SkillVariableValue } from '@socialista/types'

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g

function stringifyValue(value: SkillVariableValue): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}

type SkillVariableLike = {
  key: string
  required?: boolean
  defaultValue?: SkillVariableValue
}

/**
 * Interpolate `{{key}}` placeholders. Applies variable defaults, then `values`.
 * Throws when a required variable has no value and no default.
 */
export function renderSkillContent(
  content: string,
  variables: SkillVariableLike[] = [],
  values: Record<string, unknown> = {},
): string {
  const byKey = new Map(variables.map(variable => [variable.key, variable]))
  const resolved = new Map<string, string>()

  for (const variable of variables) {
    const raw = values[variable.key]
    if (raw !== undefined && raw !== null && raw !== '') {
      if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
        resolved.set(variable.key, stringifyValue(raw))
      } else {
        resolved.set(variable.key, String(raw))
      }
      continue
    }
    if (variable.defaultValue !== undefined) {
      resolved.set(variable.key, stringifyValue(variable.defaultValue))
      continue
    }
    if (variable.required) {
      throw new Error(`Missing required skill variable "${variable.key}"`)
    }
  }

  return content.replace(PLACEHOLDER_RE, (match, key: string) => {
    if (resolved.has(key)) return resolved.get(key)!
    const extra = values[key]
    if (typeof extra === 'string' || typeof extra === 'number' || typeof extra === 'boolean') {
      return stringifyValue(extra)
    }
    if (byKey.has(key)) return ''
    return match
  })
}
