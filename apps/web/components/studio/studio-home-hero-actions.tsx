'use client'

import { dashboardSurface } from '@/components/dashboard/surface'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

const actionButtonClass = cn(
  dashboardSurface.createCta,
  'gap-1.5 tracking-[-0.015em]',
  'border-0 bg-black text-white hover:bg-black/90 hover:text-white',
  'dark:bg-white dark:text-black dark:hover:bg-white/90',
)

export function StudioHomeCreateButton({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <Button asChild size="sm" className={actionButtonClass}>
      <Link href={href}>
        <PlusIcon className="size-3.5" strokeWidth={1.75} />
        {label}
      </Link>
    </Button>
  )
}

export function StudioHomeHeaderActions({ children }: { children: ReactNode }) {
  return <>{children}</>
}
