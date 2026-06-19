'use client'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { getInspirationResultsRange } from '@/lib/inspiration-filters'
import type { MetaResponse } from '@socialista/types'
import { usePathname, useSearchParams } from 'next/navigation'

type InspirationsPaginationProps = {
  meta: MetaResponse
}

function buildPageHref(pathname: string, searchParams: URLSearchParams, page: number) {
  const params = new URLSearchParams(searchParams.toString())
  params.set('page', String(page))
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (current > 3) pages.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  if (current < total - 2) pages.push('ellipsis')

  pages.push(total)
  return pages
}

export function InspirationsPagination({ meta }: InspirationsPaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit))
  const currentPage = meta.page
  const { start, end } = getInspirationResultsRange(meta)

  if (meta.total === 0) {
    return null
  }

  const pages = getPageNumbers(currentPage, totalPages)
  const params = new URLSearchParams(searchParams.toString())

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs tabular-nums text-muted-foreground">
        {start}–{end} of {meta.total}
      </p>

      {totalPages > 1 && (
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent className="gap-0.5">
            <PaginationItem>
              <PaginationPrevious
                href={buildPageHref(pathname, params, currentPage - 1)}
                aria-disabled={!meta.hasPreviousPage}
                className={!meta.hasPreviousPage ? 'pointer-events-none opacity-40' : undefined}
              />
            </PaginationItem>

            {pages.map((page, index) =>
              page === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    href={buildPageHref(pathname, params, page)}
                    isActive={page === currentPage}
                    className="size-8 rounded-lg"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                href={buildPageHref(pathname, params, currentPage + 1)}
                aria-disabled={!meta.hasNextPage}
                className={!meta.hasNextPage ? 'pointer-events-none opacity-40' : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
