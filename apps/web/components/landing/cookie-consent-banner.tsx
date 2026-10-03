'use client'

import {
  landingCtaGoogleCompact,
  landingCtaPrimaryCompact,
  landingFooterLink,
  landingGlassLight,
} from '@/components/landing/landing-classes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { setCookieConsentAcceptedClient, setCookieConsentEssentialOnlyClient } from '@/utils/cookie.utils'
import Link from 'next/link'
import { useState } from 'react'

type CookieConsentBannerProps = {
  initialHidden: boolean
}

export function CookieConsentBanner({ initialHidden }: CookieConsentBannerProps) {
  const [hidden, setHidden] = useState(initialHidden)

  function accept() {
    setCookieConsentAcceptedClient()
    setHidden(true)
  }

  function cancel() {
    setCookieConsentEssentialOnlyClient()
    setHidden(true)
  }

  if (hidden) return null

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-6"
    >
      <div
        className={cn(
          'landing-cookie-banner mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-5',
          landingGlassLight,
        )}
      >
        <div className="min-w-0 space-y-1">
          <p id="cookie-consent-title" className="text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--landing-ink)] sm:text-sm">
            Cookies
          </p>
          <p
            id="cookie-consent-description"
            className="text-pretty text-[0.8125rem] leading-[1.5] text-[var(--landing-muted)] sm:text-[0.875rem] sm:leading-[1.55]"
          >
            We use essential cookies to keep you signed in and optional ones to understand how the site is used.{' '}
            <Link href="/privacy#cookies" className={cn(landingFooterLink, 'text-[inherit] underline-offset-2')}>
              Privacy
            </Link>
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(landingCtaGoogleCompact, 'w-full sm:w-auto')}
            onClick={cancel}
          >
            Cancel
          </Button>
          <Button type="button" size="sm" className={cn(landingCtaPrimaryCompact, 'w-full sm:w-auto')} onClick={accept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
