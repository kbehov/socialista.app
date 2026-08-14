import Link from 'next/link'

import { cn } from '@/lib/utils'

type LogoProps = {
  className?: string
  href?: string
}

function Logo({ className, href = '/' }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Socialista"
      className={cn(
        'group inline-flex items-center gap-2.5 text-foreground outline-none select-none',
        'focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[9px]',
          'bg-foreground text-background',
          'shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--background)_22%,transparent)]',
          'transition-transform duration-150 ease-out',
          'group-hover:scale-[1.04] group-active:scale-[0.97]',
          'motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-active:scale-100',
        )}
      >
        <svg viewBox="0 0 32 32" className="size-[22px]" fill="currentColor">
          <path d="M16 2.5L18.05 11.06L21.94 10.06L20.94 13.95L29.5 16L20.94 18.05L21.94 21.94L18.05 20.94L16 29.5L13.95 20.94L10.06 21.94L11.06 18.05L2.5 16L11.06 13.95L10.06 10.06L13.95 11.06Z" />
        </svg>
      </span>
      <span className="text-[17px] font-bold leading-none tracking-[-0.032em]">Socialista</span>
    </Link>
  )
}

export default Logo
