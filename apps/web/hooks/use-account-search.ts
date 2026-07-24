'use client'

import { buildAccountSearchQuery } from '@/lib/account-filters'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

export function useAccountSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const setSearchQuery = useCallback(
    (query: string) => {
      startTransition(() => {
        const next = buildAccountSearchQuery(new URLSearchParams(searchParams.toString()), query)
        router.push(next ? `${pathname}?${next}` : pathname)
      })
    },
    [pathname, router, searchParams],
  )

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [setSearchQuery])

  return { isPending, setSearchQuery, clearSearch }
}
