'use client'

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

type Pipeline = 'stills' | 'video' | 'stills-to-video' | null

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
  activePhase?: 'stills' | 'video'
  pipeline?: Pipeline
  blockedReason?: string | null
  onGenerate: () => void
}

function PhaseDot({
  label,
  state,
}: {
  label: string
  state: 'pending' | 'active' | 'done' | 'hidden'
}) {
  if (state === 'hidden') return null
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          'size-1.5 rounded-full',
          state === 'done' && 'bg-foreground',
          state === 'active' && 'animate-pulse bg-foreground',
          state === 'pending' && 'bg-muted-foreground/35',
        )}
      />
      <span
        className={cn(
          'text-[11px] font-medium',
          state === 'pending' ? 'text-muted-foreground' : 'text-foreground',
        )}
      >
        {label}
      </span>
    </span>
  )
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
  activePhase,
  pipeline,
  blockedReason,
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
  const insufficientCredits = modelsLoaded && credits < clipCost
  const generateDisabled = !canGenerate || generating || insufficientCredits

  const showPipeline = Boolean(generating && pipeline)
  const stillsState =
    pipeline === 'video' ? 'done' : activePhase === 'stills' ? 'active' : pipeline === 'stills-to-video' ? 'done' : 'hidden'
  const videoState =
    pipeline === 'stills' ? 'hidden' : activePhase === 'video' ? 'active' : 'pending'

  return (
    <div className="sticky bottom-0 z-10 border-t border-border/40 bg-background/85 px-4 py-3 backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[12px] font-medium tabular-nums text-foreground">
            {modelsLoaded ? `Clip ${clipCost} · ` : null}Balance {credits}
          </p>
          {generating ? (
            <div className="space-y-1.5">
              {showPipeline ? (
                <div className="flex items-center gap-2">
                  <PhaseDot label="Scenes" state={stillsState} />
                  {stillsState !== 'hidden' && videoState !== 'hidden' ? (
                    <span className="text-[11px] text-muted-foreground">→</span>
                  ) : null}
                  <PhaseDot label="Video" state={videoState} />
                </div>
              ) : null}
              <p className="truncate text-[11px] text-muted-foreground">{progressLabel ?? 'Generating…'}</p>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-foreground transition-[width] duration-300"
                  style={{ width: `${Math.min(Math.max(progress ?? 8, 8), 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              {blockedReason ?? 'Scenes then video for this clip.'}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {insufficientCredits && canGenerate ? (
            <Button asChild size="sm" variant="outline">
              <Link href={DASHBOARD_ROUTES.UPGRADE}>Upgrade</Link>
            </Button>
          ) : null}
          <Button type="button" size="sm" disabled={generateDisabled} onClick={onGenerate}>
            {generating ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
            Generate video
          </Button>
        </div>
      </div>
    </div>
  )
}
