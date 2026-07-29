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
  { label: string; Icon: ComponentType<SocialIconProps>; className?: string }
> = {
  instagram: {
    label: 'Instagram',
    Icon: InstagramIcon,
    className: 'bg-linear-to-r from-pink-500 to-purple-500',
  },
  facebook: { label: 'Facebook', Icon: FacebookIcon, className: 'bg-blue-500' },
  twitter: { label: 'X', Icon: XIcon, className: 'bg-black' },
  linkedin: { label: 'LinkedIn', Icon: LinkedInIcon, className: 'bg-blue-500' },
  tiktok: { label: 'TikTok', Icon: TikTokIcon, className: 'bg-black' },
  youtube: { label: 'YouTube', Icon: YouTubeIcon, className: 'bg-red-500' },
  pinterest: { label: 'Pinterest', Icon: PinterestIcon, className: 'bg-red-500' },
  threads: { label: 'Threads', Icon: ThreadsIcon, className: 'bg-black' },
}

/** Glyph color on brand-colored framed badges */
const FRAMED_ICON_COLOR = '#fff'

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

  const { Icon, label } = meta

  // Unframed: inherit text color so icons stay visible in light and dark mode.
  if (!framed) {
    return <Icon size={size} aria-label={label} className={cn('text-current', className)} {...props} />
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
      <Icon size={size} color={FRAMED_ICON_COLOR} {...props} />
    </span>
  )
}
