'use client'

import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { FolderIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function FilesHeaderLink({ className, href = DASHBOARD_ROUTES.FILES }: { className?: string; href?: string }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Button variant="outline" size="icon-sm" className={className} asChild>
      <Link href={href} aria-label="Files" aria-current={isActive ? 'page' : undefined}>
        <FolderIcon strokeWidth={1.5} />
      </Link>
    </Button>
  )
}
