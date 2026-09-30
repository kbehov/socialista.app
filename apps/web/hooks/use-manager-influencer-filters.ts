'use client'

import type { Filter } from '@/components/reui/filters'
import {
  buildManagerInfluencerQueryString,
  clearManagerInfluencerFiltersQuery,
} from '@/lib/manager-influencer-filters'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

export function useManagerInfluencerFilters() {
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
      navigate(buildManagerInfluencerQueryString(filters, new URLSearchParams(searchParams.toString())))
    },
    [navigate, searchParams],
  )

  const clearFilters = useCallback(() => {
    navigate(clearManagerInfluencerFiltersQuery(new URLSearchParams(searchParams.toString())))
  }, [navigate, searchParams])

  return { isPending, applyFilters, clearFilters }
}
