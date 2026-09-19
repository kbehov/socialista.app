'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { UGC_SCENE_ICONS, UGC_SCENE_MENU_GROUPS } from '@/utils/ugc/scene.utils'
import {
  UGC_CLIP_TYPE_DESCRIPTIONS,
  UGC_CLIP_TYPE_LABELS,
  UGC_CLIP_TYPE_SHORT_LABELS,
  UGC_MAX_CLIPS,
  UGC_STARTER_SCENE_TYPES,
  type UgcClip,
  type UgcClipType,
} from '@socialista/types'
import type { LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'

export { UGC_SCENE_ICONS } from '@/utils/ugc/scene.utils'

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
  const used = new Set(clips.map(clip => clip.type))
  const atLimit = clips.length >= UGC_MAX_CLIPS

  const add = (type: UgcClipType) => {
    onAdd(type)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align={align} className="w-72 max-h-[min(28rem,70vh)] overflow-y-auto p-1.5">
        {clips.length === 0 && onUseStarter ? (
          <button
            type="button"
            disabled={creating}
            onClick={() => {
              onUseStarter()
              setOpen(false)
            }}
            className="mb-1 w-full rounded-lg bg-foreground px-2.5 py-2 text-left text-background transition active:scale-[0.99] motion-reduce:active:scale-100"
          >
            <p className="text-[13px] font-medium">Use a 3-scene ad</p>
            <p className="mt-0.5 text-[11px] text-background/70">
              {UGC_STARTER_SCENE_TYPES.map(type => UGC_CLIP_TYPE_SHORT_LABELS[type]).join(' · ')}
            </p>
          </button>
        ) : null}
        <div className="grid">
          {UGC_SCENE_MENU_GROUPS.map(section => (
            <div key={section.group} className="mt-1 first:mt-0">
              <p className="px-2.5 pt-1.5 pb-0.5 text-[11px] text-muted-foreground">{section.label}</p>
              {section.types.map(type => {
                const Icon = UGC_SCENE_ICONS[type]
                return (
                  <SceneTypeButton
                    key={type}
                    type={type}
                    Icon={Icon}
                    added={used.has(type)}
                    disabled={creating || atLimit}
                    onSelect={() => add(type)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function SceneTypeButton({
  type,
  Icon,
  added,
  disabled,
  onSelect,
}: {
  type: UgcClipType
  Icon: LucideIcon
  added?: boolean
  disabled?: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-muted/70',
        added && 'bg-muted/40',
      )}
    >
      <span className="mt-0.5 flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-3.5" strokeWidth={1.5} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium tracking-tight">{UGC_CLIP_TYPE_LABELS[type]}</span>
        <span className="block text-[11px] leading-snug text-muted-foreground">
          {UGC_CLIP_TYPE_DESCRIPTIONS[type]}
        </span>
      </span>
    </button>
  )
}
