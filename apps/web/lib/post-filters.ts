import type { Filter, FilterFieldConfig } from '@/components/reui/filters'
import { getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import type { AccountSummary, PostStatus, SocialProvider } from '@socialista/types'

export type PostViewMode = 'list' | 'calendar'

const POST_STATUSES: PostStatus[] = [
  'draft',
  'scheduled',
  'publishing',
  'published',
  'failed',
  'canceled',
]

const POST_PROVIDERS: SocialProvider[] = [
  'instagram',
  'facebook',
  'twitter',
  'linkedin',
  'tiktok',
  'youtube',
  'pinterest',
  'threads',
]

export const DEFAULT_POSTS_LIMIT = 20
export const CALENDAR_POSTS_LIMIT = 250

export function buildPostFilterFields(accounts: AccountSummary[]): FilterFieldConfig<string>[] {
  return [
    {
      key: 'status',
      label: 'Status',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      options: POST_STATUSES.map(status => ({
        value: status,
        label: status.charAt(0).toUpperCase() + status.slice(1),
      })),
    },
    {
      key: 'provider',
      label: 'Platform',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      options: POST_PROVIDERS.map(provider => ({
        value: provider,
        label: getSocialPlatformLabel(provider),
      })),
    },
    {
      key: 'account',
      label: 'Account',
      type: 'multiselect',
      defaultOperator: 'is_any_of',
      options: accounts.map(account => ({
        value: account._id,
        label: account.accountName || account.username || account._id,
      })),
    },
  ]
}

export function parsePostFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): Filter<string>[] {
  const filters: Filter<string>[] = []

  for (const field of ['status', 'provider', 'account'] as const) {
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

export function parsePostViewMode(
  value: string | string[] | undefined,
): PostViewMode {
  if (value === 'calendar') return 'calendar'
  return 'list'
}

export function parseMonthKey(
  value: string | string[] | undefined,
  fallback = new Date(),
): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
    return value
  }

  const year = fallback.getFullYear()
  const month = String(fallback.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function getMonthRange(monthKey: string): { from: string; to: string } {
  const [yearStr, monthStr] = monthKey.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0)
  const end = new Date(year, month, 0, 23, 59, 59, 999)
  return { from: start.toISOString(), to: end.toISOString() }
}

export function monthKeyToDate(monthKey: string): Date {
  const [yearStr, monthStr] = monthKey.split('-')
  return new Date(Number(yearStr), Number(monthStr) - 1, 1)
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

export function buildPostQueryString(
  filters: Filter<string>[],
  searchParams: URLSearchParams,
): string {
  const params = new URLSearchParams(searchParams.toString())

  params.delete('status')
  params.delete('provider')
  params.delete('account')
  params.set('page', '1')

  for (const filter of filters) {
    if (filter.values.length === 0) continue
    if (filter.operator === 'empty' || filter.operator === 'not_empty') continue

    if (filter.field === 'status' || filter.field === 'provider' || filter.field === 'account') {
      params.set(filter.field, filter.values.join(','))
    }
  }

  return params.toString()
}

export function hasActivePostFilters(filters: Filter<string>[]): boolean {
  return filters.some(filter => filter.values.length > 0)
}

export function clearPostFiltersQuery(searchParams: URLSearchParams): string {
  const params = new URLSearchParams(searchParams.toString())

  params.delete('status')
  params.delete('provider')
  params.delete('account')
  params.set('page', '1')

  return params.toString()
}

export type GetPostsListQuery = {
  page: number
  limit: number
  sort: string
  status?: string
  provider?: string
  account?: string
  from?: string
  to?: string
  view: PostViewMode
  month: string
}

export function getPostsListQuery(
  searchParams: Record<string, string | string[] | undefined>,
): GetPostsListQuery {
  const params = toSearchParamsRecord(searchParams)
  const view = parsePostViewMode(searchParams.view)
  const month = parseMonthKey(searchParams.month)

  const page = Number.parseInt(params.get('page') ?? '1', 10)
  const limit = Number.parseInt(
    params.get('limit') ?? String(view === 'calendar' ? CALENDAR_POSTS_LIMIT : DEFAULT_POSTS_LIMIT),
    10,
  )

  const query: GetPostsListQuery = {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_POSTS_LIMIT,
    sort: params.get('sort') ?? (view === 'calendar' ? 'scheduledAt' : '-scheduledAt'),
    view,
    month,
  }

  const status = params.get('status')
  const provider = params.get('provider')
  const account = params.get('account')
  if (status) query.status = status
  if (provider) query.provider = provider
  if (account) query.account = account

  if (view === 'calendar') {
    const range = getMonthRange(month)
    query.from = range.from
    query.to = range.to
    query.page = 1
    query.limit = CALENDAR_POSTS_LIMIT
  }

  return query
}
