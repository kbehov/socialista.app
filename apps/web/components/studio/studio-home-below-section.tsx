import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type StudioHomeBelowSectionProps = {
  ariaLabel?: string
  children: ReactNode
  className?: string
  bordered?: boolean
}

export function StudioHomeBelowSection({
  ariaLabel,
  children,
  className,
  bordered = true,
}: StudioHomeBelowSectionProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={cn(
        'relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8',
        bordered && 'border-t border-border/40 pt-9 sm:pt-10',
        className,
      )}
    >
      {children}
    </section>
  )
}
