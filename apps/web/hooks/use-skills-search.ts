'use client'

import { buildSkillsSearchQuery } from '@/lib/skills/skills-href'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

export function useSkillsSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const setSearchQuery = useCallback(
    (query: string) => {
      startTransition(() => {
        const next = buildSkillsSearchQuery(new URLSearchParams(searchParams.toString()), query)
        router.replace(next ? `${pathname}?${next}` : pathname)
      })
    },
    [pathname, router, searchParams],
  )

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [setSearchQuery])

  return { isPending, setSearchQuery, clearSearch }
}
