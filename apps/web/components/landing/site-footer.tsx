import Logo from '@/components/common/logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

import { FOOTER, SIGNUP_HREF, type FooterColumn } from './content'
import {
  landingBodySm,
  landingCtaPrimaryCompact,
  landingFooter,
  landingFooterColumnTitle,
  landingFooterLink,
} from './landing-classes'

function FooterLinkColumn({ column }: { column: FooterColumn }) {
  const { title, links } = column

  return (
    <nav aria-label={title}>
      <p className={landingFooterColumnTitle}>{title}</p>
      <ul className="mt-4 flex flex-col gap-y-2.5">
        {links.map(link => (
          <li key={link.label}>
            <Link href={link.href} className={landingFooterLink}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      className={cn(
        'landing-section-divider relative overflow-hidden border-t border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)] bg-[var(--landing-canvas)]',
      )}
    >
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-0 flex justify-center',
          '[mask-image:linear-gradient(to_top,black_35%,transparent_92%)]',
        )}
      >
        <p
          className={cn(
            'w-full max-w-[100vw] translate-y-[22%] text-center whitespace-nowrap',
            'font-semibold leading-none tracking-[-0.055em]',
            'text-[clamp(3.75rem,16.5vw,10.5rem)]',
            'text-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)]',
          )}
        >
          Socialista
        </p>
      </div>

      <div className={cn(landingFooter, 'relative z-10 py-16 sm:py-20 lg:py-[5.5rem]')}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,17.5rem)_1fr] lg:gap-16 xl:gap-20">
          <div className="flex max-w-sm flex-col gap-5">
            <Logo variant="landing" />
            <p className={cn(landingBodySm, 'max-w-[19rem] text-pretty text-[var(--landing-muted)]')}>
              {FOOTER.tagline}
            </p>
            <Button asChild size="lg" className={cn(landingCtaPrimaryCompact, 'mt-1 w-fit')}>
              <Link href={SIGNUP_HREF}>Start free</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4 xl:grid-cols-5 xl:gap-x-10">
            {FOOTER.columns.map(column => (
              <FooterLinkColumn key={column.title} column={column} />
            ))}
          </div>
        </div>

        <div
          className={cn(
            'mt-14 flex flex-col gap-4 border-t border-[color-mix(in_srgb,var(--landing-ink)_6%,transparent)] pt-8',
            'text-[0.8125rem] leading-relaxed text-[var(--landing-muted)] sm:flex-row sm:items-center sm:justify-between',
          )}
        >
          <p className="tracking-[-0.01em]">© {year} Socialista. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href={`mailto:${FOOTER.contactEmail}`} className={cn(landingFooterLink, 'text-[var(--landing-muted)]')}>
              {FOOTER.contactEmail}
            </a>
            <Link href="/privacy" className={landingFooterLink}>
              Privacy
            </Link>
            <Link href="/terms" className={landingFooterLink}>
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
