import { Badge } from '@/components/ui/badge'
import { STATUS_META } from '@/constants/accounts'
import { cn } from '@/lib/utils'
import { ConnectionStatus } from '@socialista/types'

export function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  const meta = STATUS_META[status]

  return (
    <Badge variant="outline" className={cn('gap-1.5 border px-2 py-0.5 text-[11px] font-medium', meta.className)}>
      <span className="relative flex size-1.5" aria-hidden>
        <span className={cn('absolute inset-0 rounded-full', meta.dotClassName)} />
        {meta.pulse ? (
          <span className={cn('absolute inset-0 animate-ping rounded-full opacity-60', meta.dotClassName)} />
        ) : null}
      </span>
      {meta.label}
    </Badge>
  )
}
