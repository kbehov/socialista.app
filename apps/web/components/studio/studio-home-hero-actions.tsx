'use client'

import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

const actionButtonClass = cn(
  'h-9 gap-1.5 rounded-xl px-3.5 text-[13px] font-medium tracking-[-0.015em]',
  'shadow-none active:scale-[0.98] motion-reduce:active:scale-100',
  'max-sm:px-2.5 max-sm:text-[12px]',
)

export function StudioHomeCreateButton({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <Button
      asChild
      className={cn(
        actionButtonClass,
        'border-0 bg-black px-4 text-white hover:bg-black/90 hover:text-white',
        'dark:bg-white dark:text-black dark:hover:bg-white/90',
      )}
    >
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
