'use client'

import { dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { MANAGER_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'

export function InfluencerActions() {
  return (
    <Button asChild size="sm" className={cn(dashboardSurface.createCta, 'gap-1.5')}>
      <Link href={MANAGER_ROUTES.INFLUENCER_CREATE}>
        <PlusIcon className="size-3.5" />
        Create public
      </Link>
    </Button>
  )
}
