'use client'

import type { Filter } from '@/components/reui/filters'
import { buildAccountFiltersQueryString, clearAccountFiltersQuery } from '@/lib/accounts/account-filters'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

export function useAccountFilters() {
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
      navigate(buildAccountFiltersQueryString(filters, new URLSearchParams(searchParams.toString())))
    },
    [navigate, searchParams],
  )

  const clearFilters = useCallback(() => {
    navigate(clearAccountFiltersQuery(new URLSearchParams(searchParams.toString())))
  }, [navigate, searchParams])

  return { isPending, applyFilters, clearFilters }
}
