import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type ContextHubSectionProps = {
  label: string
  toolbar?: ReactNode
  children: ReactNode
  className?: string
}

export function ContextHubSection({ label, toolbar, children, className }: ContextHubSectionProps) {
  return (
    <section className={cn('flex min-h-0 flex-1 flex-col', className)}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground/80 uppercase">{label}</p>
        {toolbar ? <div className="shrink-0">{toolbar}</div> : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-background shadow-xs">
        {children}
      </div>
    </section>
  )
}
