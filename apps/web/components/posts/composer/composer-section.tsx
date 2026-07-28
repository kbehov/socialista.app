import { dashboardSurface } from '@/components/dashboard'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type ComposerSectionProps = {
  title: string
  description?: string
  action?: ReactNode
  badge?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  variant?: 'default' | 'subtle' | 'dashed'
  compact?: boolean
  icon?: ReactNode
}

const variantStyles = {
  default: cn('rounded-xl border border-border/60', dashboardSurface.bg),
  subtle: cn('rounded-xl border border-border/60', dashboardSurface.bg),
  dashed: cn('rounded-xl border border-dashed border-border/60', dashboardSurface.bg),
} as const

export function ComposerSection({
  icon,
  title,
  description,
  action,
  badge,
  children,
  className,
  contentClassName,
  variant = 'default',
  compact = false,
}: ComposerSectionProps) {
  return (
    <section className={cn(variantStyles[variant], className)}>
      <div
        className={cn('flex items-start justify-between gap-3', compact ? 'px-3 pt-3 pb-2' : 'px-4 pt-4 pb-3 sm:px-5')}
      >
        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            {icon && (icon as ReactNode)}

            <h2 className="text-[13px] font-semibold tracking-tight text-foreground">{title}</h2>
            {badge}
          </div>
          {description ? <p className="text-[12px] leading-relaxed text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn(compact ? 'px-3 pb-3' : 'px-4 pb-4 sm:px-5 sm:pb-5', contentClassName)}>{children}</div>
    </section>
  )
}

type ComposerCollapsibleSectionProps = ComposerSectionProps & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ComposerCollapsibleSection({
  title,
  description,
  action,
  badge,
  children,
  className,
  contentClassName,
  variant = 'default',
  compact = false,
  defaultOpen = false,
  open,
  onOpenChange,
}: ComposerCollapsibleSectionProps) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      className={cn(variantStyles[variant], className)}
    >
      <CollapsibleTrigger
        className={cn(
          'group/trigger flex w-full items-start justify-between gap-3 rounded-xl text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          compact ? 'px-3 pt-3 pb-2' : 'px-4 pt-4 pb-3 sm:px-5',
        )}
      >
        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[13px] font-semibold tracking-tight text-foreground">{title}</h2>
            {badge}
          </div>
          {description ? <p className="text-[12px] leading-relaxed text-muted-foreground">{description}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action}
          <span className="flex size-6 items-center justify-center rounded-full border border-border/50 bg-background text-muted-foreground transition-colors group-hover/trigger:border-border">
            <ChevronDownIcon
              className="size-3 transition-transform duration-200 group-data-[state=open]/trigger:rotate-180"
              strokeWidth={2}
            />
          </span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className={cn(compact ? 'px-3 pb-3' : 'px-4 pb-4 sm:px-5 sm:pb-5', contentClassName)}>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
