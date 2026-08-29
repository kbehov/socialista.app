'use client'

import { DownloadIcon, Loader2Icon } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { dashboardSurface } from '@/components/dashboard/surface'
import { cn } from '@/lib/utils'
import { exportAccountAnalyticsCsv, exportWorkspaceAnalyticsSummaryCsv } from '@/services/analytics.service'
import type { AnalyticsRange } from '@socialista/types'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

export type AnalyticsExportCsvButtonProps = {
  workspaceId: string
  range: AnalyticsRange
  /** When set, export a single account summary instead of the workspace breakdown. */
  accountId?: string
  projectId?: string
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function AnalyticsExportCsvButton({ workspaceId, range, accountId, projectId }: AnalyticsExportCsvButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleExport = () => {
    startTransition(async () => {
      try {
        const { success, data, message } = accountId
          ? await exportAccountAnalyticsCsv(workspaceId, accountId, { range })
          : await exportWorkspaceAnalyticsSummaryCsv(workspaceId, { range, projectId })
        if (!success || !data) {
          throw new Error(message ?? 'Failed to export CSV')
        }
        downloadCsv(data.csv, data.filename)
        toast.success('CSV exported')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to export CSV')
      }
    })
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(dashboardSurface.toolbarControl, 'shrink-0 gap-1.5 px-2.5')}
          disabled={isPending}
          onClick={handleExport}
        >
          {isPending ? (
            <Loader2Icon className="size-3.5 animate-spin" strokeWidth={1.75} />
          ) : (
            <DownloadIcon className="size-3.5" strokeWidth={1.75} />
          )}
          {isPending ? 'Exporting…' : 'Export CSV'}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Export CSV</p>
      </TooltipContent>
    </Tooltip>
  )
}

export { AnalyticsExportCsvButton }
