'use client'

import type { Filter } from '@/components/reui/filters'
import {
  buildInspirationQueryString,
  clearInspirationFiltersQuery,
} from '@/lib/inspiration-filters'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

export function useInspirationFilters() {
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
      navigate(buildInspirationQueryString(filters, new URLSearchParams(searchParams.toString())))
    },
    [navigate, searchParams],
  )

  const clearFilters = useCallback(() => {
    navigate(clearInspirationFiltersQuery(new URLSearchParams(searchParams.toString())))
  }, [navigate, searchParams])

  return { isPending, applyFilters, clearFilters }
}
