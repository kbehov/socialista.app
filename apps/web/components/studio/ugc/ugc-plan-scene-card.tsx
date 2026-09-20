'use client'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  UGC_CLIP_TYPE_DESCRIPTIONS,
  UGC_CLIP_TYPE_LABELS,
  type UgcAdPlanScene,
} from '@socialista/types'
import { ChevronDownIcon } from 'lucide-react'

function PlanBlock({ label, body }: { label: string; body: string }) {
  return (
    <div className="mt-3">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed">{body}</p>
    </div>
  )
}

export function UgcPlanSceneCard({ scene, index }: { scene: UgcAdPlanScene; index: number }) {
  const label = UGC_CLIP_TYPE_LABELS[scene.type]

  return (
    <article className="rounded-xl border border-border/70 bg-background p-3.5">
      <header className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="min-w-0 flex-1 text-[13px] font-medium tracking-tight">{label}</h3>
        <span className="text-[11px] tabular-nums text-muted-foreground">{scene.durationSec}s</span>
      </header>
      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
        {UGC_CLIP_TYPE_DESCRIPTIONS[scene.type]}
      </p>
      <PlanBlock label="Why this scene" body={scene.goal} />
      {scene.script ? (
        <div className="mt-3">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            What they say
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed">“{scene.script}”</p>
        </div>
      ) : (
        <p className="mt-3 text-[12px] text-muted-foreground">No talking in this scene.</p>
      )}
      <Collapsible className="mt-3">
        <CollapsibleTrigger
          type="button"
          className="group flex w-full items-center gap-1.5 py-1 text-left text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>Advanced: generation prompts</span>
          <ChevronDownIcon className="size-3 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-150">
          <PlanBlock label="Photo prompt" body={scene.imagePrompt} />
          <PlanBlock label="Motion prompt" body={scene.videoPrompt} />
        </CollapsibleContent>
      </Collapsible>
    </article>
  )
}
