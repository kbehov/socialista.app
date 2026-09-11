import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

import { landingSection, landingSectionAlt } from './landing-classes'

type SectionProps = {
  children: ReactNode
  className?: string
  id?: string
  border?: boolean
  alt?: boolean
}

export function Section({ children, className, id, border = false, alt = false }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-20 py-16 sm:py-24',
        border && 'border-t border-border',
        alt && landingSectionAlt,
        className,
      )}
    >
      <div className={landingSection}>{children}</div>
    </section>
  )
}

export function SectionInner({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(landingSection, className)}>{children}</div>
}
