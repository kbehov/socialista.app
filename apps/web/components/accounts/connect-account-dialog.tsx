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
import { ChevronRightIcon, ShieldCheckIcon } from 'lucide-react'

export type ConnectablePlatform = {
  provider: Extract<SocialProvider, 'facebook' | 'instagram' | 'tiktok' | 'threads' | 'linkedin'>
  href: string
  description: string
}

export const CONNECTABLE_PLATFORMS: ConnectablePlatform[] = [
  {
    provider: 'facebook',
    href: '/api/connect/facebook',
    description: 'Pages and Instagram linked to a Page',
  },
  {
    provider: 'instagram',
    href: '/api/connect/instagram',
    description: 'Professional account without a Facebook Page',
  },
  {
    provider: 'tiktok',
    href: '/api/connect/tiktok',
    description: 'Videos and photos to TikTok',
  },
  {
    provider: 'threads',
    href: '/api/connect/threads',
    description: 'Publish to your Threads profile',
  },
  {
    provider: 'linkedin',
    href: '/api/connect/linkedin',
    description: 'Post to your LinkedIn profile',
  },
]

const PLATFORM_ACCENT: Record<ConnectablePlatform['provider'], string> = {
  facebook: 'hover:border-[#1877F2]/30 hover:bg-[#1877F2]/[0.04] group-hover/platform:text-[#1877F2]',
  instagram:
    'hover:border-pink-500/30 hover:bg-pink-500/[0.04] group-hover/platform:text-pink-600 dark:group-hover/platform:text-pink-400',
  tiktok: 'hover:border-foreground/20 hover:bg-foreground/[0.03]',
  threads: 'hover:border-foreground/20 hover:bg-foreground/[0.03]',
  linkedin:
    'hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/[0.04] group-hover/platform:text-[#0A66C2]',
}

type ConnectAccountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConnectAccountDialog({ open, onOpenChange }: ConnectAccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[420px]">
        <div className="px-6 pt-6 pb-5">
          <DialogHeader className="gap-1.5 text-left">
            <DialogTitle className="text-base font-semibold tracking-tight">
              Connect an account
            </DialogTitle>
            <DialogDescription className="text-[13px] leading-relaxed">
              Choose a platform to authorize. You&apos;ll sign in securely, then return here.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid gap-1.5 px-4 pb-4">
          {CONNECTABLE_PLATFORMS.map(platform => (
            <a
              key={platform.provider}
              href={platform.href}
              className={cn(
                'group/platform flex w-full items-center gap-3 rounded-xl border border-border/60 bg-background px-3 py-3 text-left',
                'transition-all duration-150 ease-out',
                'hover:-translate-y-px hover:shadow-sm',
                'active:translate-y-0 active:scale-[0.99] active:shadow-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                PLATFORM_ACCENT[platform.provider],
              )}
            >
              <SocialPlatformIcon
                provider={platform.provider}
                size={18}
                className="size-10 shrink-0 rounded-xl shadow-xs ring-1 ring-border/50 transition-transform duration-150 group-hover/platform:scale-[1.02]"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium tracking-tight text-foreground transition-colors">
                  {getSocialPlatformLabel(platform.provider)}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {platform.description}
                </span>
              </span>
              <ChevronRightIcon
                className="size-4 shrink-0 text-muted-foreground/50 transition-all duration-150 group-hover/platform:translate-x-0.5 group-hover/platform:text-muted-foreground"
                strokeWidth={1.75}
              />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-border/60 bg-muted/20 px-6 py-3.5">
          <ShieldCheckIcon className="size-3.5 shrink-0 text-muted-foreground/70" strokeWidth={1.75} />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Credentials are encrypted and never shared with third parties.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
