import type { Filter } from '@/components/reui/filters'
import {
  buildInfluencerFilterFields,
  filtersToInfluencerQuery,
  hasActiveInfluencerFilters,
} from '@/lib/studio/influencers/influencer-filters'
import type { InfluencerVisibility, WorkspaceInfluencersQuery } from '@socialista/types'

export type ManagerInfluencerVisibilityTab = 'all' | 'public' | 'private'

const FILTER_PARAM_KEYS = [
  'gender',
  'niche',
  'scene',
  'ageRange',
  'ethnicity',
  'hairColor',
  'hairStyle',
  'eyeColor',
  'skinTone',
  'bodyShape',
  'photoStyle',
  'status',
] as const

export function parseVisibilityTab(
  searchParams: Record<string, string | string[] | undefined>,
): ManagerInfluencerVisibilityTab {
  const value = searchParams.visibility
  if (value === 'public' || value === 'private') return value
  return 'all'
}

export function parseFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): Filter<string>[] {
  const filters: Filter<string>[] = []

  for (const key of FILTER_PARAM_KEYS) {
    const raw =
      key === 'scene'
        ? (searchParams.scene ?? searchParams.scenes)
        : searchParams[key]
    if (typeof raw !== 'string' || !raw) continue
    filters.push({
      id: key,
      field: key,
      operator: key === 'niche' || key === 'scene' ? 'is_any_of' : 'is_any_of',
      values: raw.split(',').filter(Boolean),
    })
  }

  return filters
}

export function buildManagerInfluencerQueryString(
  filters: Filter<string>[],
  base: URLSearchParams,
): string {
  const params = new URLSearchParams(base.toString())

  for (const key of FILTER_PARAM_KEYS) {
    params.delete(key)
  }

  for (const filter of filters) {
    if (filter.values.length === 0) continue
    if (filter.field === 'niche' || filter.field === 'scene') {
      params.set(filter.field === 'scene' ? 'scenes' : filter.field, filter.values.join(','))
    } else if (filter.field === 'status') {
      params.set('status', filter.values.join(','))
    } else {
      params.set(filter.field, filter.values.join(','))
    }
  }

  params.delete('page')
  return params.toString()
}

export function clearManagerInfluencerFiltersQuery(base: URLSearchParams): string {
  const params = new URLSearchParams(base.toString())
  for (const key of FILTER_PARAM_KEYS) {
    params.delete(key)
  }
  params.delete('page')
  return params.toString()
}

export function buildListQueryFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
  filters: Filter<string>[],
): WorkspaceInfluencersQuery {
  const tab = parseVisibilityTab(searchParams)
  const queryText = typeof searchParams.query === 'string' ? searchParams.query.trim() : ''
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1
  const limit = typeof searchParams.limit === 'string' ? Number(searchParams.limit) : 12

  const result: WorkspaceInfluencersQuery = {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 12,
    sort: 'newest',
    ...filtersToInfluencerQuery(filters),
  }

  if (queryText) result.query = queryText
  if (tab === 'public') result.visibility = 'public'
  if (tab === 'private') result.visibility = 'private'

  return result
}

export function visibilityTabToParam(tab: ManagerInfluencerVisibilityTab): string | undefined {
  if (tab === 'all') return undefined
  return tab
}

export { buildInfluencerFilterFields, hasActiveInfluencerFilters }
export type { InfluencerVisibility }
