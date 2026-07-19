import { PLATFORMS, type PlatformId } from '@/app/(home)/_components/landing/content'
import styles from '@/app/(home)/_components/landing/landing.module.css'
import { FacebookIcon } from '@/components/icons/facebook-icon'
import { InstagramIcon } from '@/components/icons/instagram-icon'
import { LinkedInIcon } from '@/components/icons/linkedin-icon'
import { PinterestIcon } from '@/components/icons/pinterest-icon'
import { ThreadsIcon } from '@/components/icons/threads-icon'
import { TikTokIcon } from '@/components/icons/tiktok-icon'
import { XIcon } from '@/components/icons/x-icon'
import { YouTubeIcon } from '@/components/icons/youtube-icon'
import type { ComponentType } from 'react'

const ICONS: Record<PlatformId, ComponentType<{ size?: number; className?: string }>> = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  youtube: YouTubeIcon,
  x: XIcon,
  linkedin: LinkedInIcon,
  pinterest: PinterestIcon,
  facebook: FacebookIcon,
  threads: ThreadsIcon,
}

function PlatformRow({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="flex" aria-hidden={ariaHidden}>
      {PLATFORMS.map(platform => {
        const Icon = ICONS[platform.id]
        return (
          <span key={platform.id} className={styles.marqueeItem}>
            <Icon size={16} className="opacity-50" />
            {platform.label}
          </span>
        )
      })}
    </div>
  )
}

export function BrandMarquee() {
  return (
    <div className={styles.marquee} aria-label="Supported platforms">
      <div className={styles.marqueeTrack}>
        <PlatformRow />
        <PlatformRow ariaHidden />
      </div>
    </div>
  )
}
