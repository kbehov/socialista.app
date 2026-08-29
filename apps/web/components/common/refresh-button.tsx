'use client'
import { Loader2Icon, RefreshCcwIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '../ui/button'
import { dashboardSurface } from '@/components/dashboard/surface'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'
const RefreshButton = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Refresh data"
          className={cn(dashboardSurface.toolbarControl, 'size-7 shrink-0 px-0')}
          onClick={handleRefresh}
        >
          {isPending ? (
            <Loader2Icon className="size-3.5 animate-spin" strokeWidth={1.75} />
          ) : (
            <RefreshCcwIcon className="size-3.5" strokeWidth={1.75} />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Refresh data</p>
      </TooltipContent>
    </Tooltip>
  )
}

export default RefreshButton
