import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

import styles from './landing.module.css'

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
        alt && styles.sectionAlt,
        className,
      )}
    >
      <div className={styles.section}>{children}</div>
    </section>
  )
}

export function SectionInner({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(styles.section, className)}>{children}</div>
}
