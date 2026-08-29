import { STATUS_META } from '@/constants/accounts'
import { cn } from '@/lib/utils'
import { ConnectionStatus } from '@socialista/types'

export function ConnectionStatusBadge({
  status,
  className,
}: {
  status: ConnectionStatus
  className?: string
}) {
  const meta = STATUS_META[status]

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[13px] font-medium', meta.className, className)}>
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dotClassName)} aria-hidden />
      {meta.label}
    </span>
  )
}
