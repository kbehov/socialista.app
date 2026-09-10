'use client'

import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES, isDashboardFilesPath } from '@/constants/app-routes'
import { FolderIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function FilesHeaderLink({ className }: { className?: string }) {
  const pathname = usePathname()
  const isActive = isDashboardFilesPath(pathname)

  return (
    <Button variant="ghost" size="icon-sm" className={className} asChild>
      <Link
        href={DASHBOARD_ROUTES.FILES}
        aria-label="Files"
        aria-current={isActive ? 'page' : undefined}
      >
        <FolderIcon strokeWidth={1.5} />
      </Link>
    </Button>
  )
}
