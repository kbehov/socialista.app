'use client'

import { UgcClipScreenshots } from '@/components/studio/ugc/ugc-clip-screenshots'
import { UgcDurationControl } from '@/components/studio/ugc/ugc-duration-control'
import { UgcInfluencerPicker } from '@/components/studio/ugc/ugc-influencer-picker'
import { UgcProductInput } from '@/components/studio/ugc/ugc-product-input'
import { UgcSceneLook } from '@/components/studio/ugc/ugc-scene-look'
import { UgcScriptPanel } from '@/components/studio/ugc/ugc-script-panel'
import { cn } from '@/lib/utils'
import type { UgcClip, UgcProject } from '@socialista/types'
import { ugcClipRequiresScreenshots, ugcClipShowsScript } from '@socialista/types'

type UgcClipInspectorProps = {
  workspaceId: string
  project: UgcProject
  clip?: UgcClip
  generating?: boolean
  writingScript?: boolean
  onProductChange: (next: { imageUrls: string[]; productName?: string; productId?: string | null }) => void
  onDurationChange: (durationSec: number) => void
  onInfluencerChange: (ids: string[]) => void
  onScreenshotsChange: (urls: string[]) => void
  onScriptChange: (text: string) => void
  onWriteWithAi: () => void
  onSceneLookChange: (scenePrompt: string) => void
}

export function UgcClipInspector({
  workspaceId,
  project,
  clip,
  generating,
  writingScript,
  onProductChange,
  onDurationChange,
  onInfluencerChange,
  onScreenshotsChange,
  onScriptChange,
  onWriteWithAi,
  onSceneLookChange,
}: UgcClipInspectorProps) {
  const type = clip?.type
  const needsScreens = type ? ugcClipRequiresScreenshots(type) : false
  const showsScript = type ? ugcClipShowsScript(type) : false
  const hasProduct = project.productImageUrls.length > 0

  return (
    <aside className="flex max-h-[46vh] min-h-0 shrink-0 flex-col overflow-hidden border-t border-border/40 bg-background lg:max-h-none lg:h-full lg:w-[340px] lg:border-t-0 lg:border-l xl:w-[380px]">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        <div className={cn(!hasProduct && 'rounded-xl ring-1 ring-foreground/15')}>
          <UgcProductInput
            workspaceId={workspaceId}
            imageUrls={project.productImageUrls}
            productName={project.productName}
            productId={project.productId}
            disabled={generating}
            onChange={onProductChange}
          />
        </div>

        {clip ? (
          <>
            <div className="rounded-xl border border-border/60 bg-background px-4 py-3">
              <p className="mb-2 text-[13px] font-semibold tracking-tight">Duration</p>
              <UgcDurationControl value={clip.durationSec} disabled={generating} onChange={onDurationChange} />
            </div>

            {type && type !== 'b-roll' ? (
              <UgcInfluencerPicker
                workspaceId={workspaceId}
                selectedIds={clip.influencerId ? [clip.influencerId] : []}
                disabled={generating}
                max={1}
                onChange={onInfluencerChange}
              />
            ) : null}

            {needsScreens ? (
              <UgcClipScreenshots
                workspaceId={workspaceId}
                imageUrls={clip.referenceImageUrls ?? []}
                disabled={generating}
                onChange={onScreenshotsChange}
              />
            ) : null}

            {showsScript ? (
              <UgcScriptPanel
                script={clip.script?.text ?? ''}
                disabled={generating}
                writing={writingScript}
                scriptModelEnabled={Boolean(project.models.script)}
                onScriptChange={onScriptChange}
                onWriteWithAi={onWriteWithAi}
              />
            ) : null}

            <UgcSceneLook value={clip.scenePrompt} disabled={generating} onChange={onSceneLookChange} />
          </>
        ) : (
          <p className="px-1 py-2 text-[12px] leading-relaxed text-muted-foreground">
            Pick a clip type to set creator, script, and look.
          </p>
        )}
      </div>
    </aside>
  )
}
