'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Loader2Icon, Trash2Icon } from 'lucide-react'
import type { ReactNode } from 'react'

type DeleteConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel?: string
  isDeleting?: boolean
  onConfirm: () => void
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  isDeleting = false,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (isDeleting) return
        onOpenChange(next)
      }}
    >
      <DialogContent showCloseButton={!isDeleting} className="gap-5 sm:max-w-sm">
        <DialogHeader className="gap-3 sm:text-left">
          <div
            className={cn(
              'flex size-10 items-center justify-center rounded-2xl',
              'border border-destructive/15 bg-destructive/8 text-destructive',
            )}
            aria-hidden
          >
            <Trash2Icon className="size-4" strokeWidth={1.75} />
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="text-[16px] font-semibold tracking-[-0.02em]">{title}</DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed text-muted-foreground">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl border-border/60"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="gap-1.5 rounded-xl shadow-xs active:scale-[0.98]"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2Icon className="size-3.5 animate-spin" />
                Deleting…
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
