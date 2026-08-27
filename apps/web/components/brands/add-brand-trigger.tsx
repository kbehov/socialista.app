'use client'

import { BrandDialog } from '@/components/brands/brand-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type AddBrandTriggerProps = {
  workspaceId: string
  label?: string
  variant?: 'default' | 'outline'
  showPlusIcon?: boolean
}

export function AddBrandTrigger({
  workspaceId,
  label = 'Add brand',
  variant = 'default',
  showPlusIcon = true,
}: AddBrandTriggerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={variant}
        className={cn(
          'h-9 rounded-md px-4 font-medium',
          variant === 'default' &&
            'transition-colors duration-150 active:scale-[0.98] motion-reduce:active:scale-100',
        )}
        onClick={() => setOpen(true)}
      >
        {showPlusIcon ? <PlusIcon className="size-3.5" /> : null}
        {label}
      </Button>

      <BrandDialog
        open={open}
        onOpenChange={setOpen}
        workspaceId={workspaceId}
        onSaved={() => router.refresh()}
      />
    </>
  )
}
