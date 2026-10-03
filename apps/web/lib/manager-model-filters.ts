import type { Filter, FilterFieldConfig } from '@/components/reui/filters'
import { CONTEXT_SUPPORT_OPTIONS } from '@/lib/model-context-support'
import { MODEL_TYPE_OPTIONS } from '@/lib/model-type'
import { COST_UNIT_OPTIONS } from '@/lib/zod/model.schema'
import type { AiCompany, Model } from '@socialista/types'

const NUMERIC_OPERATORS = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'not equals' },
  { value: 'greater_than', label: 'greater than' },
  { value: 'less_than', label: 'less than' },
] as const

export function buildManagerModelFilterFields(
  models: Model[],
  companies: AiCompany[],
): FilterFieldConfig<string>[] {
  const providerOptions = [...new Set(models.map(model => model.modelProvider).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map(provider => ({ value: provider, label: provider }))

  const companyOptions = companies
    .map(company => ({ value: company._id, label: company.name }))
    .sort((a, b) => a.label.localeCompare(b.label))

  return [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      defaultOperator: 'contains',
      placeholder: 'Model name…',
    },
    {
      key: 'modelType',
      label: 'Type',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      options: MODEL_TYPE_OPTIONS.map(option => ({
        value: option.value,
        label: option.label,
      })),
    },
    {
      key: 'company',
      label: 'Company',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      searchable: true,
      options: companyOptions,
    },
    {
      key: 'modelProvider',
      label: 'Provider',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      searchable: true,
      options: providerOptions,
    },
    {
      key: 'costUnit',
      label: 'Cost unit',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      options: COST_UNIT_OPTIONS.map(option => ({
        value: option.value,
        label: option.label,
      })),
    },
    {
      key: 'contextSupports',
      label: 'Context',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      options: CONTEXT_SUPPORT_OPTIONS.map(option => ({
        value: option.value,
        label: option.label,
      })),
    },
    {
      key: 'cost',
      label: 'Cost',
      type: 'text',
      defaultOperator: 'equals',
      operators: [...NUMERIC_OPERATORS],
      placeholder: 'Credits…',
    },
    {
      key: 'usageCount',
      label: 'Usage',
      type: 'text',
      defaultOperator: 'greater_than',
      operators: [...NUMERIC_OPERATORS],
      placeholder: 'Count…',
    },
    {
      key: 'allowedInUgc',
      label: 'UGC',
      type: 'select',
      defaultOperator: 'is',
      options: [
        { value: 'true', label: 'Allowed' },
        { value: 'false', label: 'Not allowed' },
      ],
    },
  ]
}

export function hasActiveModelFilters(filters: Filter<string>[]): boolean {
  return filters.some(filter => {
    if (filter.operator === 'empty' || filter.operator === 'not_empty') return true
    return filter.values.some(value => String(value).trim() !== '')
  })
}

function parseNumericFilterValue(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : null
}

function matchNumeric(value: number, operator: string, raw: string): boolean {
  const target = parseNumericFilterValue(raw)
  if (target === null) return true

  switch (operator) {
    case 'equals':
      return value === target
    case 'not_equals':
      return value !== target
    case 'greater_than':
      return value > target
    case 'less_than':
      return value < target
    default:
      return true
  }
}

function matchText(haystack: string, operator: string, raw: string): boolean {
  const needle = raw.trim()
  const value = haystack.toLowerCase()

  switch (operator) {
    case 'empty':
      return haystack.length === 0
    case 'not_empty':
      return haystack.length > 0
    case 'contains':
      return needle ? value.includes(needle.toLowerCase()) : true
    case 'not_contains':
      return needle ? !value.includes(needle.toLowerCase()) : true
    case 'starts_with':
      return needle ? value.startsWith(needle.toLowerCase()) : true
    case 'ends_with':
      return needle ? value.endsWith(needle.toLowerCase()) : true
    case 'is':
      return needle ? value === needle.toLowerCase() : true
    default:
      return true
  }
}

function matchMultiselect(
  selected: string[],
  operator: string,
  values: string[],
): boolean {
  if (operator === 'empty') return selected.length === 0
  if (operator === 'not_empty') return selected.length > 0
  if (values.length === 0) return true

  const set = new Set(selected)

  switch (operator) {
    case 'is':
    case 'is_any_of':
      return values.some(value => set.has(value))
    case 'is_not':
    case 'is_not_any_of':
      return values.every(value => !set.has(value))
    case 'includes_all':
      return values.every(value => set.has(value))
    case 'excludes_all':
      return values.every(value => !set.has(value))
    default:
      return values.some(value => set.has(value))
  }
}

function modelMatchesFilter(model: Model, filter: Filter<string>): boolean {
  const { field, operator, values } = filter

  switch (field) {
    case 'name':
      return matchText(model.name, operator, String(values[0] ?? ''))
    case 'modelType':
      return matchMultiselect([model.modelType], operator, values)
    case 'company': {
      const companyId = model.company?._id
      if (!companyId) {
        return operator === 'empty' || (operator === 'is_not_any_of' && values.length > 0)
      }
      return matchMultiselect([companyId], operator, values)
    }
    case 'modelProvider':
      return matchMultiselect([model.modelProvider], operator, values)
    case 'costUnit':
      return matchMultiselect([model.costUnit], operator, values)
    case 'contextSupports':
      return matchMultiselect(model.contextSupports ?? [], operator, values)
    case 'cost':
      return matchNumeric(model.cost, operator, String(values[0] ?? ''))
    case 'usageCount':
      return matchNumeric(model.usageCount ?? 0, operator, String(values[0] ?? ''))
    case 'allowedInUgc': {
      const raw = String(values[0] ?? '')
      if (!raw) return true
      const expected = raw === 'true'
      if (operator === 'is_not') return Boolean(model.allowedInUgc) !== expected
      return Boolean(model.allowedInUgc) === expected
    }
    default:
      return true
  }
}

export function applyModelFilters(models: Model[], filters: Filter<string>[]): Model[] {
  if (filters.length === 0) return models

  return models.filter(model =>
    filters.every(filter => modelMatchesFilter(model, filter)),
  )
}
