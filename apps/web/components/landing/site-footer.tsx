import Logo from "@/components/common/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { FOOTER } from "./content";
import { landingBodySm, landingLabel } from "./landing-classes";
import { SectionInner } from "./section";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-16">
      <SectionInner>
        <div className="grid gap-10 sm:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))] sm:gap-8">
          <div>
            <Logo />
            <p className={cn(landingBodySm, "mt-4 max-w-[16rem]")}>
              {FOOTER.tagline}
            </p>
          </div>

          {FOOTER.columns.map((column) => (
            <div key={column.title}>
              <p className={landingLabel}>{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm tracking-[-0.01em] text-muted-foreground transition-colors duration-150 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground/70">
          © {year} Socialista
        </p>
      </SectionInner>
    </footer>
  );
}
