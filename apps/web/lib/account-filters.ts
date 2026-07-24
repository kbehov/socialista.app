export const DEFAULT_ACCOUNTS_LIMIT = 50
export const MAX_ACCOUNTS_LIMIT = 100

export type GetAccountsListQuery = {
  page: number
  limit: number
  sort: string
  query?: string
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
