import { cn } from '@/lib/utils'

import type { ProviderIconProps } from './types'

export function XaiIcon({ className, size = 24, ...props }: ProviderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden={props['aria-label'] ? undefined : true}
      className={cn('shrink-0', className)}
      {...props}
    >
      <path d="M2.244 2.25h3.308l7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 4.451-6.231zm14.88 17.52h1.833L7.084 4.126H5.117L17.124 19.77z" />
    </svg>
  )
}
