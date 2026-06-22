import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

const minHeightClasses = {
  none: '',
  sm: 'min-h-40',
  md: 'min-h-48',
  lg: 'min-h-[320px]',
} as const

const variantClasses = {
  default: 'rounded-xl border border-dashed border-border/70 bg-muted/20',
  dashed: 'rounded-lg border-2 border-dashed border-border',
  ghost: 'rounded-lg',
} as const

export type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  footer?: ReactNode
  className?: string
  contentClassName?: string
  iconClassName?: string
  minHeight?: keyof typeof minHeightClasses
  variant?: keyof typeof variantClasses
  interactive?: boolean
  onClick?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  footer,
  className,
  contentClassName,
  iconClassName,
  minHeight = 'md',
  variant = 'default',
  interactive = false,
  onClick,
}: EmptyStateProps) {
  const Container = interactive ? 'button' : 'div'

  return (
    <Container
      type={interactive ? 'button' : undefined}
      onClick={interactive ? onClick : undefined}
      className={cn(
        'flex w-full flex-col items-center justify-center px-6 py-10 text-center',
        minHeightClasses[minHeight],
        variantClasses[variant],
        interactive && 'cursor-pointer transition-colors hover:bg-muted/50',
        className,
      )}
    >
      <div className={cn('flex flex-col items-center', contentClassName)}>
        {Icon && (
          <div
            className={cn(
              'flex size-10 items-center justify-center rounded-full bg-muted',
              interactive && 'size-12 border-2 border-dashed border-muted-foreground/30 bg-transparent',
              iconClassName,
            )}
          >
            <Icon
              className={cn('size-4 text-muted-foreground', interactive && 'size-5')}
              strokeWidth={1.5}
            />
          </div>
        )}

        <p className={cn('text-sm font-medium text-foreground', Icon && 'mt-4')}>{title}</p>

        {description && (
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}

        {action && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{action}</div>}
        {footer}
      </div>
    </Container>
  )
}
