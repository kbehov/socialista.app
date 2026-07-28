'use client'

import { DownloadIcon, Loader2Icon } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { exportAccountAnalyticsCsv, exportWorkspaceAnalyticsSummaryCsv } from '@/services/analytics.service'
import type { AnalyticsRange } from '@socialista/types'

export type AnalyticsExportCsvButtonProps = {
  workspaceId: string
  range: AnalyticsRange
  /** When set, export a single account summary instead of the workspace breakdown. */
  accountId?: string
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

function AnalyticsExportCsvButton({ workspaceId, range, accountId }: AnalyticsExportCsvButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleExport = () => {
    startTransition(async () => {
      try {
        const { success, data, message } = accountId
          ? await exportAccountAnalyticsCsv(workspaceId, accountId, { range })
          : await exportWorkspaceAnalyticsSummaryCsv(workspaceId, { range })
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
    <Button type="button" variant="ghost" size="sm" className="shrink-0" disabled={isPending} onClick={handleExport}>
      {isPending ? (
        <Loader2Icon className="size-3.5 animate-spin" strokeWidth={1.75} />
      ) : (
        <DownloadIcon className="size-3.5" strokeWidth={1.75} data-icon="inline-start" />
      )}
      {isPending ? 'Exporting…' : 'Export'}
    </Button>
  )
}

export { AnalyticsExportCsvButton }
