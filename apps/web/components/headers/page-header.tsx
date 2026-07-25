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
import { Separator } from '../ui/separator'

export type PageHeaderBreadcrumb = {
  label: string
  href?: string
}

type PageHeaderProps = {
  title: string
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
        'shrink-0 transition-[margin,padding,gap] duration-200 ease-out',
        compact ? 'mb-2 space-y-2' : 'mb-3 space-y-5',
        className,
      )}
    >
      {hasBreadcrumbs ? (
        <Breadcrumb
          className={cn(
            'transition-opacity duration-200',
            compact && 'pointer-events-none h-0 overflow-hidden opacity-0',
          )}
        >
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

      <div
        className={cn(
          'flex flex-col transition-[gap] duration-200 ease-out sm:flex-row sm:items-center sm:justify-between',
          compact ? 'gap-2' : 'gap-4',
        )}
      >
        <div className="flex min-w-0 items-start gap-3">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="Go back"
              className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background text-muted-foreground shadow-xs transition-all hover:-translate-y-px hover:border-border hover:bg-muted/60 hover:text-foreground hover:shadow-sm active:translate-y-0 active:scale-95',
                compact ? 'mt-0 size-8' : 'mt-0.5 size-9',
              )}
            >
              <ChevronLeftIcon className="size-4" strokeWidth={1.75} />
              <span className="sr-only">Back</span>
            </Link>
          ) : null}

          <div className="min-w-0">
            <h1
              className={cn(
                'truncate font-semibold tracking-[-0.025em] text-foreground transition-[font-size,line-height] duration-200 ease-out',
                compact ? 'text-lg leading-snug sm:text-xl' : 'text-2xl leading-tight sm:text-[1.75rem]',
              )}
            >
              {title}
            </h1>
            {description ? (
              <p
                className={cn(
                  'max-w-2xl text-sm leading-5 text-muted-foreground transition-all duration-200 ease-out',
                  compact
                    ? 'pointer-events-none mt-0 max-h-0 overflow-hidden opacity-0'
                    : 'mt-1 opacity-100',
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div
            className={cn(
              'flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end',
              compact && '[&_button]:h-8 [&_button]:px-3 [&_button]:text-xs',
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>
      <Separator className={cn('bg-border/70 transition-opacity duration-200', compact && 'opacity-60')} />
    </div>
  )
}
