'use client'

import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

import { SIGNUP_HREF } from './content'
import { landingCtaPrimary, landingCtaPrimaryInverted } from './landing-classes'

/** Signed-in visitors skip signup and land in the dashboard. */
export function useLandingCtaHref(href: string = SIGNUP_HREF) {
  const { data: session } = useSession()
  return session?.user ? DASHBOARD_ROUTES.ROOT : href
}

type SectionCtaProps = {
  label: string
  href?: string
  /** Muted line under the button, e.g. "Free to start · No credit card" */
  note?: string
  tone?: 'light' | 'dark'
  className?: string
}

export function SectionCta({ label, href, note, tone = 'light', className }: SectionCtaProps) {
  const resolvedHref = useLandingCtaHref(href)
  const isDark = tone === 'dark'

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <Button asChild size="lg" className={cn(landingCtaPrimary, 'group', isDark && landingCtaPrimaryInverted)}>
        <Link href={resolvedHref}>
          {label}
          <ArrowRight
            className="size-4 translate-y-px opacity-80 transition-transform duration-150 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </Button>
      {note ? (
        <p className={cn('text-xs text-[var(--landing-muted)]', isDark && 'text-white/45')}>{note}</p>
      ) : null}
    </div>
  )
}
