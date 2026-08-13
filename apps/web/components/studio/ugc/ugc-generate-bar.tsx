'use client'

import { dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useWorkspaceBilling } from '@/hooks/use-workspace-billing'
import { estimateUgcCredits } from '@/lib/studio/ugc/credit-estimate'
import { cn } from '@/lib/utils'
import type { Model } from '@socialista/types'
import { Loader2Icon } from 'lucide-react'
import Link from 'next/link'

function modelCost(models: Model[], value?: string) {
  return models.find(model => model.value === value)?.cost ?? 0
}

type UgcGenerateBarProps = {
  sceneCount: number
  variantCount: number
  imageModels: Model[]
  scriptModels: Model[]
  videoModels: Model[]
  imageValue?: string
  scriptValue?: string
  videoValue?: string
  plannerValue?: string
  canGenerateStills: boolean
  canGenerateVideo: boolean
  generating?: boolean
  progressLabel?: string
  progress?: number
  onGenerateStills: () => void
  onGenerateVideo: () => void
}

export function UgcGenerateBar({
  sceneCount,
  variantCount,
  imageModels,
  scriptModels,
  videoModels,
  imageValue,
  scriptValue,
  videoValue,
  plannerValue,
  canGenerateStills,
  canGenerateVideo,
  generating,
  progressLabel,
  progress,
  onGenerateStills,
  onGenerateVideo,
}: UgcGenerateBarProps) {
  const { credits } = useWorkspaceBilling()
  const estimate = estimateUgcCredits({
    sceneCount,
    variantCount,
    imageCost: modelCost(imageModels, imageValue),
    videoCost: modelCost(videoModels, videoValue),
    plannerCost: modelCost(scriptModels, plannerValue) || modelCost(scriptModels, scriptValue),
    scriptCost: modelCost(scriptModels, scriptValue),
  })
  const stillsCost = estimate.stills
  const videoCost = estimate.planner + estimate.video
  const primaryIsStills = canGenerateStills && !canGenerateVideo

  return (
    <div className={cn(dashboardSurface.panel, 'sticky bottom-3 z-10 flex flex-col gap-3 shadow-sm sm:flex-row sm:items-center')}>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-[12px] font-medium tabular-nums text-foreground">
          Scenes {stillsCost} · Video {videoCost} · Balance {credits}
        </p>
        {generating ? (
          <div className="space-y-1">
            <p className="truncate text-[11px] text-muted-foreground">{progressLabel ?? 'Generating…'}</p>
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-[width] duration-300"
                style={{ width: `${Math.min(Math.max(progress ?? 8, 8), 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">Live estimate. Max 3 ads per generate.</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {credits < stillsCost && canGenerateStills ? (
          <Button asChild size="sm" variant="outline">
            <Link href={DASHBOARD_ROUTES.UPGRADE}>Upgrade</Link>
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant={primaryIsStills ? 'default' : 'outline'}
          disabled={!canGenerateStills || generating}
          onClick={onGenerateStills}
        >
          {generating && primaryIsStills ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
          Generate scenes
        </Button>
        <Button
          type="button"
          size="sm"
          variant={primaryIsStills ? 'outline' : 'default'}
          disabled={!canGenerateVideo || generating}
          onClick={onGenerateVideo}
        >
          {generating && !primaryIsStills ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
          Generate video
        </Button>
      </div>
    </div>
  )
}
