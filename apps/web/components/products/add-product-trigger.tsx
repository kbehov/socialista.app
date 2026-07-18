'use client'

import { AddProductDialog } from '@/components/products/add-product-dialog'
import { Button } from '@/components/ui/button'
import { Link2Icon, PlusIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type AddProductTriggerProps = {
  workspaceId: string
  label?: string
  variant?: 'default' | 'outline'
  showPlusIcon?: boolean
}

export function AddProductTrigger({
  workspaceId,
  label = 'Add product',
  variant = 'default',
  showPlusIcon = true,
}: AddProductTriggerProps) {
  const router = useRouter()
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

      <AddProductDialog
        open={open}
        onOpenChange={setOpen}
        workspaceId={workspaceId}
        onCreated={() => router.refresh()}
      />
    </>
  )
}
