'use client'

import { useState } from 'react'
import { FilmIcon, FolderOpenIcon } from 'lucide-react'
import { PropertiesPanel } from '@/components/video/inspector/properties-panel'
import { VideoSourcePanel } from '@/components/video/video-source-panel'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type SidebarTab = 'media' | 'edit'

function RailButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: typeof FolderOpenIcon
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          aria-pressed={active}
          className={cn(
            'flex w-full flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] font-medium transition-colors',
            active
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-background/60 hover:text-foreground',
          )}
        >
          <Icon className="size-4 shrink-0" strokeWidth={active ? 2 : 1.75} />
          <span className="leading-none">{label}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export function VideoStudioSidebar({ className }: { className?: string }) {
  const [tab, setTab] = useState<SidebarTab>('media')

  return (
    <div className={cn('flex h-full min-h-0 min-w-0 shrink-0', className)}>
      <nav
        aria-label="Editor panels"
        className="video-editor-rail flex w-14 shrink-0 flex-col gap-1 border-r px-1.5 py-2"
      >
        <RailButton
          active={tab === 'media'}
          label="Media"
          icon={FolderOpenIcon}
          onClick={() => setTab('media')}
        />
        <RailButton
          active={tab === 'edit'}
          label="Edit"
          icon={FilmIcon}
          onClick={() => setTab('edit')}
        />
      </nav>

      <div className="video-editor-panel flex w-60 min-w-0 shrink-0 flex-col overflow-hidden border-r lg:w-64 xl:w-[280px]">
        {tab === 'media' ? <VideoSourcePanel /> : <PropertiesPanel embedded />}
      </div>
    </div>
  )
}
