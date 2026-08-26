'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { StaticAdTemplateDto } from '@socialista/types'
import { XIcon } from 'lucide-react'

type StaticAdTemplatePreviewDialogProps = {
  template: StaticAdTemplateDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRecreate: (template: StaticAdTemplateDto) => void
}

export function StaticAdTemplatePreviewDialog({
  template,
  open,
  onOpenChange,
  onRecreate,
}: StaticAdTemplatePreviewDialogProps) {
  const label = template?.name ?? 'Ad template'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex w-[min(96vw,34rem)] max-w-none flex-col gap-0 overflow-hidden border-black/10 bg-background p-0 sm:rounded-xl dark:border-white/12"
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b border-black/10 px-4 py-3 dark:border-white/12">
          <div className="min-w-0 text-left">
            <DialogTitle className="truncate text-[14px] font-medium tracking-[-0.02em] text-foreground">
              {label}
            </DialogTitle>
            <DialogDescription className="sr-only">Full template preview</DialogDescription>
          </div>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="size-8 shrink-0 text-black/56 hover:bg-black/[0.05] hover:text-foreground dark:text-white/56 dark:hover:bg-white/[0.08]"
            onClick={() => onOpenChange(false)}
            aria-label="Close preview"
          >
            <XIcon className="size-4" strokeWidth={2} />
          </Button>
        </DialogHeader>

        <div className="flex max-h-[min(72vh,780px)] items-center justify-center bg-black/[0.03] px-3 py-4 sm:px-5 dark:bg-white/[0.04]">
          {template ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={template.imageUrl}
              alt={label}
              className="max-h-[min(72vh,780px)] w-auto max-w-full object-contain"
            />
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-black/10 px-4 py-3 dark:border-white/12">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg text-[13px] font-medium text-black/64 hover:bg-black/[0.05] hover:text-foreground dark:text-white/64 dark:hover:bg-white/[0.08]"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            size="sm"
            className={cn(
              'h-8 rounded-lg bg-foreground text-[13px] font-medium text-background hover:bg-foreground/90',
              'active:scale-[0.97] motion-reduce:active:scale-100',
            )}
            disabled={!template}
            onClick={() => {
              if (!template) return
              onRecreate(template)
              onOpenChange(false)
            }}
          >
            Recreate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
