import { cn } from '@/lib/utils'
import { AtSign } from 'lucide-react'

import type { SocialIconProps } from './types'

export function ThreadsIcon({ className, size = 24, ...props }: SocialIconProps) {
  const { 'aria-label': ariaLabel, ...rest } = props

  return (
    <AtSign
      width={size}
      height={size}
      strokeWidth={2.25}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      className={cn('shrink-0', className)}
      {...rest}
    />
  )
}
