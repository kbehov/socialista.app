'use client'

import { DashboardSegment, dashboardSegmentLinkClass } from '@/components/dashboard'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SETTINGS_NAV = [
  {
    href: DASHBOARD_ROUTES.SETTINGS,
    label: 'General',
    isActive: (pathname: string) => pathname === DASHBOARD_ROUTES.SETTINGS,
  },
  {
    href: DASHBOARD_ROUTES.SETTINGS_MEMBERS,
    label: 'Members',
    isActive: (pathname: string) => pathname.startsWith(DASHBOARD_ROUTES.SETTINGS_MEMBERS),
  },
  {
    href: DASHBOARD_ROUTES.SETTINGS_BILLING,
    label: 'Plan',
    isActive: (pathname: string) => pathname.startsWith(DASHBOARD_ROUTES.SETTINGS_BILLING),
  },
] as const

export function SettingsNav() {
  const pathname = usePathname()

  return (
    <DashboardSegment label="Settings sections">
      {SETTINGS_NAV.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={dashboardSegmentLinkClass(item.isActive(pathname))}
          aria-current={item.isActive(pathname) ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
    </DashboardSegment>
  )
}
