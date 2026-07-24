import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/config.js'
import { toObjectId } from './isValid.js'

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
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : DEFAULT_PAGE
  const rawLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_PAGE_SIZE
  const safeLimit = Math.min(rawLimit, MAX_PAGE_SIZE)
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

export { toObjectId }

export const parseSort = (sort?: string): Record<string, 1 | -1> => {
  const raw = typeof sort === 'string' && sort.trim().length > 0 ? sort : '-createdAt'
  return Object.fromEntries(
    raw.split(',').map(token => {
      const trimmed = token.trim()
      const direction: 1 | -1 = trimmed.startsWith('-') ? -1 : 1
      const field = trimmed.replace(/^[-+]/, '') || 'createdAt'
      return [field, direction]
    }),
  )
}

const RESERVED_KEYS = new Set(['page', 'limit', 'sort', 'query', 'from', 'to'])

/** Query keys that map to ObjectId fields in MongoDB documents. */
const OBJECT_ID_KEYS = new Set([
  'account',
  'workspace',
  'workspaceId',
  'createdBy',
  'uploadedBy',
  'ownerId',
])

const tryToObjectId = (value: string) => {
  try {
    return toObjectId(value)
  } catch {
    return null
  }
}

export const buildFilters = (query: FilterQuery | string): ParsedFilters => {
  const normalized = normalizeQuery(query as FilterQuery)

  const { page, limit, sort, query: textSearch, ...rest } = normalized

  const match: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(rest)) {
    if (RESERVED_KEYS.has(key) || value === '') continue
    if (key === 'id') {
      const objectId = tryToObjectId(value)
      if (objectId) match['_id'] = objectId
    } else if (value.includes(',')) {
      const parts = value
        .split(',')
        .map(part => part.trim())
        .filter(Boolean)
      if (parts.length === 0) continue
      if (OBJECT_ID_KEYS.has(key)) {
        const ids = parts.map(tryToObjectId).filter((id): id is NonNullable<ReturnType<typeof tryToObjectId>> => id !== null)
        if (ids.length > 0) match[key] = { $in: ids }
      } else {
        match[key] = { $in: parts }
      }
    } else if (OBJECT_ID_KEYS.has(key)) {
      const objectId = tryToObjectId(value)
      if (objectId) match[key] = objectId
      // Skip malformed ObjectIds rather than matching as strings against ObjectId fields
    } else {
      match[key] = value
    }
  }

  const from = normalized.from
  const to = normalized.to
  if (from || to) {
    const scheduledAt: Record<string, Date> = {}
    if (from) scheduledAt.$gte = new Date(from)
    if (to) scheduledAt.$lte = new Date(to)
    match.scheduledAt = scheduledAt
  }
  const trimmedSearch = textSearch?.trim()

  return {
    match,
    pagination: getPagination(parseInt(page as string, 10), parseInt(limit as string, 10)),
    sort: parseSort(sort),
    textSearch: trimmedSearch || undefined,
  }
}
