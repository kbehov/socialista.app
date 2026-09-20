'use client'

import { UgcPlanProgress } from '@/components/studio/ugc/ugc-plan-progress'
import { UgcPlanSceneCard } from '@/components/studio/ugc/ugc-plan-scene-card'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { UGC_CLIP_TYPE_LABELS, type UgcAdPlan } from '@socialista/types'
import { ClapperboardIcon, Loader2Icon } from 'lucide-react'

type UgcPlanSheetProps = {
  open: boolean
  planning?: boolean
  building?: boolean
  plan?: UgcAdPlan | null
  error?: string | null
  onOpenChange: (open: boolean) => void
  onBuild: () => void
}

export function UgcPlanSheet({
  open,
  planning,
  building,
  plan,
  error,
  onOpenChange,
  onBuild,
}: UgcPlanSheetProps) {
  const totalDuration = plan?.scenes.reduce((sum, scene) => sum + scene.durationSec, 0) ?? 0
  const sceneCount = plan?.scenes.length ?? 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border/60">
          <SheetTitle>Video plan</SheetTitle>
          <SheetDescription>
            {planning
              ? 'Drafting scenes, scripts, and prompts.'
              : plan
                ? 'We drafted your ad scene by scene. Review it, then build the scenes to edit and generate them.'
                : 'The plan will show up here.'}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {planning || (!plan && !error) ? (
            <UgcPlanProgress />
          ) : error ? (
            <div className="space-y-2">
              <p className="text-[13px] leading-relaxed text-destructive">{error}</p>
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                Try again — rewording your brief often helps.
              </p>
            </div>
          ) : plan ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12px] text-muted-foreground">
                    {plan.scenes.map(scene => UGC_CLIP_TYPE_LABELS[scene.type]).join(' → ')}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    · {sceneCount} scene{sceneCount === 1 ? '' : 's'} · {totalDuration}s
                  </span>
                </div>
                <p className="text-[14px] leading-relaxed font-medium tracking-tight">{plan.concept}</p>
                <p className="text-[12px] text-muted-foreground">{plan.targetAudience}</p>
              </div>
              <div className="space-y-3">
                {plan.scenes.map((scene, index) => (
                  <UgcPlanSceneCard key={`${scene.type}-${index}`} scene={scene} index={index} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <SheetFooter className="border-t border-border/60">
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            Build scenes adds these as editable scenes to your board. You can change scripts, photos,
            and length after.
          </p>
          <Button type="button" disabled={!plan || planning || building} onClick={onBuild}>
            {building ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <ClapperboardIcon className="size-3.5" />
            )}
            Build scenes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
