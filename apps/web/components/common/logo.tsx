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
        'group inline-flex items-center select-none text-foreground',
        'rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        compact ? 'gap-1.5' : 'gap-2.5',
        className,
      )}
    >
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground',
          'shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--background)_22%,transparent)]',
          'transition-transform duration-150 ease-out group-hover:scale-105 group-active:scale-95',
        )}
      >
        <div className="relative size-4">
          <Image
            src="/socialista-logo.webp"
            alt=""
            fill
            sizes="16px"
            priority
            className="object-contain invert dark:invert-0"
          />
        </div>
      </span>

      <span
        className={cn(
          'flex items-center gap-px leading-none text-foreground/90 transition-colors group-hover:text-foreground',
          compact ? 'text-[14px] font-medium tracking-tight' : 'text-[17px] font-bold tracking-[-0.032em]',
        )}
      >
        <span>Socialista</span>
      </span>
    </Link>
  )
}

export default Logo
