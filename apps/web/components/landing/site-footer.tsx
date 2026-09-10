import Logo from '@/components/common/logo'
import Link from 'next/link'

import { FOOTER } from './content'
import styles from './landing.module.css'
import { SectionInner } from './section'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-12 sm:py-16">
      <SectionInner>
        <div className={styles.footerColumns}>
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">{FOOTER.tagline}</p>
          </div>

          {FOOTER.columns.map(column => (
            <div key={column.title}>
              <p className={styles.eyebrow}>{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 text-xs text-muted-foreground">© {year} Socialista</p>
      </SectionInner>
    </footer>
  )
}
