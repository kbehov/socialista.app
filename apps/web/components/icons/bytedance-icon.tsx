import { cn } from '@/lib/utils'

import type { ProviderIconProps } from './types'

export function ByteDanceIcon({ className, size = 24, ...props }: ProviderIconProps) {
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
      <path d="M16.004 0c2.331 0 4.222.94 5.434 2.355V0h4.225v7.087h-4.225c0-2.33.94-4.221 2.355-5.433V0h-7.789zm0 24c-2.331 0-4.222-.94-5.434-2.355V24H6.345v-7.087h4.225c0 2.33-.94 4.221-2.355 5.433V24h7.789zM0 7.996c0-2.331.94-4.222 2.355-5.434V0h7.087v4.225c-2.33 0-4.221-.94-5.433 2.355H0zm24 0c0 2.331-.94 4.222-2.355 5.434V24h-7.087v-4.225c2.33 0 4.221-.94 5.433-2.355H24z" />
    </svg>
  )
}
