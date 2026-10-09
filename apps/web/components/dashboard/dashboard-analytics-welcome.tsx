import { ConnectAccountTrigger } from '@/components/accounts/connect-account-trigger'
import { dashboardSurface } from '@/components/dashboard/surface'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { CalendarClockIcon, ImagesIcon, Link2Icon } from 'lucide-react'
import Link from 'next/link'

type DashboardAnalyticsWelcomeProps = {
  className?: string
}

const quickLinks = [
  {
    title: 'Connect accounts',
    description: 'OAuth in one tap — Instagram, TikTok, LinkedIn, and more.',
    href: DASHBOARD_ROUTES.ACCOUNTS,
    icon: Link2Icon,
    emoji: '🔗',
  },
  {
    title: 'Schedule a post',
    description: 'Compose once, queue it, and stay ahead of the feed.',
    href: DASHBOARD_ROUTES.createPost(),
    icon: CalendarClockIcon,
    emoji: '📅',
  },
  {
    title: 'Create in Studio',
    description: 'AI visuals you can turn into posts when you’re ready.',
    href: DASHBOARD_ROUTES.STUDIO.IMAGES,
    icon: ImagesIcon,
    emoji: '✨',
  },
] as const

const heroEmojis = ['📊', '✨', '🚀'] as const

function DashboardAnalyticsWelcome({ className }: DashboardAnalyticsWelcomeProps) {
  return (
    <div className={cn('flex flex-1 flex-col items-center justify-center py-6 sm:py-12', className)}>
      <div className="flex w-full max-w-2xl flex-col gap-10 text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 sm:gap-4" aria-hidden>
            {heroEmojis.map((emoji, index) => (
              <span
                key={emoji}
                className={cn(
                  'flex size-10 items-center justify-center rounded-[var(--control-radius)] bg-muted/30 text-lg sm:size-11',
                  index === 1 && 'scale-105 bg-muted/45',
                )}
              >
                {emoji}
              </span>
            ))}
          </div>

          <p className="inline-flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span aria-hidden>👋</span>
            You&apos;re in — charts unlock next
          </p>

          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Connect a channel to light up analytics
          </h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
            Followers, publishing rhythm, and performance trends appear here once you&apos;re linked up. Pick a path
            below and you&apos;ll be scheduling in minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <ConnectAccountTrigger label="Connect account" showPlusIcon={false} />
            <Button variant="secondary" size="sm" className={dashboardSurface.createCta} asChild>
              <Link href={DASHBOARD_ROUTES.ACCOUNTS}>Browse accounts</Link>
            </Button>
          </div>
        </div>

        <ul className="grid gap-2 text-left sm:grid-cols-3 sm:gap-3">
          {quickLinks.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex h-full flex-col rounded-lg bg-muted/15 px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5 sm:py-5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none select-none" aria-hidden>{link.emoji}</span>
                  <link.icon
                    className="size-4 text-muted-foreground transition-colors group-hover:text-foreground"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </div>
                <span className="mt-3 text-[13px] font-medium text-foreground">{link.title}</span>
                <span className="mt-1 text-xs leading-relaxed text-muted-foreground">{link.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export { DashboardAnalyticsWelcome }
