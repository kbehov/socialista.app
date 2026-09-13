import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

type LogoProps = {
  className?: string
  href?: string
  compact?: boolean
  size?: 'default' | 'lg'
}

type SocialistaMarkProps = {
  className?: string
  compact?: boolean
}

export function SocialistaMark({
  className,
  compact = false,
}: SocialistaMarkProps) {
  return (
    <span
      className={cn(
        'inline-flex min-w-0 items-center select-none',
        compact ? 'gap-1' : 'gap-2',
        className,
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-md bg-white',
          compact ? 'size-[1.35rem]' : 'size-6',
        )}
      >
        <div className={cn('relative', compact ? 'size-2.5' : 'size-4')}>
          <Image
            src="/socialista-logo.webp"
            alt=""
            fill
            sizes="16px"
            className="object-contain"
          />
        </div>
      </span>

      <span
        className={cn(
          'truncate font-semibold leading-none text-white',
          compact
            ? 'text-[2.8cqw] tracking-[-0.02em]'
            : 'text-[17px] font-bold tracking-[-0.032em]',
        )}
      >
        Socialista
      </span>
    </span>
  )
}

function Logo({
  className,
  href = '/',
  compact = false,
  size = 'default',
}: LogoProps) {
  const large = size === 'lg'

  return (
    <Link
      href={href}
      aria-label="Socialista"
      className={cn(
        'group inline-flex items-center select-none text-foreground',
        'rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        compact ? 'gap-1.5' : large ? 'gap-3' : 'gap-2.5',
        className,
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-md bg-foreground',
          'shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--background)_22%,transparent)]',
          'transition-transform duration-150 ease-out group-hover:scale-105 group-active:scale-95',
          large ? 'size-8 rounded-lg' : 'size-6',
        )}
      >
        <div className={cn('relative', large ? 'size-5' : 'size-4')}>
          <Image
            src="/socialista-logo.webp"
            alt=""
            fill
            sizes={large ? '20px' : '16px'}
            priority
            className="object-contain invert dark:invert-0"
          />
        </div>
      </span>

      <span
        className={cn(
          'flex items-center gap-px leading-none text-foreground/90 transition-colors group-hover:text-foreground',
          compact
            ? 'text-[14px] font-medium tracking-tight'
            : large
              ? 'text-[19px] font-bold tracking-[-0.035em]'
              : 'text-[17px] font-bold tracking-[-0.032em]',
        )}
      >
        <span>Socialista</span>
      </span>
    </Link>
  )
}

export default Logo
