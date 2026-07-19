import styles from '@/app/(home)/_components/landing/landing.module.css'
import { cn } from '@/lib/utils'
import { Calendar, Clapperboard, ImageIcon, LayoutGrid, Megaphone, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ShowcaseTabId } from './content'

const NAV = [
  { id: 'images', label: 'Images', icon: Sparkles },
  { id: 'ads', label: 'Ads', icon: Megaphone },
  { id: 'carousels', label: 'Carousels', icon: LayoutGrid },
  { id: 'video', label: 'Video', icon: Clapperboard },
  { id: 'schedule', label: 'Calendar', icon: Calendar },
] as const

type ProductMockupProps = {
  active?: ShowcaseTabId
  children: ReactNode
  inspector?: ReactNode
  title?: string
  className?: string
}

export function ProductMockup({
  active = 'images',
  children,
  inspector,
  title = 'Studio',
  className,
}: ProductMockupProps) {
  return (
    <div className={cn(styles.mockup, className)} aria-hidden="true">
      <div className={styles.mockupChrome}>
        <aside className={styles.mockupSidebar}>
          <div className="mb-2 flex items-center gap-1.5 px-1">
            <span className={styles.mockupDot} />
            <span className={styles.mockupDot} />
            <span className={styles.mockupDot} />
          </div>
          <p className={styles.mockupSidebarLabel}>Create</p>
          {NAV.map(item => {
            const Icon = item.icon
            const isActive = item.id === active
            return (
              <div
                key={item.id}
                className={cn(styles.mockupNavItem, isActive && styles.mockupNavItemActive)}
              >
                <Icon className="size-3.5 shrink-0" strokeWidth={1.75} />
                <span className={styles.mockupNavText}>{item.label}</span>
              </div>
            )
          })}
        </aside>

        <div className={styles.mockupMain}>
          <div className={styles.mockupTopbar}>
            <div className="flex items-center gap-2 min-w-0">
              <ImageIcon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <span className="truncate text-xs font-medium">{title}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="hidden rounded-md border border-border px-2 py-0.5 text-[0.625rem] font-medium text-muted-foreground sm:inline">
                Draft
              </span>
              <span className="rounded-md bg-foreground px-2 py-0.5 text-[0.625rem] font-medium text-background">
                Generate
              </span>
            </div>
          </div>
          <div className={styles.mockupCanvas}>{children}</div>
        </div>

        {inspector ? <aside className={styles.mockupInspector}>{inspector}</aside> : null}
      </div>
    </div>
  )
}
