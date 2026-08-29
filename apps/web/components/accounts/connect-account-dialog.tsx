'use client'

import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { dashboardSurface } from '@/components/dashboard/surface'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { SocialProvider } from '@socialista/types'
import { ArrowUpRightIcon, ShieldCheckIcon } from 'lucide-react'

export type ConnectablePlatform = {
  provider: Extract<SocialProvider, 'facebook' | 'instagram' | 'tiktok' | 'threads' | 'linkedin'>
  href: string
  description: string
}

export function getConnectHref(provider: ConnectablePlatform['provider']): string {
  return `/api/connect/${provider}`
}

export function isConnectableProvider(
  provider: SocialProvider,
): provider is ConnectablePlatform['provider'] {
  return CONNECTABLE_PLATFORMS.some(platform => platform.provider === provider)
}

export const CONNECTABLE_PLATFORMS: ConnectablePlatform[] = [
  {
    provider: 'facebook',
    href: getConnectHref('facebook'),
    description: 'Pages and Instagram linked to a Page',
  },
  {
    provider: 'instagram',
    href: getConnectHref('instagram'),
    description: 'Professional account without a Facebook Page',
  },
  {
    provider: 'tiktok',
    href: getConnectHref('tiktok'),
    description: 'Videos and photos to TikTok',
  },
  {
    provider: 'threads',
    href: getConnectHref('threads'),
    description: 'Publish to your Threads profile',
  },
  {
    provider: 'linkedin',
    href: getConnectHref('linkedin'),
    description: 'Post to your LinkedIn profile',
  },
]

type ConnectAccountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConnectAccountDialog({ open, onOpenChange }: ConnectAccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className={cn(dashboardSurface.sectionHeader, 'px-5 py-4 pr-12')}>
          <DialogHeader className="gap-1 text-left">
            <DialogTitle className="text-[15px] font-medium tracking-tight">Connect an account</DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed text-muted-foreground">
              Authorize a platform, then you&apos;ll return here.
            </DialogDescription>
          </DialogHeader>
        </div>

        <ul className="grid gap-0.5 p-1.5" role="list">
          {CONNECTABLE_PLATFORMS.map(platform => (
            <li key={platform.provider}>
              <a
                href={platform.href}
                className={cn(
                  'group/platform flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left',
                  'transition-colors duration-150 ease-out',
                  'hover:bg-foreground/[0.04] active:bg-foreground/[0.06]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                <SocialPlatformIcon
                  provider={platform.provider}
                  size={16}
                  className="size-8 shrink-0 rounded-md shadow-none ring-1 ring-border/50"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium tracking-tight text-foreground">
                    {getSocialPlatformLabel(platform.provider)}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-foreground/56">
                    {platform.description}
                  </span>
                </span>
                <ArrowUpRightIcon
                  className="size-3.5 shrink-0 text-foreground/40 transition-colors duration-150 group-hover/platform:text-foreground"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-start gap-2 border-t border-border/50 px-5 py-3">
          <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0 text-foreground/40" strokeWidth={1.75} />
          <p className="text-[11px] leading-relaxed text-foreground/56">
            Credentials are encrypted at rest and never shared with third parties.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
