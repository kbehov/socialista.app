import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

const LOGO_SRC = '/socialista-logo.webp'

const MARK_SIZES = {
  sm: { box: 'size-6 rounded-[0.45rem]', img: 'size-3.5', sizes: '14px' },
  md: { box: 'size-7 rounded-lg', img: 'size-4', sizes: '16px' },
  lg: { box: 'size-8 rounded-[0.55rem]', img: 'size-[1.125rem]', sizes: '18px' },
  xl: { box: 'size-10 rounded-[0.65rem]', img: 'size-5', sizes: '20px' },
  hero: { box: 'size-[2.125rem] rounded-[0.6rem]', img: 'size-[1.2rem]', sizes: '20px' },
} as const

type LogoMarkSize = keyof typeof MARK_SIZES

const GLYPH_SIZES = {
  sm: { box: 'size-4', sizes: '16px' },
  md: { box: 'size-5', sizes: '20px' },
  lg: { box: 'size-6', sizes: '24px' },
  xl: { box: 'size-7', sizes: '28px' },
  hero: { box: 'size-8', sizes: '32px' },
} as const

type LogoGlyphSize = keyof typeof GLYPH_SIZES

type LogoGlyphProps = {
  className?: string
  size?: LogoGlyphSize
  priority?: boolean
}

/** Inverted logo for charcoal / photo backgrounds (no tile) */
export function LogoGlyph({ className, size = 'md', priority = false }: LogoGlyphProps) {
  const dimensions = GLYPH_SIZES[size]

  return (
    <span className={cn('relative block shrink-0', dimensions.box, className)}>
      <Image
        src={LOGO_SRC}
        alt=""
        fill
        sizes={dimensions.sizes}
        priority={priority}
        className="object-contain invert"
      />
    </span>
  )
}

type LogoMarkProps = {
  className?: string
  size?: LogoMarkSize
  priority?: boolean
}

/** Logo glyph on brand charcoal — use on landing and marketing surfaces */
export function LogoMark({ className, size = 'md', priority = false }: LogoMarkProps) {
  const dimensions = MARK_SIZES[size]

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center bg-[var(--landing-charcoal)]',
        'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-1 ring-inset ring-white/[0.08]',
        dimensions.box,
        className,
      )}
    >
      <span className={cn('relative block', dimensions.img)}>
        <Image
          src={LOGO_SRC}
          alt=""
          fill
          sizes={dimensions.sizes}
          priority={priority}
          className="object-contain invert"
        />
      </span>
    </span>
  )
}

type LogoWordmarkProps = {
  className?: string
  compact?: boolean
  size?: 'sm' | 'md' | 'lg'
  tone?: 'onLight' | 'onDark'
}

export function LogoWordmark({
  className,
  compact = false,
  size = 'md',
  tone = 'onLight',
}: LogoWordmarkProps) {
  return (
    <span
      className={cn(
        'truncate font-semibold leading-none',
        tone === 'onDark' ? 'text-white' : 'text-[var(--landing-ink)]',
        compact
          ? 'text-sm tracking-[-0.02em]'
          : size === 'lg'
            ? 'text-[1.1875rem] tracking-[-0.038em] sm:text-[1.25rem]'
            : size === 'sm'
              ? 'text-[0.9375rem] tracking-[-0.03em]'
              : 'text-[1.0625rem] tracking-[-0.034em] sm:text-[1.125rem]',
        className,
      )}
    >
      Socialista
    </span>
  )
}

type SocialistaBrandLockupProps = {
  className?: string
  markSize?: LogoMarkSize
  wordmarkSize?: 'sm' | 'md' | 'lg'
  tone?: 'onLight' | 'onDark'
  orientation?: 'horizontal' | 'vertical'
  priority?: boolean
}

export function SocialistaBrandLockup({
  className,
  markSize = 'md',
  wordmarkSize = 'md',
  tone = 'onLight',
  orientation = 'horizontal',
  priority = false,
}: SocialistaBrandLockupProps) {
  return (
    <span
      className={cn(
        'inline-flex min-w-0 items-center',
        orientation === 'vertical' ? 'flex-col gap-1.5 text-center' : 'gap-2.5',
        className,
      )}
    >
      <LogoMark size={markSize} priority={priority} />
      <LogoWordmark size={wordmarkSize} tone={tone} />
    </span>
  )
}

type SocialistaMarkProps = {
  className?: string
  compact?: boolean
}

/** Mark + wordmark for dark overlays (e.g. hero slides) */
export function SocialistaMark({ className, compact = false }: SocialistaMarkProps) {
  return (
    <SocialistaBrandLockup
      className={className}
      markSize={compact ? 'sm' : 'md'}
      wordmarkSize={compact ? 'sm' : 'md'}
      tone="onDark"
      orientation="horizontal"
    />
  )
}

type LogoProps = {
  className?: string
  href?: string
  compact?: boolean
  /** Slightly larger mark and wordmark for the landing header */
  variant?: 'default' | 'landing'
  size?: 'default' | 'lg'
}

function Logo({
  className,
  href = '/',
  compact = false,
  variant = 'default',
  size = 'default',
}: LogoProps) {
  const isLanding = variant === 'landing'
  const large = size === 'lg' || isLanding

  return (
    <Link
      href={href}
      aria-label="Socialista home"
      className={cn(
        'group inline-flex min-w-0 items-center select-none',
        'rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        compact ? 'gap-2' : large ? 'gap-2.5 sm:gap-3' : 'gap-2.5',
        className,
      )}
    >
      <LogoMark
        size={compact ? 'sm' : isLanding ? 'hero' : large ? 'lg' : 'md'}
        priority={isLanding}
        className="transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.03] group-active:scale-[0.97]"
      />
      <LogoWordmark
        compact={compact}
        size={compact ? 'sm' : large ? 'lg' : 'md'}
        tone="onLight"
        className="transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover:text-[color-mix(in_oklch,var(--landing-ink)_88%,var(--landing-orange))]"
      />
    </Link>
  )
}

export default Logo
