'use client'

import { DashboardSegment, DashboardSegmentButton, dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { UgcSceneCount, UgcVariant } from '@socialista/types'
import { Loader2Icon, RefreshCwIcon } from 'lucide-react'
import Image from 'next/image'

const SCENE_COUNTS: UgcSceneCount[] = [1, 2, 3]

type UgcSceneStripProps = {
  sceneCount: UgcSceneCount
  variants: UgcVariant[]
  influencerNames: Record<string, string>
  generating?: boolean
  disabled?: boolean
  onSceneCountChange: (count: UgcSceneCount) => void
  onRegenerateStill: (variantId: string, index: number) => void
}

export function UgcSceneStrip({
  sceneCount,
  variants,
  influencerNames,
  generating,
  disabled,
  onSceneCountChange,
  onRegenerateStill,
}: UgcSceneStripProps) {
  return (
    <section className={dashboardSurface.section}>
      <div className={cn(dashboardSurface.sectionHeader, 'flex items-center justify-between gap-3 px-4 py-3')}>
        <div>
          <h2 className={dashboardSurface.sectionTitle}>Scenes</h2>
          <p className={dashboardSurface.sectionDescription}>Scene 1 is the video start frame.</p>
        </div>
        <DashboardSegment label="How many scenes">
          {SCENE_COUNTS.map(count => (
            <DashboardSegmentButton
              key={count}
              active={sceneCount === count}
              disabled={disabled || generating}
              onClick={() => onSceneCountChange(count)}
            >
              {count}
            </DashboardSegmentButton>
          ))}
        </DashboardSegment>
      </div>

      <div className="space-y-4 p-4">
        {variants.length === 0 ? (
          <p className="text-sm text-muted-foreground">Pick a creator to generate scenes.</p>
        ) : (
          variants.map(variant => (
            <div key={variant.id} className="space-y-2">
              <p className="text-[12px] font-medium text-muted-foreground">
                {influencerNames[variant.influencerId] ?? 'Creator'}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: sceneCount }, (_, index) => {
                  const still = variant.stills.find(item => item.index === index)
                  const src = still?.imageUrl
                  return (
                    <div key={`${variant.id}-${index}`} className="space-y-1.5">
                      <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-muted/30 ring-1 ring-border/60">
                        {src ? (
                          <Image
                            alt={`Scene ${index + 1}`}
                            className="object-cover"
                            fill
                            sizes="180px"
                            src={src}
                            unoptimized
                          />
                        ) : generating ? (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
                          </span>
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-[11px] text-muted-foreground">
                            Scene {index + 1}
                          </span>
                        )}
                        {index === 0 ? (
                          <span className="absolute top-1.5 left-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                            Start frame
                          </span>
                        ) : null}
                      </div>
                      {src ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 w-full text-[11px]"
                          disabled={disabled || generating}
                          onClick={() => onRegenerateStill(variant.id, index)}
                        >
                          <RefreshCwIcon className="size-3" />
                          Redo
                        </Button>
                      ) : null}
                    </div>
                  )
                })}
              </div>
              {variant.error ? <p className="text-[11px] text-destructive">{variant.error}</p> : null}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
