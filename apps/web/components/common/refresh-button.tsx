'use client'
import { Loader2Icon, RefreshCcwIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '../ui/button'
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
          size="icon"
          className="h-8 shrink-0 rounded-full border-border/60 px-3.5 text-xs font-medium shadow-none hover:bg-muted/40 active:scale-[0.98]"
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
