'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { usePageScrollCompact } from '@/components/headers/page-scroll-compact'
import { cn } from '@/lib/utils'
import { ChevronLeftIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Fragment } from 'react'

export type PageHeaderBreadcrumb = {
  label: string
  href?: string
}

export function PageHeaderActions({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('flex w-full shrink-0 flex-wrap items-center gap-2.5 sm:w-auto sm:justify-end', className)}
    >
      {children}
    </div>
  )
}

type PageHeaderProps = {
  title: ReactNode
  description?: string
  breadcrumbs?: PageHeaderBreadcrumb[]
  backHref?: string
  actions?: ReactNode
  className?: string
  compact?: boolean
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  backHref,
  actions,
  className,
  compact: compactProp,
}: PageHeaderProps) {
  const compactFromScroll = usePageScrollCompact()
  const compact = compactProp ?? compactFromScroll
  const breadcrumbItems = breadcrumbs ?? []
  const hasBreadcrumbs = breadcrumbItems.length > 0

  return (
    <div
      className={cn(
        'sticky top-0 z-20 -mx-(--spacing-dashboard-x) mb-4 shrink-0 border-b border-sidebar-border bg-background px-(--spacing-dashboard-x) pt-6 pb-3',
        compact ? 'space-y-2' : 'space-y-3',
        className,
      )}
    >
      {hasBreadcrumbs && !compact ? (
        <Breadcrumb>
          <BreadcrumbList className="gap-1.5 text-[11px] font-medium text-muted-foreground sm:gap-2">
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1

              return (
                <Fragment key={`${item.label}-${index}`}>
                  <BreadcrumbItem className={index === 0 ? 'hidden md:inline-flex' : undefined}>
                    {isLast || !item.href ? (
                      <BreadcrumbPage className="max-w-48 truncate font-medium text-foreground/70 sm:max-w-72">
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild className="transition-colors hover:text-foreground">
                        <Link href={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator className={index === 0 ? 'hidden md:block' : undefined} />}
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="Go back"
              className="dashboard-header-icon inline-flex shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeftIcon className="size-4" strokeWidth={1.5} />
              <span className="sr-only">Back</span>
            </Link>
          ) : null}

          <div className="min-w-0">
            <h1 className="truncate text-[1.375rem] leading-tight font-[590] tracking-tight text-foreground">
              {title}
            </h1>
            {description && !compact ? (
              <p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>

        {actions ? <PageHeaderActions>{actions}</PageHeaderActions> : null}
      </div>
    </div>
  )
}
