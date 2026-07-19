import { FOOTER } from '@/app/(home)/_components/landing/content'
import styles from '@/app/(home)/_components/landing/landing.module.css'
import Logo from '@/components/common/logo'
import Link from 'next/link'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-14">
      <div className={`${styles.section} ${styles.footerColumns}`}>
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">{FOOTER.tagline}</p>
        </div>

        {FOOTER.columns.map(column => (
          <div key={column.title}>
            <p className={styles.eyebrow}>{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map(link => (
                <li key={`${column.title}-${link.label}`}>
                  {link.href.startsWith('/') ? (
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className={`${styles.section} mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between`}>
        <p>© {year} Socialista</p>
        <p>Crafted for creators, agencies & brands</p>
      </div>
    </footer>
  )
}
