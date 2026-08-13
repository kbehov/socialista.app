'use client'

import { dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { UgcClip } from '@socialista/types'
import { ChevronDownIcon, Loader2Icon, RefreshCwIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

type UgcSceneStripProps = {
  clip: UgcClip
  generating?: boolean
  disabled?: boolean
  onRegenerateStill: (index: number, skipEnhance?: boolean) => void
  onEnhancedPromptChange?: (index: number, prompt: string) => void
}

export function UgcSceneStrip({
  clip,
  generating,
  disabled,
  onRegenerateStill,
  onEnhancedPromptChange,
}: UgcSceneStripProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const stills = clip.stills.length > 0 ? clip.stills : [{ index: 0 }]

  return (
    <section className={dashboardSurface.section}>
      <div className={cn(dashboardSurface.sectionHeader, 'px-4 py-3')}>
        <h2 className={dashboardSurface.sectionTitle}>Scenes</h2>
        <p className={dashboardSurface.sectionDescription}>Scene 1 is the video start frame.</p>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid grid-cols-3 gap-2">
          {stills.map((still, index) => {
            const src = still.imageUrl
            return (
              <div key={`${clip.id}-${index}`} className="space-y-1.5">
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
                    onClick={() => onRegenerateStill(index, Boolean(still.enhancedPrompt && openIndex === index))}
                  >
                    <RefreshCwIcon className="size-3" />
                    Redo
                  </Button>
                ) : null}
              </div>
            )
          })}
        </div>

        {stills.some(still => still.enhancedPrompt) ? (
          <Collapsible
            open={openIndex !== null}
            onOpenChange={open => setOpenIndex(open ? 0 : null)}
          >
            <CollapsibleTrigger className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground hover:text-foreground">
              Image prompt
              <ChevronDownIcon className={cn('size-3.5 transition-transform', openIndex !== null && 'rotate-180')} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <Textarea
                value={stills[openIndex ?? 0]?.enhancedPrompt ?? ''}
                disabled={disabled || generating}
                onChange={event => onEnhancedPromptChange?.(openIndex ?? 0, event.target.value)}
                className="min-h-24 text-[12px]"
              />
            </CollapsibleContent>
          </Collapsible>
        ) : null}

        {clip.error ? <p className="text-[11px] text-destructive">{clip.error}</p> : null}
      </div>
    </section>
  )
}
