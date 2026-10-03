import { CookieConsentBanner } from "@/components/landing/cookie-consent-banner";
import { LandingShell } from "@/components/landing/landing-shell";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { isCookieConsentBannerHidden } from "@/utils/cookie.utils.server";
import Link from "next/link";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieConsentHidden = await isCookieConsentBannerHidden();

  return (
    <LandingShell>
      <Link
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-[var(--shadow-md)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Skip to content
      </Link>
      <SiteHeader />
      <main id="main-content" className="flex min-w-0 flex-col">
        {children}
      </main>
      <SiteFooter />
      <CookieConsentBanner initialHidden={cookieConsentHidden} />
    </LandingShell>
  );
}
