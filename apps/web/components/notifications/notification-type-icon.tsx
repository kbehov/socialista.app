'use client'

import type { NotificationType } from '@socialista/types'
import {
  AlertCircleIcon,
  CreditCardIcon,
  ImageIcon,
  InfoIcon,
  MegaphoneIcon,
  SendIcon,
  VideoIcon,
} from 'lucide-react'

export function NotificationTypeIcon({
  type,
  className,
}: {
  type: NotificationType
  className?: string
}) {
  switch (type) {
    case 'generation.image.completed':
      return <ImageIcon className={className} strokeWidth={1.75} />
    case 'generation.video.completed':
      return <VideoIcon className={className} strokeWidth={1.75} />
    case 'generation.static_ad.completed':
      return <MegaphoneIcon className={className} strokeWidth={1.75} />
    case 'post.published':
      return <SendIcon className={className} strokeWidth={1.75} />
    case 'billing.subscription.created':
    case 'billing.subscription.renewed':
    case 'billing.subscription.canceled':
      return <CreditCardIcon className={className} strokeWidth={1.75} />
    case 'generation.image.failed':
    case 'generation.video.failed':
    case 'generation.static_ad.failed':
    case 'post.failed':
      return <AlertCircleIcon className={className} strokeWidth={1.75} />
    default:
      return <InfoIcon className={className} strokeWidth={1.75} />
  }
}
