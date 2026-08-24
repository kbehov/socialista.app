import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { SkillsSort } from './skill-list'

export function skillsHref(options?: { sort?: SkillsSort; query?: string }) {
  const params = new URLSearchParams()
  if (options?.sort === 'recent') params.set('sort', 'recent')
  if (options?.query) params.set('q', options.query)
  const search = params.toString()
  return search ? `${DASHBOARD_ROUTES.SKILLS}?${search}` : DASHBOARD_ROUTES.SKILLS
}

export function buildSkillsSearchQuery(searchParams: URLSearchParams, query: string): string {
  const params = new URLSearchParams(searchParams.toString())
  const trimmed = query.trim()

  if (trimmed) params.set('q', trimmed)
  else params.delete('q')

  return params.toString()
}
