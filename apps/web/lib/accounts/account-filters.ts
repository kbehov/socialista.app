import type { Filter, FilterFieldConfig } from '@/components/reui/filters'
import { getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { STATUS_META } from '@/constants/accounts'
import type { ConnectionStatus, SocialProvider } from '@socialista/types'

export const DEFAULT_ACCOUNTS_LIMIT = 50
export const MAX_ACCOUNTS_LIMIT = 100

const ACCOUNT_PROVIDERS: SocialProvider[] = [
  'instagram',
  'facebook',
  'linkedin',
  'tiktok',
  'threads',
]

const CONNECTION_STATUSES = Object.keys(STATUS_META) as ConnectionStatus[]

export type GetAccountsListQuery = {
  page: number
  limit: number
  sort: string
  query?: string
  provider?: string
  connectionStatus?: string
}

export function buildAccountFilterFields(): FilterFieldConfig<string>[] {
  return [
    {
      key: 'provider',
      label: 'Platform',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      options: ACCOUNT_PROVIDERS.map(provider => ({
        value: provider,
        label: getSocialPlatformLabel(provider),
      })),
    },
    {
      key: 'connectionStatus',
      label: 'Status',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      options: CONNECTION_STATUSES.map(status => ({
        value: status,
        label: STATUS_META[status].label,
      })),
    },
  ]
}

export function parseAccountFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): Filter<string>[] {
  const filters: Filter<string>[] = []

  for (const field of ['provider', 'connectionStatus'] as const) {
    const value = searchParams[field]
    if (typeof value === 'string' && value) {
      filters.push({
        id: field,
        field,
        operator: 'is_any_of',
        values: value.split(',').filter(Boolean),
      })
    }
  }

  return filters
}

export function buildAccountFiltersQueryString(
  filters: Filter<string>[],
  searchParams: URLSearchParams,
): string {
  const params = new URLSearchParams(searchParams.toString())

  params.delete('provider')
  params.delete('connectionStatus')
  params.set('page', '1')

  for (const filter of filters) {
    if (filter.values.length === 0) continue
    if (filter.operator === 'empty' || filter.operator === 'not_empty') continue

    if (filter.field === 'provider' || filter.field === 'connectionStatus') {
      params.set(filter.field, filter.values.join(','))
    }
  }

  return params.toString()
}

export function hasActiveAccountFilters(filters: Filter<string>[]): boolean {
  return filters.some(filter => filter.values.length > 0)
}

export function clearAccountFiltersQuery(searchParams: URLSearchParams): string {
  const params = new URLSearchParams(searchParams.toString())

  params.delete('provider')
  params.delete('connectionStatus')
  params.set('page', '1')

  return params.toString()
}

export function getAccountsListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): GetAccountsListQuery {
  const page = Number.parseInt(
    typeof searchParams.page === 'string' ? searchParams.page : '1',
    10,
  )
  const limit = Number.parseInt(
    typeof searchParams.limit === 'string' ? searchParams.limit : String(DEFAULT_ACCOUNTS_LIMIT),
    10,
  )

  const result: GetAccountsListQuery = {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit:
      Number.isFinite(limit) && limit > 0
        ? Math.min(limit, MAX_ACCOUNTS_LIMIT)
        : DEFAULT_ACCOUNTS_LIMIT,
    sort: typeof searchParams.sort === 'string' ? searchParams.sort : 'accountName',
  }

  const query = searchParams.query
  if (typeof query === 'string' && query.trim()) {
    result.query = query.trim()
  }

  const provider = searchParams.provider
  if (typeof provider === 'string' && provider) {
    result.provider = provider
  }

  const connectionStatus = searchParams.connectionStatus
  if (typeof connectionStatus === 'string' && connectionStatus) {
    result.connectionStatus = connectionStatus
  }

  return result
}

export function buildAccountSearchQuery(
  searchParams: URLSearchParams,
  query: string,
): string {
  const params = new URLSearchParams(searchParams.toString())
  const trimmed = query.trim()

  if (trimmed) params.set('query', trimmed)
  else params.delete('query')

  params.set('page', '1')
  return params.toString()
}
