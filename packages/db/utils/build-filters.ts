import { Types } from 'mongoose'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../config/config.js'
export type Pagination = {
  page: number
  limit: number
  skip: number
}

export type ParsedFilters = {
  match: Record<string, unknown>
  pagination: Pagination
  sort: Record<string, 1 | -1>
  textSearch?: string
}

export type FilterQuery = {
  page?: string
  limit?: string
  sort?: string
  id?: string
  [key: string]: string | undefined
}
export const getPagination = (page: number, limit: number): Pagination => {
  const safePage = Number.isFinite(page) && page > 0 ? page : DEFAULT_PAGE
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_PAGE_SIZE
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit }
}
export const normalizeQuery = (query: FilterQuery | string): Record<string, string> => {
  if (typeof query === 'string') {
    const stripped = query.startsWith('?') ? query.slice(1) : query
    return Object.fromEntries(new URLSearchParams(stripped))
  }
  // Remove undefined values so downstream code doesn't have to guard against them
  return Object.fromEntries(Object.entries(query).filter((entry): entry is [string, string] => entry[1] != null))
}

export const toObjectId = (id: string): Types.ObjectId => new Types.ObjectId(id)

export const parseSort = (sort?: string): Record<string, 1 | -1> => {
  console.log('parseSort', sort)
  const raw = typeof sort === 'string' && sort.trim().length > 0 ? sort : '-createdAt'
  console.log('raw', raw)
  return Object.fromEntries(
    raw.split(',').map(token => {
      const trimmed = token.trim()
      const direction: 1 | -1 = trimmed.startsWith('-') ? -1 : 1
      const field = trimmed.replace(/^[-+]/, '') || 'createdAt'
      return [field, direction]
    }),
  )
}
const RESERVED_KEYS = new Set(['page', 'limit', 'sort', 'query'])
export const buildFilters = (query: FilterQuery | string): ParsedFilters => {
  const normalized = normalizeQuery(query as FilterQuery)

  const { page, limit, sort, query: textSearch, ...rest } = normalized

  const match: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(rest)) {
    if (RESERVED_KEYS.has(key) || value === '') continue
    if (key === 'id') {
      try {
        match['_id'] = toObjectId(value)
      } catch {
        // Silently skip malformed ObjectIds rather than crashing
      }
    } else {
      match[key] = value
    }
  }
  console.log('match', match)
  const trimmedSearch = textSearch?.trim()

  return {
    match,
    pagination: getPagination(parseInt(page as string, 10), parseInt(limit as string, 10)),
    sort: parseSort(sort),
    textSearch: trimmedSearch || undefined,
  }
}
