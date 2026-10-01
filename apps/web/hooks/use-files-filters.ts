'use client'

import type { Filter } from '@/components/reui/filters'
import { buildFileQueryString, clearFileFiltersQuery } from '@/lib/files/file-filters'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

export function useFilesFilters() {
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
      navigate(buildFileQueryString(filters, new URLSearchParams(searchParams.toString())))
    },
    [navigate, searchParams],
  )

  const clearFilters = useCallback(() => {
    navigate(clearFileFiltersQuery(new URLSearchParams(searchParams.toString())))
  }, [navigate, searchParams])

  return { isPending, applyFilters, clearFilters }
}
