import type { Filter, FilterFieldConfig } from '@/components/reui/filters'
import type { InspirationCategoryResponse, InspirationNicheResponse } from '@socialista/types'

export function buildInspirationFilterFields(
  categories: InspirationCategoryResponse[],
  niches: InspirationNicheResponse[],
): FilterFieldConfig<string>[] {
  return [
    {
      key: 'contentType',
      label: 'Type',
      type: 'select',
      defaultOperator: 'is',
      options: [
        { value: 'video', label: 'Video' },
        { value: 'slideshow', label: 'Slideshow' },
      ],
    },
    {
      key: 'categories',
      label: 'Category',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      options: categories.map(category => ({
        value: category._id,
        label: category.name,
      })),
    },
    {
      key: 'niches',
      label: 'Niche',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      options: niches.map(niche => ({
        value: niche._id,
        label: niche.name,
      })),
    },
  ]
}

export function parseFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): Filter<string>[] {
  const filters: Filter<string>[] = []

  const contentType = searchParams.contentType
  if (typeof contentType === 'string' && contentType) {
    filters.push({
      id: 'contentType',
      field: 'contentType',
      operator: 'is',
      values: [contentType],
    })
  }

  const categories = searchParams.categories
  if (typeof categories === 'string' && categories) {
    filters.push({
      id: 'categories',
      field: 'categories',
      operator: 'is_any_of',
      values: categories.split(',').filter(Boolean),
    })
  }

  const niches = searchParams.niches
  if (typeof niches === 'string' && niches) {
    filters.push({
      id: 'niches',
      field: 'niches',
      operator: 'is_any_of',
      values: niches.split(',').filter(Boolean),
    })
  }

  return filters
}

export function buildInspirationQueryString(
  filters: Filter<string>[],
  searchParams: URLSearchParams,
): string {
  const params = new URLSearchParams(searchParams)

  params.delete('contentType')
  params.delete('categories')
  params.delete('niches')
  params.set('page', '1')

  for (const filter of filters) {
    if (filter.values.length === 0) continue
    if (filter.operator === 'empty' || filter.operator === 'not_empty') continue

    if (filter.field === 'contentType') {
      params.set('contentType', filter.values[0]!)
    }

    if (filter.field === 'categories' || filter.field === 'niches') {
      params.set(filter.field, filter.values.join(','))
    }
  }

  return params.toString()
}

export function toSearchParamsRecord(
  searchParams: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') {
      params.set(key, value)
    } else if (Array.isArray(value)) {
      params.set(key, value.join(','))
    }
  }

  return params
}

export function hasActiveInspirationFilters(filters: Filter<string>[]): boolean {
  return filters.some(filter => filter.values.length > 0)
}

export function clearInspirationFiltersQuery(searchParams: URLSearchParams): string {
  const params = new URLSearchParams(searchParams.toString())

  params.delete('contentType')
  params.delete('categories')
  params.delete('niches')
  params.set('page', '1')

  return params.toString()
}

export function getInspirationResultsRange(meta: {
  total: number
  page: number
  limit: number
}): { start: number; end: number } {
  if (meta.total === 0) {
    return { start: 0, end: 0 }
  }

  const start = (meta.page - 1) * meta.limit + 1
  const end = Math.min(meta.page * meta.limit, meta.total)

  return { start, end }
}
