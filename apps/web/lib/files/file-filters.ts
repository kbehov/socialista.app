import { resolveKind } from '@/components/files/attach-media/utils'
import type { Filter, FilterFieldConfig } from '@/components/reui/filters'
import type { ImageResponse } from '@socialista/types'

export const DEFAULT_FILE_SORT = '-createdAt'

export const FILE_SORT_FILTER_OPTIONS = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
  { value: 'key', label: 'Name (A–Z)' },
  { value: '-key', label: 'Name (Z–A)' },
] as const

export const FILE_TYPE_FILTER_OPTIONS = [
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
] as const

export function buildFileFilterFields(): FilterFieldConfig<string>[] {
  return [
    {
      key: 'type',
      label: 'Type',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      searchable: false,
      options: [...FILE_TYPE_FILTER_OPTIONS],
    },
    {
      key: 'sort',
      label: 'Sort',
      type: 'select',
      defaultOperator: 'is',
      searchable: false,
      options: [...FILE_SORT_FILTER_OPTIONS],
    },
  ]
}

export function parseFileFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): Filter<string>[] {
  const filters: Filter<string>[] = []

  const type = searchParams.type
  if (typeof type === 'string' && type) {
    filters.push({
      id: 'type',
      field: 'type',
      operator: 'is_any_of',
      values: type.split(',').filter(Boolean),
    })
  }

  const sort = searchParams.sort
  if (typeof sort === 'string' && sort && sort !== DEFAULT_FILE_SORT) {
    filters.push({
      id: 'sort',
      field: 'sort',
      operator: 'is',
      values: [sort],
    })
  }

  return filters
}

export function buildFileQueryString(filters: Filter<string>[], searchParams: URLSearchParams): string {
  const params = new URLSearchParams(searchParams.toString())
  params.delete('type')
  params.delete('sort')

  for (const filter of filters) {
    if (filter.values.length === 0) continue

    if (filter.field === 'type') {
      params.set('type', filter.values.join(','))
    }
    if (filter.field === 'sort') {
      const value = filter.values[0]
      if (value && value !== DEFAULT_FILE_SORT) {
        params.set('sort', value)
      }
    }
  }

  return params.toString()
}

export function clearFileFiltersQuery(searchParams: URLSearchParams): string {
  const params = new URLSearchParams(searchParams.toString())
  params.delete('type')
  params.delete('sort')
  return params.toString()
}

export function getFileSortFromFilters(filters: Filter<string>[]): string {
  const sortFilter = filters.find(f => f.field === 'sort')
  const value = sortFilter?.values[0]
  if (typeof value === 'string' && value) return value
  return DEFAULT_FILE_SORT
}

export function getFileTypesFromFilters(filters: Filter<string>[]): Array<'image' | 'video'> {
  const typeFilter = filters.find(f => f.field === 'type')
  if (!typeFilter?.values.length) return []
  return typeFilter.values.filter((v): v is 'image' | 'video' => v === 'image' || v === 'video')
}

export function hasActiveFileFilters(filters: Filter<string>[]): boolean {
  if (getFileTypesFromFilters(filters).length > 0) return true
  return getFileSortFromFilters(filters) !== DEFAULT_FILE_SORT
}

export function countActiveFileFilters(filters: Filter<string>[]): number {
  let count = 0
  if (getFileTypesFromFilters(filters).length > 0) count += 1
  if (getFileSortFromFilters(filters) !== DEFAULT_FILE_SORT) count += 1
  return count
}

export function filterFilesByType(files: ImageResponse[], types: Array<'image' | 'video'>): ImageResponse[] {
  if (types.length === 0) return files
  const allowed = new Set(types)
  return files.filter(file => {
    const kind = resolveKind(file)
    return kind !== null && allowed.has(kind)
  })
}
