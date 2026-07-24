import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
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
}

export function PageHeader({ title, description, breadcrumbs, backHref, actions, className }: PageHeaderProps) {
  const breadcrumbItems = breadcrumbs ?? []
  const hasBreadcrumbs = breadcrumbItems.length > 0

  return (
    <div className={cn('space-y-5 mb-3', className)}>
      {hasBreadcrumbs ? (
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="Go back"
              className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background text-muted-foreground shadow-xs transition-all hover:-translate-y-px hover:border-border hover:bg-muted/60 hover:text-foreground hover:shadow-sm active:translate-y-0 active:scale-95"
            >
              <ChevronLeftIcon className="size-4" strokeWidth={1.75} />
              <span className="sr-only">Back</span>
            </Link>
          ) : null}

          <div className="min-w-0 space-y-1">
            <h1 className="truncate text-2xl leading-tight font-semibold tracking-[-0.025em] text-foreground sm:text-[1.75rem]">
              {title}
            </h1>
            {description ? <p className="max-w-2xl text-sm leading-5 text-muted-foreground">{description}</p> : null}
          </div>
        </div>

        {actions ? (
          <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">{actions}</div>
        ) : null}
      </div>
      <Separator className="bg-border/70" />
    </div>
  )
}
