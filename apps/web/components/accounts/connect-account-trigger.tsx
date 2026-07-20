'use client'

import { ConnectAccountDialog } from '@/components/accounts/connect-account-dialog'
import { Button } from '@/components/ui/button'
import { Link2Icon, PlusIcon } from 'lucide-react'
import { useState } from 'react'

type ConnectAccountTriggerProps = {
  label?: string
  variant?: 'default' | 'outline'
  showPlusIcon?: boolean
}

export function ConnectAccountTrigger({
  label = 'Connect',
  variant = 'default',
  showPlusIcon = true,
}: ConnectAccountTriggerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={variant}
        className="h-9 rounded-full px-4"
        onClick={() => setOpen(true)}
      >
        {showPlusIcon ? <PlusIcon className="size-3.5" /> : <Link2Icon className="size-3.5" />}
        {label}
      </Button>

      <ConnectAccountDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
