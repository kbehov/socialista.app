'use client'

import { dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { estimateUgcCredits } from '@/lib/studio/ugc/credit-estimate'
import { cn } from '@/lib/utils'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import { useWorkspaceStore } from '@/store/workspace.store'
import type { Model } from '@socialista/types'
import { Loader2Icon } from 'lucide-react'
import Link from 'next/link'

function modelCost(models: Model[], value?: string) {
  return models.find(model => model.value === value)?.cost ?? 0
}

type UgcGenerateBarProps = {
  sceneCount: number
  imageValue?: string
  scriptValue?: string
  videoValue?: string
  plannerValue?: string
  canGenerate: boolean
  generating?: boolean
  progressLabel?: string
  progress?: number
  primaryLabel: string
  onGenerate: () => void
}

export function UgcGenerateBar({
  sceneCount,
  imageValue,
  scriptValue,
  videoValue,
  plannerValue,
  canGenerate,
  generating,
  progressLabel,
  progress,
  primaryLabel,
  onGenerate,
}: UgcGenerateBarProps) {
  const credits = useWorkspaceStore(s => s.currentWorkspace?.billing.aiCreditsBalance ?? 0)
  const imageModels = useUgcProjectStore(s => s.imageModels)
  const scriptModels = useUgcProjectStore(s => s.scriptModels)
  const videoModels = useUgcProjectStore(s => s.videoModels)
  const modelsLoaded = useUgcProjectStore(s => s.modelsLoaded)
  const estimate = estimateUgcCredits({
    sceneCount,
    imageCost: modelCost(imageModels, imageValue),
    videoCost: modelCost(videoModels, videoValue),
    plannerCost: modelCost(scriptModels, plannerValue) || modelCost(scriptModels, scriptValue),
    scriptCost: modelCost(scriptModels, scriptValue),
  })
  const clipCost = estimate.stills + estimate.planner + estimate.video

  return (
    <div className={cn(dashboardSurface.panel, 'sticky bottom-3 z-10 flex flex-col gap-3 shadow-sm sm:flex-row sm:items-center')}>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-[12px] font-medium tabular-nums text-foreground">
          {modelsLoaded ? `Clip ${clipCost} · ` : null}Balance {credits}
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
          <p className="text-[11px] text-muted-foreground">Scenes then video for this clip.</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {credits < clipCost && canGenerate && modelsLoaded ? (
          <Button asChild size="sm" variant="outline">
            <Link href={DASHBOARD_ROUTES.UPGRADE}>Upgrade</Link>
          </Button>
        ) : null}
        <Button type="button" size="sm" disabled={!canGenerate || generating} onClick={onGenerate}>
          {generating ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
          {primaryLabel}
        </Button>
      </div>
    </div>
  )
}
