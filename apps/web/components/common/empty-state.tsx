import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'

import { dashboardSurface } from '@/components/dashboard/surface'

const minHeightClasses = {
  none: '',
  sm: 'min-h-40',
  md: 'min-h-48',
  lg: 'min-h-[320px]',
} as const

const variantClasses = {
  default: dashboardSurface.insetDashed,
  dashed: 'rounded-lg border border-dashed border-border/60',
  ghost: 'rounded-lg',
  hero: 'bg-transparent',
} as const

const riseClass = 'animate-empty-rise motion-reduce:animate-none'

export type EmptyStateProps = {
  icon?: LucideIcon
  /** Replaces the icon mark. Use for a custom cluster, such as platform badges. */
  visual?: ReactNode
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
  visual,
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
  const featured = variant === 'hero'
  const hasMark = Boolean(visual || Icon)

  return (
    <Container
      type={interactive ? 'button' : undefined}
      onClick={interactive ? onClick : undefined}
      className={cn(
        'flex w-full flex-col items-center justify-center px-6 py-10 text-center',
        featured && 'py-14 sm:py-16',
        minHeightClasses[minHeight],
        variantClasses[variant],
        interactive &&
          'cursor-pointer outline-none transition-[background-color,transform] duration-(--duration-normal) ease-out focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[var(--press-scale)] motion-reduce:active:scale-100 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted/40',
        className,
      )}
    >
      <div className={cn('flex w-full max-w-md flex-col items-center', featured ? 'gap-5' : 'gap-4', contentClassName)}>
        {visual ? (
          <div className={riseClass}>{visual}</div>
        ) : Icon ? (
          <div className={riseClass}>
            <EmptyMark icon={Icon} featured={featured} interactive={interactive} iconClassName={iconClassName} />
          </div>
        ) : null}

        <div className={cn('flex flex-col items-center gap-1.5', riseClass)} style={riseDelay(hasMark ? 70 : 0)}>
          <p
            className={cn(
              'max-w-sm text-balance font-medium tracking-tight text-foreground',
              featured ? 'text-[17px] leading-snug' : 'text-[15px]',
            )}
          >
            {title}
          </p>
          {description ? (
            <p className="max-w-[22rem] text-pretty text-[13px] leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>

        {action || footer ? (
          <div className={cn('flex flex-col items-center gap-3', riseClass)} style={riseDelay(hasMark ? 140 : 70)}>
            {action ? <div className="flex flex-wrap items-center justify-center gap-2">{action}</div> : null}
            {footer}
          </div>
        ) : null}
      </div>
    </Container>
  )
}

function riseDelay(ms: number): CSSProperties | undefined {
  if (ms === 0) return undefined
  return { animationDelay: `${ms}ms` }
}

function EmptyMark({
  icon: Icon,
  featured,
  interactive,
  iconClassName,
}: {
  icon: LucideIcon
  featured: boolean
  interactive: boolean
  iconClassName?: string
}) {
  const plate = (
    <div
      className={cn(
        'relative z-10 flex items-center justify-center rounded-[var(--radius-lg)] bg-background text-foreground/80 shadow-[var(--shadow-border)] dark:bg-card',
        featured ? 'size-12' : 'size-11',
        interactive && 'border border-dashed border-muted-foreground/40 bg-transparent text-muted-foreground shadow-none',
        iconClassName,
      )}
    >
      <Icon className={cn(featured ? 'size-5' : 'size-[18px]', interactive && 'size-5')} strokeWidth={1.75} aria-hidden />
    </div>
  )

  if (!featured) {
    return <div aria-hidden>{plate}</div>
  }

  return (
    <div className="relative h-16 w-[5.75rem]" aria-hidden>
      <span className="pointer-events-none absolute top-1/2 left-1/2 z-0 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.05] blur-2xl" />
      <span className="absolute top-3 left-0 size-10 -rotate-[10deg] rounded-[var(--radius-lg)] bg-foreground/[0.06] shadow-[var(--shadow-border)]" />
      <span className="absolute top-2.5 right-0 z-[1] size-10 rotate-[8deg] rounded-[var(--radius-lg)] bg-foreground/[0.1] shadow-[var(--shadow-border)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2">{plate}</div>
    </div>
  )
}
