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
import { cn } from '@/lib/utils'
import type { MetaResponse } from '@socialista/types'
import { usePathname, useSearchParams } from 'next/navigation'

type SmartPaginationProps = {
  meta: MetaResponse
  /** Query param for the page number. Defaults to `page`. */
  pageParam?: string
  className?: string
  /** Hide the "Showing x–y of z" label. */
  hideSummary?: boolean
}

function buildPageHref(
  pathname: string,
  searchParams: URLSearchParams,
  page: number,
  pageParam: string,
) {
  const params = new URLSearchParams(searchParams.toString())
  params.set(pageParam, String(page))
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

function getResultsRange(meta: MetaResponse): { start: number; end: number } {
  if (meta.total === 0) return { start: 0, end: 0 }
  const start = (meta.page - 1) * meta.limit + 1
  const end = Math.min(meta.page * meta.limit, meta.total)
  return { start, end }
}

/**
 * URL-driven pagination for list pages.
 * Reads/writes the current search params and preserves other filters.
 */
export function SmartPagination({
  meta,
  pageParam = 'page',
  className,
  hideSummary = false,
}: SmartPaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (meta.total === 0) return null

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit))
  const currentPage = meta.page
  const { start, end } = getResultsRange(meta)
  const pages = getPageNumbers(currentPage, totalPages)
  const params = new URLSearchParams(searchParams.toString())
  const hasPreviousPage = meta.hasPreviousPage ?? currentPage > 1
  const hasNextPage = meta.hasNextPage ?? currentPage < totalPages

  return (
    <div
      className={cn(
        'flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      {hideSummary ? null : (
        <p className="text-xs tabular-nums text-muted-foreground">
          Showing {start}–{end} of {meta.total}
        </p>
      )}

      {totalPages > 1 ? (
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent className="gap-0.5">
            <PaginationItem>
              <PaginationPrevious
                href={buildPageHref(pathname, params, currentPage - 1, pageParam)}
                aria-disabled={!hasPreviousPage}
                className={!hasPreviousPage ? 'pointer-events-none opacity-40' : undefined}
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
                    href={buildPageHref(pathname, params, page, pageParam)}
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
                href={buildPageHref(pathname, params, currentPage + 1, pageParam)}
                aria-disabled={!hasNextPage}
                className={!hasNextPage ? 'pointer-events-none opacity-40' : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  )
}
