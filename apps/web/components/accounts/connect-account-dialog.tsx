'use client'

import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { SocialProvider } from '@socialista/types'
import { ChevronRightIcon } from 'lucide-react'

export type ConnectablePlatform = {
  provider: Extract<SocialProvider, 'facebook' | 'tiktok' | 'threads'>
  href: string
  description: string
}

const PLATFORMS: ConnectablePlatform[] = [
  {
    provider: 'facebook',
    href: '/api/connect/facebook',
    description: 'Facebook Pages and linked Instagram accounts',
  },
  {
    provider: 'tiktok',
    href: '/api/connect/tiktok',
    description: 'Post videos and photos to TikTok',
  },
  {
    provider: 'threads',
    href: '/api/connect/threads',
    description: 'Publish to your Threads profile',
  },
]

type ConnectAccountDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConnectAccountDialog({ open, onOpenChange }: ConnectAccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect an account</DialogTitle>
          <DialogDescription>
            Choose a platform to authorize. You will be redirected to sign in, then returned here.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          {PLATFORMS.map(platform => (
            <Button
              key={platform.provider}
              type="button"
              variant="outline"
              className={cn(
                'h-auto w-full justify-start gap-3 rounded-xl px-3 py-3 text-left shadow-none',
                'hover:bg-muted/60',
              )}
              asChild
            >
              <a href={platform.href}>
                <SocialPlatformIcon provider={platform.provider} size={16} className="size-9 rounded-lg" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {getSocialPlatformLabel(platform.provider)}
                  </span>
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    {platform.description}
                  </span>
                </span>
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
              </a>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
