'use client'

import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
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

const PLATFORM_ROW_CLASS: Record<ConnectablePlatform['provider'], string> = {
  facebook:
    'hover:border-[#1877F2]/40 hover:bg-[#1877F2]/[0.06] dark:hover:border-[#1877F2]/45 dark:hover:bg-[#1877F2]/[0.12] dark:focus-visible:ring-[#1877F2]/25',
  instagram:
    'hover:border-pink-500/40 hover:bg-pink-500/[0.06] dark:hover:border-pink-400/45 dark:hover:bg-pink-500/[0.12] dark:focus-visible:ring-pink-400/25',
  tiktok:
    'hover:border-border-strong hover:bg-accent dark:hover:bg-surface-3',
  threads:
    'hover:border-border-strong hover:bg-accent dark:hover:bg-surface-3',
  linkedin:
    'hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/[0.06] dark:hover:border-[#0A66C2]/45 dark:hover:bg-[#0A66C2]/[0.12] dark:focus-visible:ring-[#0A66C2]/25',
}

type ConnectAccountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConnectAccountDialog({ open, onOpenChange }: ConnectAccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="border-b border-border px-6 py-5 pr-14">
          <DialogHeader className="gap-1 text-left">
            <DialogTitle className="text-base font-semibold tracking-tight">
              Connect an account
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed text-muted-foreground">
              Choose a platform to authorize. You&apos;ll sign in securely, then return here.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-3">
          <ul className="grid gap-1" role="list">
            {CONNECTABLE_PLATFORMS.map(platform => (
              <li key={platform.provider}>
                <a
                  href={platform.href}
                  className={cn(
                    'group/platform flex w-full items-center gap-3 rounded-lg border border-border bg-secondary px-3 py-2.5 text-left',
                    'transition-colors duration-150 ease-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                    'active:bg-accent',
                    PLATFORM_ROW_CLASS[platform.provider],
                  )}
                >
                  <SocialPlatformIcon
                    provider={platform.provider}
                    size={18}
                    className="size-9 shrink-0 rounded-lg shadow-none ring-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium tracking-tight text-foreground">
                      {getSocialPlatformLabel(platform.provider)}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                      {platform.description}
                    </span>
                  </span>
                  <ArrowUpRightIcon
                    className="size-3.5 shrink-0 text-muted-foreground/60 transition-[transform,color] duration-150 group-hover/platform:-translate-y-px group-hover/platform:translate-x-px group-hover/platform:text-foreground"
                    strokeWidth={2}
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-start gap-2.5 border-t border-border bg-muted px-6 py-3.5">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-border bg-card">
            <ShieldCheckIcon className="size-3 text-muted-foreground" strokeWidth={2} />
          </span>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Credentials are encrypted at rest and never shared with third parties.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
