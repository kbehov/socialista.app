'use client'

import { SparklesIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function VideoGeneratePanel({ embedded = false }: { embedded?: boolean }) {
  return (
    <div
      data-studio-scroll="source"
      className={cn(
        'sidebar-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto',
        embedded ? 'p-3' : 'p-3.5',
      )}
    >
      <div className="rounded-lg border bg-muted/20 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <SparklesIcon className="size-4" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium">Generate with AI</p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Describe a clip and we&apos;ll generate video ready for your timeline — hooks, b-roll, and
              short-form cuts for social.
            </p>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">Coming soon.</p>
      </div>
    </div>
  )
}
