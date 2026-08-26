import type { AccountAnalyticsResponse } from '@socialista/types'

import { AccountAnalyticsMetrics } from './account-analytics-metrics'
import { AccountAnalyticsQuality } from './account-analytics-quality'
import { AnalyticsExportCsvButton } from './analytics-export-csv-button'
import { GrowthChart } from './growth-chart'

export type AccountAnalyticsViewProps = {
  workspaceId: string
  data: AccountAnalyticsResponse
  hideExport?: boolean
}

function AccountAnalyticsView({ workspaceId, data, hideExport = false }: AccountAnalyticsViewProps) {
  return (
    <div className="flex w-full flex-col gap-6 pb-8">
      {hideExport ? null : (
        <div className="flex justify-end">
          <AnalyticsExportCsvButton workspaceId={workspaceId} accountId={data.account.id} range={data.range} />
        </div>
      )}

      <AccountAnalyticsQuality dataQuality={data.dataQuality} />

      <AccountAnalyticsMetrics data={data} />

      <GrowthChart data={{ range: data.range, series: data.series }} />
    </div>
  )
}

export { AccountAnalyticsView }
