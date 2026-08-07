import type { Filter, FilterFieldConfig } from '@/components/reui/filters'
import {
  AGE_RANGE_OPTIONS,
  BODY_SHAPE_OPTIONS,
  EYE_COLOR_OPTIONS,
  GENDER_OPTIONS,
  HAIR_COLOR_OPTIONS,
  NICHE_OPTIONS,
  SKIN_TONE_OPTIONS,
} from '@/lib/studio/influencers/options'
import type { ExploreInfluencersQuery } from '@socialista/types'
import { INFLUENCER_STATUSES, type InfluencerStatus } from '@socialista/types'

export type InfluencerListTab = 'mine' | 'public'

export const INFLUENCER_LIST_LIMIT = 48

const STATUS_LABELS: Record<InfluencerStatus, string> = {
  draft: 'Draft',
  generating: 'Generating',
  ready: 'Ready',
  failed: 'Failed',
}

const FILTER_FIELDS = [
  'gender',
  'niche',
  'ageRange',
  'hairColor',
  'eyeColor',
  'skinTone',
  'bodyShape',
  'status',
] as const

export type InfluencerFilterField = (typeof FILTER_FIELDS)[number]

function toOptions(items: ReadonlyArray<{ id: string; label: string }>) {
  return items.map(item => ({ value: item.id, label: item.label }))
}

export function buildInfluencerFilterFields(options?: {
  includeStatus?: boolean
}): FilterFieldConfig<string>[] {
  const fields: FilterFieldConfig<string>[] = [
    {
      key: 'gender',
      label: 'Gender',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      options: toOptions(GENDER_OPTIONS),
    },
    {
      key: 'niche',
      label: 'Niche',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      searchable: true,
      options: toOptions(NICHE_OPTIONS),
    },
    {
      key: 'ageRange',
      label: 'Age',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      options: toOptions(AGE_RANGE_OPTIONS),
    },
    {
      key: 'hairColor',
      label: 'Hair color',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      searchable: true,
      options: toOptions(HAIR_COLOR_OPTIONS),
    },
    {
      key: 'eyeColor',
      label: 'Eye color',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      options: toOptions(EYE_COLOR_OPTIONS),
    },
    {
      key: 'skinTone',
      label: 'Skin tone',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      options: toOptions(SKIN_TONE_OPTIONS),
    },
    {
      key: 'bodyShape',
      label: 'Body',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      options: toOptions(BODY_SHAPE_OPTIONS),
    },
  ]

  if (options?.includeStatus !== false) {
    fields.push({
      key: 'status',
      label: 'Status',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      options: INFLUENCER_STATUSES.map(status => ({
        value: status,
        label: STATUS_LABELS[status],
      })),
    })
  }

  return fields
}

export function hasActiveInfluencerFilters(filters: Filter<string>[]): boolean {
  return filters.some(filter => filter.values.length > 0)
}

/** Drop status filters when browsing the public library (API forces ready). */
export function sanitizeFiltersForTab(
  filters: Filter<string>[],
  tab: InfluencerListTab,
): Filter<string>[] {
  if (tab === 'mine') return filters
  return filters.filter(filter => filter.field !== 'status')
}

export function filtersToInfluencerQuery(
  filters: Filter<string>[],
): Pick<
  ExploreInfluencersQuery,
  | 'gender'
  | 'niche'
  | 'ageRange'
  | 'hairColor'
  | 'eyeColor'
  | 'skinTone'
  | 'bodyShape'
  | 'status'
> {
  const query: ReturnType<typeof filtersToInfluencerQuery> = {}

  for (const filter of filters) {
    if (filter.values.length === 0) continue
    if (filter.operator === 'empty' || filter.operator === 'not_empty') continue

    const joined = filter.values.join(',')
    switch (filter.field) {
      case 'gender':
        query.gender = joined
        break
      case 'niche':
        query.niche = filter.values
        break
      case 'ageRange':
        query.ageRange = joined
        break
      case 'hairColor':
        query.hairColor = joined
        break
      case 'eyeColor':
        query.eyeColor = joined
        break
      case 'skinTone':
        query.skinTone = joined
        break
      case 'bodyShape':
        query.bodyShape = joined
        break
      case 'status':
        query.status = joined
        break
      default:
        break
    }
  }

  return query
}
