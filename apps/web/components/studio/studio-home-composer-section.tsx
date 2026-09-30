import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export const STUDIO_HOME_COMPOSER_GRADIENT_CLASS =
  'pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-8%,color-mix(in_oklch,var(--foreground)_5%,transparent),transparent_72%)] dark:bg-[radial-gradient(ellipse_80%_55%_at_50%_-8%,color-mix(in_oklch,var(--foreground)_9%,transparent),transparent_72%)]'

export const STUDIO_HOME_COMPOSER_EDGE_CLASS =
  'pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border/60 to-transparent'

const CONTENT_MAX_WIDTH = {
  narrow: 'max-w-2xl',
  medium: 'max-w-3xl',
  wide: 'max-w-[48rem]',
} as const

export type StudioHomeComposerSectionProps = {
  id: string
  ariaLabel: string
  title?: string
  description?: string
  contentMaxWidth?: keyof typeof CONTENT_MAX_WIDTH
  toolbar?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
}

export function StudioHomeComposerSection({
  id,
  ariaLabel,
  title = 'What do you want to create?',
  description,
  contentMaxWidth = 'narrow',
  toolbar,
  footer,
  children,
  className,
}: StudioHomeComposerSectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn('relative px-4 pt-10 pb-10 sm:px-6 sm:pt-14 sm:pb-12 lg:px-8', className)}
    >
      <div aria-hidden className={STUDIO_HOME_COMPOSER_GRADIENT_CLASS} />
      <div aria-hidden className={STUDIO_HOME_COMPOSER_EDGE_CLASS} />

      {toolbar ? (
        <div className="relative z-10 mx-auto mb-6 flex w-full max-w-5xl justify-end sm:mb-7">{toolbar}</div>
      ) : null}

      <div
        className={cn(
          'relative z-10 mx-auto flex w-full flex-col items-center gap-6',
          CONTENT_MAX_WIDTH[contentMaxWidth],
        )}
      >
        <div className="space-y-1.5 text-center">
          <h1 className="text-[22px] font-medium tracking-[-0.03em] text-foreground sm:text-[1.5rem] sm:leading-tight">
            {title}
          </h1>
          {description ? (
            <p className="text-[13px] leading-snug tracking-[-0.01em] text-muted-foreground/80">{description}</p>
          ) : null}
        </div>

        <div className="w-full">{children}</div>

        {footer ? <div className="w-full">{footer}</div> : null}
      </div>
    </section>
  )
}
