import Logo from "@/components/common/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { FOOTER } from "./content";
import { landingBodySm, landingLabel } from "./landing-classes";
import { SectionInner } from "./section";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-section-divider py-16 sm:py-20">
      <SectionInner>
        <div className="grid gap-10 sm:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))] sm:gap-8">
          <div>
            <Logo variant="landing" />
            <p className={cn(landingBodySm, "mt-4 max-w-[16rem] text-[var(--landing-muted)]")}>
              {FOOTER.tagline}
            </p>
          </div>

          {FOOTER.columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className={cn(landingLabel, "text-[var(--landing-ink)]")}>{column.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm tracking-[-0.01em] text-[var(--landing-muted)] transition-colors duration-150 ease-out hover:text-[var(--landing-ink)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-12 border-t border-[color-mix(in_srgb,var(--landing-stone)_75%,transparent)] pt-6 text-sm text-[var(--landing-muted)]">
          © {year} Socialista
        </p>
      </SectionInner>
    </footer>
  );
}
