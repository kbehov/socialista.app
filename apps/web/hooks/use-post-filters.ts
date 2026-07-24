'use client'

import type { Filter } from '@/components/reui/filters'
import {
  buildPostQueryString,
  clearPostFiltersQuery,
  type PostViewMode,
} from '@/lib/post-filters'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

export function usePostFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const navigate = useCallback(
    (query: string) => {
      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname)
      })
    },
    [pathname, router],
  )

  const applyFilters = useCallback(
    (filters: Filter<string>[]) => {
      navigate(buildPostQueryString(filters, new URLSearchParams(searchParams.toString())))
    },
    [navigate, searchParams],
  )

  const clearFilters = useCallback(() => {
    navigate(clearPostFiltersQuery(new URLSearchParams(searchParams.toString())))
  }, [navigate, searchParams])

  const setView = useCallback(
    (view: PostViewMode) => {
      const params = new URLSearchParams(searchParams.toString())
      if (view === 'list') params.delete('view')
      else params.set('view', view)
      params.set('page', '1')
      navigate(params.toString())
    },
    [navigate, searchParams],
  )

  const setMonth = useCallback(
    (monthKey: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('month', monthKey)
      params.set('view', 'calendar')
      navigate(params.toString())
    },
    [navigate, searchParams],
  )

  return { isPending, applyFilters, clearFilters, setView, setMonth }
}
