'use client'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  UGC_CLIP_TYPE_DESCRIPTIONS,
  UGC_CLIP_TYPE_LABELS,
  UGC_CLIP_TYPES,
  UGC_MAX_CLIPS,
  UGC_PRIMARY_SCENE_TYPES,
  type UgcClip,
  type UgcClipType,
} from '@socialista/types'
import { BoxIcon, HandIcon, MicIcon, PackageIcon, ShirtIcon, SmartphoneIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'

export const UGC_SCENE_ICONS: Record<UgcClipType, typeof MicIcon> = {
  talking: MicIcon,
  'product-hold': HandIcon,
  'b-roll': PackageIcon,
  unboxing: BoxIcon,
  'try-on': ShirtIcon,
  'app-showcase': SmartphoneIcon,
}

const EXTRA_TYPES = UGC_CLIP_TYPES.filter(type => !UGC_PRIMARY_SCENE_TYPES.includes(type))

type UgcAddSceneMenuProps = {
  clips: UgcClip[]
  creating?: boolean
  align?: 'start' | 'center' | 'end'
  children: ReactNode
  onAdd: (type: UgcClipType) => void
  onUseStarter?: () => void
}

export function UgcAddSceneMenu({
  clips,
  creating,
  align = 'start',
  children,
  onAdd,
  onUseStarter,
}: UgcAddSceneMenuProps) {
  const [open, setOpen] = useState(false)
  const [showExtra, setShowExtra] = useState(false)
  const used = new Set(clips.map(clip => clip.type))
  const atLimit = clips.length >= UGC_MAX_CLIPS

  const add = (type: UgcClipType) => {
    onAdd(type)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align={align} className="w-80 overflow-y-auto p-3">
        {clips.length === 0 && onUseStarter ? (
          <button
            type="button"
            disabled={creating}
            onClick={() => {
              onUseStarter()
              setOpen(false)
            }}
            className="mb-2 w-full rounded-xl bg-foreground px-3 py-2.5 text-left text-background transition active:scale-[0.99]"
          >
            <p className="text-[13px] font-medium">Use a simple 3-scene ad</p>
            <p className="mt-0.5 text-[11px] text-background/70">Talk · Hold · Show</p>
          </button>
        ) : null}
        <div className="grid gap-1.5">
          {UGC_PRIMARY_SCENE_TYPES.map(type => {
            const Icon = UGC_SCENE_ICONS[type]
            const added = used.has(type)
            return (
              <button
                key={type}
                type="button"
                disabled={creating || atLimit}
                onClick={() => add(type)}
                className={cn(
                  'flex items-start gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-muted/50',
                  added && 'bg-muted/40',
                )}
              >
                <span className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-3.5" strokeWidth={1.5} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium tracking-tight">{UGC_CLIP_TYPE_LABELS[type]}</span>
                  <span className="block text-[11px] text-muted-foreground">{UGC_CLIP_TYPE_DESCRIPTIONS[type]}</span>
                </span>
              </button>
            )
          })}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-1 h-7 px-2 text-[12px] text-muted-foreground"
          onClick={() => setShowExtra(value => !value)}
        >
          {showExtra ? 'Hide other scenes' : 'Add a different scene'}
        </Button>
        {showExtra ? (
          <div className="mt-1 grid gap-1.5">
            {EXTRA_TYPES.map(type => {
              const Icon = UGC_SCENE_ICONS[type]
              return (
                <button
                  key={type}
                  type="button"
                  disabled={creating || atLimit}
                  onClick={() => add(type)}
                  className="flex items-start gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-muted/50"
                >
                  <span className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-3.5" strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium tracking-tight">{UGC_CLIP_TYPE_LABELS[type]}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {UGC_CLIP_TYPE_DESCRIPTIONS[type]}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
