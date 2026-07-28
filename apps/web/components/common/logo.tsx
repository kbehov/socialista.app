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
      className={cn(
        'group inline-flex items-center gap-2 text-foreground outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      <span className="flex size-6 items-center justify-center rounded-md bg-foreground text-sm leading-none text-background transition-transform duration-150 ease-out group-hover:scale-105">
        ✹
      </span>
      <span className="text-[15px] font-semibold tracking-tight">Socialista</span>
    </Link>
  )
}

export default Logo
