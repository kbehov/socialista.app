import { LandingShell } from '@/components/landing/landing-shell'
import { SiteFooter } from '@/components/landing/site-footer'
import { SiteHeader } from '@/components/landing/site-header'

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <LandingShell>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </LandingShell>
  )
}
