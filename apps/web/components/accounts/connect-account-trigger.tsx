'use client'

import { ConnectAccountDialog } from '@/components/accounts/connect-account-dialog'
import { dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link2Icon, PlusIcon } from 'lucide-react'
import { useState } from 'react'

type ConnectAccountTriggerProps = {
  label?: string
  variant?: 'default' | 'outline'
  showPlusIcon?: boolean
  className?: string
}

export function ConnectAccountTrigger({
  label = 'Connect',
  variant = 'default',
  showPlusIcon = true,
  className,
}: ConnectAccountTriggerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={variant}
        className={cn(dashboardSurface.createCta, className)}
        onClick={() => setOpen(true)}
      >
        {showPlusIcon ? <PlusIcon className="size-3.5" /> : <Link2Icon className="size-3.5" />}
        {label}
      </Button>

      <ConnectAccountDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
