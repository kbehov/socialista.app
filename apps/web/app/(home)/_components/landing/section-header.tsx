import { cn } from '@/lib/utils'
import styles from '@/app/(home)/_components/landing/landing.module.css'

type SectionHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  size?: 'default' | 'lg'
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  size = 'default',
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn(align === 'center' && 'mx-auto max-w-2xl text-center', className)}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <h2
        className={cn(
          'font-semibold tracking-tight text-balance',
          eyebrow ? 'mt-3' : '',
          size === 'lg'
            ? 'text-[2rem] leading-[1.12] sm:text-5xl'
            : 'text-[1.75rem] leading-[1.15] sm:text-4xl',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'mt-4 text-[0.9375rem] leading-7 text-pretty text-muted-foreground sm:text-base',
            align === 'center' ? 'mx-auto max-w-xl' : 'max-w-xl',
          )}
        >
          {description}
        </p>
      ) : null}
    </header>
  )
}
