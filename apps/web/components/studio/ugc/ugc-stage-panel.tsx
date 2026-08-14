'use client'

import { UgcClipTypePicker } from '@/components/studio/ugc/ugc-clip-type-picker'
import { UgcGenerateBar } from '@/components/studio/ugc/ugc-generate-bar'
import { UgcSceneStrip } from '@/components/studio/ugc/ugc-scene-strip'
import { UgcVideoStage } from '@/components/studio/ugc/ugc-video-stage'
import { cn } from '@/lib/utils'
import type { UgcClip, UgcClipType } from '@socialista/types'
import { CheckIcon } from 'lucide-react'

type UgcStagePanelProps = {
  clip?: UgcClip
  empty: boolean
  hasProduct: boolean
  generating: boolean
  openingEditor?: boolean
  canGenerate: boolean
  blockedReason?: string | null
  sceneCount: number
  imageValue?: string
  scriptValue?: string
  videoValue?: string
  plannerValue?: string
  progress: number
  progressLabel: string
  activePhase?: 'stills' | 'video'
  pipeline?: 'stills' | 'video' | 'stills-to-video' | null
  plannedPromptDraft: string
  disabled?: boolean
  onSelectType: (type: UgcClipType) => void
  onPlannedPromptChange: (value: string) => void
  onRegenerateVideo: (plannedPrompt?: string) => void
  onOpenEditor: () => void
  onRegenerateStill: (index: number, skipEnhance?: boolean) => void
  onEnhancedPromptChange: (index: number, prompt: string) => void
  onGenerate: () => void
}

function StepBadge({ n, done }: { n: number; done?: boolean }) {
  return (
    <span
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums',
        done ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground',
      )}
    >
      {done ? <CheckIcon className="size-3" strokeWidth={2.5} /> : n}
    </span>
  )
}

function UgcEmptyHero({
  hasProduct,
  disabled,
  onSelectType,
}: {
  hasProduct: boolean
  disabled?: boolean
  onSelectType: (type: UgcClipType) => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col justify-center px-4 py-10 sm:px-6">
      <p className="text-lg font-semibold tracking-tight">Create a UGC clip</p>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
        Add a product, pick a clip type, then generate a 5–15s video. You can add talking, b-roll, and more in the same
        project.
      </p>

      <ol className="mt-8 space-y-5">
        <li className="flex items-start gap-3">
          <StepBadge n={1} done={hasProduct} />
          <div className="min-w-0 pt-0.5">
            <p className="text-[13px] font-medium tracking-tight">Add a product photo</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
              {hasProduct ? 'Product ready — pick a clip type next.' : 'Upload a photo, pick from catalog, or paste a URL in the product panel.'}
            </p>
          </div>
        </li>
        <li className="space-y-3">
          <div className="flex items-start gap-3">
            <StepBadge n={2} />
            <div className="min-w-0 pt-0.5">
              <p className="text-[13px] font-medium tracking-tight">Pick a clip type</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                Each type asks for different inputs. You can add more clips later.
              </p>
            </div>
          </div>
          <UgcClipTypePicker framed={false} disabled={disabled} onSelect={onSelectType} />
        </li>
        <li className="flex items-start gap-3 opacity-70">
          <StepBadge n={3} />
          <div className="min-w-0 pt-0.5">
            <p className="text-[13px] font-medium tracking-tight">Generate video</p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
              We build scenes first, then animate them into the clip.
            </p>
          </div>
        </li>
      </ol>
    </div>
  )
}

export function UgcStagePanel({
  clip,
  empty,
  hasProduct,
  generating,
  openingEditor,
  canGenerate,
  blockedReason,
  sceneCount,
  imageValue,
  scriptValue,
  videoValue,
  plannerValue,
  progress,
  progressLabel,
  activePhase,
  pipeline,
  plannedPromptDraft,
  disabled,
  onSelectType,
  onPlannedPromptChange,
  onRegenerateVideo,
  onOpenEditor,
  onRegenerateStill,
  onEnhancedPromptChange,
  onGenerate,
}: UgcStagePanelProps) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-muted/10">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {empty || !clip ? (
          <UgcEmptyHero hasProduct={hasProduct} disabled={disabled} onSelectType={onSelectType} />
        ) : (
          <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-5 sm:px-6">
            <UgcVideoStage
              clip={{ ...clip, plannedPrompt: plannedPromptDraft || clip.plannedPrompt }}
              generating={generating && activePhase === 'video'}
              openingEditor={openingEditor}
              onPlannedPromptChange={onPlannedPromptChange}
              onRegenerateVideo={onRegenerateVideo}
              onOpenEditor={onOpenEditor}
            />
            <UgcSceneStrip
              clip={clip}
              generating={generating && activePhase === 'stills'}
              disabled={disabled}
              onRegenerateStill={onRegenerateStill}
              onEnhancedPromptChange={onEnhancedPromptChange}
            />
          </div>
        )}
      </div>

      {clip && !empty ? (
        <UgcGenerateBar
          sceneCount={sceneCount}
          imageValue={imageValue}
          scriptValue={scriptValue}
          videoValue={videoValue}
          plannerValue={plannerValue}
          canGenerate={canGenerate}
          generating={generating}
          progress={progress}
          progressLabel={progressLabel}
          activePhase={activePhase}
          pipeline={pipeline}
          blockedReason={blockedReason}
          onGenerate={onGenerate}
        />
      ) : null}
    </section>
  )
}
