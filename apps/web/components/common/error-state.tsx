import { cn } from '@/lib/utils'
import { XIcon, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type ErrorStateProps = {
  title: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
  minHeight?: 'sm' | 'md' | 'lg'
}

const minHeightClasses = {
  sm: 'min-h-40',
  md: 'min-h-48',
  lg: 'min-h-[320px]',
} as const

export function ErrorState({
  title,
  description,
  icon: Icon = XIcon,
  action,
  className,
  minHeight = 'sm',
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2 px-6 py-10 text-center',
        minHeightClasses[minHeight],
        className,
      )}
    >
      <Icon className="size-8 text-destructive/60" strokeWidth={1.5} />
      <p className="text-sm font-medium text-destructive">{title}</p>
      {description && <p className="max-w-xs text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
