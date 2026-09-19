'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UGC_SCENE_ICONS, UGC_SCENE_MENU_GROUPS } from '@/utils/ugc/scene.utils'
import {
  UGC_CLIP_TYPE_LABELS,
  type UgcClip,
  type UgcClipType,
} from '@socialista/types'
import { ChevronDownIcon } from 'lucide-react'

type UgcSceneHeaderProps = {
  clip: UgcClip
  clipIndex: number
  onTypeChange: (type: UgcClipType) => void
}

export function UgcSceneHeader({ clip, clipIndex, onTypeChange }: UgcSceneHeaderProps) {
  return (
    <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-black/[0.06] px-4 dark:border-white/[0.08] lg:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-[12px] tabular-nums text-muted-foreground">
          {String(Math.max(clipIndex, 0) + 1).padStart(2, '0')}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex min-w-0 items-center gap-1 rounded-md px-1 py-0.5 text-[13px] font-medium tracking-tight hover:bg-muted"
            >
              <span className="truncate">
                {clip.name ?? UGC_CLIP_TYPE_LABELS[clip.type]}
              </span>
              <ChevronDownIcon className="size-3 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48 max-h-[min(24rem,70vh)] overflow-y-auto">
            {UGC_SCENE_MENU_GROUPS.map((section, index) => (
              <div key={section.group}>
                {index > 0 ? <DropdownMenuSeparator /> : null}
                <DropdownMenuLabel className="text-[11px] font-normal text-muted-foreground">
                  {section.label}
                </DropdownMenuLabel>
                {section.types.map(type => {
                  const Icon = UGC_SCENE_ICONS[type]
                  return (
                    <DropdownMenuItem key={type} onClick={() => onTypeChange(type)}>
                      <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                      {UGC_CLIP_TYPE_LABELS[type]}
                    </DropdownMenuItem>
                  )
                })}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">
        {clip.durationSec}s
      </span>
    </div>
  )
}
