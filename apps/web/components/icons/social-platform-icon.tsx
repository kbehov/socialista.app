import { FacebookIcon } from '@/components/icons/facebook-icon'
import { InstagramIcon } from '@/components/icons/instagram-icon'
import { LinkedInIcon } from '@/components/icons/linkedin-icon'
import { PinterestIcon } from '@/components/icons/pinterest-icon'
import { ThreadsIcon } from '@/components/icons/threads-icon'
import { TikTokIcon } from '@/components/icons/tiktok-icon'
import type { SocialIconProps } from '@/components/icons/types'
import { XIcon } from '@/components/icons/x-icon'
import { YouTubeIcon } from '@/components/icons/youtube-icon'
import { cn } from '@/lib/utils'
import type { SocialProvider } from '@socialista/types'
import type { ComponentType } from 'react'

const PLATFORM_META: Record<
  SocialProvider,
  { label: string; Icon: ComponentType<SocialIconProps>; className?: string; color?: string }
> = {
  instagram: {
    label: 'Instagram',
    Icon: InstagramIcon,
    className: 'bg-linear-to-r from-pink-500 to-purple-500',
    color: '#ffff',
  },
  facebook: { label: 'Facebook', Icon: FacebookIcon, className: 'bg-blue-500', color: '#fff' },
  twitter: { label: 'X', Icon: XIcon, className: 'bg-black', color: '#fff' },
  linkedin: { label: 'LinkedIn', Icon: LinkedInIcon, className: 'bg-blue-500', color: '#fff' },
  tiktok: { label: 'TikTok', Icon: TikTokIcon, className: 'bg-black', color: '#fff' },
  youtube: { label: 'YouTube', Icon: YouTubeIcon, className: 'bg-red-500', color: '#fff' },
  pinterest: { label: 'Pinterest', Icon: PinterestIcon, className: 'bg-red-500', color: '#fff' },
  threads: { label: 'Threads', Icon: ThreadsIcon, className: 'bg-black', color: '#fff' },
}

export function getSocialPlatformLabel(provider: string): string {
  return PLATFORM_META[provider as SocialProvider]?.label ?? provider
}

export function SocialPlatformIcon({
  provider,
  className,
  size = 14,
  framed = true,
  ...props
}: SocialIconProps & { provider: string; framed?: boolean }) {
  const meta = PLATFORM_META[provider as SocialProvider]

  if (!meta) {
    if (!framed) {
      return (
        <span
          className={cn('text-[10px] font-semibold uppercase text-muted-foreground', className)}
          aria-label={provider}
        >
          {provider.charAt(0)}
        </span>
      )
    }

    return (
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] font-semibold uppercase tracking-wide text-muted-foreground',
          className,
        )}
        aria-label={provider}
      >
        {provider.charAt(0)}
      </span>
    )
  }

  const { Icon, label, color } = meta

  if (!framed) {
    return <Icon size={size} color={color ?? '#fff'} aria-label={label} className={cn(className)} {...props} />
  }

  return (
    <span
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/80 text-foreground ring-1 ring-border/60',
        className,
        meta.className,
      )}
      aria-label={label}
    >
      <Icon size={size} color={color ?? '#fff'} {...props} />
    </span>
  )
}
