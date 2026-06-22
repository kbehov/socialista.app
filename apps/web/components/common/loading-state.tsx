import { cn } from '@/lib/utils'
import { Loader2Icon } from 'lucide-react'
import type { ReactNode } from 'react'

type LoadingStateProps = {
  message?: string
  children?: ReactNode
  className?: string
}

export function LoadingState({ message = 'Loading…', children, className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)} role="status" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2Icon className="size-3.5 animate-spin" />
        <span>{message}</span>
      </div>
      {children}
    </div>
  )
}
