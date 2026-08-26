'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { StaticAdTemplateDto } from '@socialista/types'
import { SparklesIcon, XIcon } from 'lucide-react'

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
        className="flex w-[min(96vw,34rem)] max-w-none flex-col gap-0 overflow-hidden border-border/60 bg-neutral-950 p-0 text-white sm:rounded-2xl"
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <DialogTitle className="truncate text-[13px] font-medium tracking-tight text-white">
              {label}
            </DialogTitle>
            <DialogDescription className="sr-only">Full template preview</DialogDescription>
          </div>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="size-8 text-white hover:bg-white/10 hover:text-white"
            onClick={() => onOpenChange(false)}
            aria-label="Close preview"
          >
            <XIcon className="size-4" />
          </Button>
        </DialogHeader>

        <div className="flex max-h-[min(78vh,860px)] items-center justify-center bg-black px-3 py-3 sm:px-4 sm:py-4">
          {template ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={template.imageUrl}
              alt={label}
              className="max-h-[min(78vh,860px)] w-auto max-w-full object-contain"
            />
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
          <div className="flex min-w-0 flex-wrap gap-1">
            {template?.categories.map(category => (
              <Badge
                key={category}
                variant="secondary"
                className="h-5 max-w-full truncate bg-white/15 text-[10px] font-medium text-white ring-1 ring-white/15"
              >
                {category}
              </Badge>
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            className="h-8 shrink-0 rounded-full bg-white text-foreground hover:bg-white/90 active:scale-[0.97] motion-reduce:active:scale-100"
            disabled={!template}
            onClick={() => {
              if (!template) return
              onRecreate(template)
              onOpenChange(false)
            }}
          >
            <SparklesIcon className="size-3.5" />
            Recreate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
