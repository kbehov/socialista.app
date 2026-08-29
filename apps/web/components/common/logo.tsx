import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

type LogoProps = {
  className?: string
  href?: string
  compact?: boolean
}

function Logo({ className, href = '/', compact = false }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Socialista"
      className={cn(
        'group inline-flex items-center text-foreground outline-none select-none',
        compact ? 'gap-1.5' : 'gap-2.5',
        'focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'relative flex shrink-0 items-center justify-center overflow-hidden bg-accent-orange',
          compact ? 'size-5 rounded-[6px]' : 'size-8 rounded-[9px]',
          !compact && 'shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--background)_22%,transparent)]',
          'transition-transform duration-150 ease-out',
          'group-hover:scale-[1.04] group-active:scale-[0.97]',
          'motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-active:scale-100',
        )}
      >
        <Image
          src="/socialista-logo.webp"
          alt=""
          width={compact ? 20 : 32}
          height={compact ? 20 : 32}
          className="size-full object-contain p-px dark:invert"
        />
      </span>
      <span
        className={cn(
          'leading-none',
          compact ? 'text-[13px] font-medium tracking-tight' : 'text-[17px] font-bold tracking-[-0.032em]',
        )}
      >
        Socialista
      </span>
    </Link>
  )
}

export default Logo
