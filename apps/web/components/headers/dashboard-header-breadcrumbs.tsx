'use client'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { getDashboardBreadcrumbs } from '@/lib/dashboard/dashboard-breadcrumbs'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

type DashboardHeaderBreadcrumbsProps = {
  className?: string
}

export function DashboardHeaderBreadcrumbs({ className }: DashboardHeaderBreadcrumbsProps) {
  const pathname = usePathname() ?? ''
  const items = getDashboardBreadcrumbs(pathname)

  if (items.length === 0) return null

  return (
    <Breadcrumb className={cn('min-w-0', className)}>
      <BreadcrumbList className="flex-nowrap gap-1 text-xs font-medium text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <Fragment key={`${item.label}-${index}`}>
              <BreadcrumbItem className="min-w-0">
                {isLast || !item.href ? (
                  <BreadcrumbPage className="max-w-[10rem] truncate font-medium text-foreground/80 lg:max-w-[14rem]">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="max-w-[10rem] truncate hover:text-foreground">
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator className="[&>svg]:size-3" /> : null}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
