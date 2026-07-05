'use client'

import { useEffect, useState } from 'react'
import { useVideoEditorStore } from '@/lib/video/store'
import { FilmIcon, SettingsIcon, TypeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ClipProperties } from './clip-properties'
import { OverlayProperties } from './overlay-properties'
import { ProjectProperties } from './project-properties'

type InspectorTab = 'clip' | 'overlay' | 'project'

const TABS: { id: InspectorTab; label: string; icon: typeof TypeIcon }[] = [
  { id: 'clip', label: 'Clip', icon: FilmIcon },
  { id: 'overlay', label: 'Text', icon: TypeIcon },
  { id: 'project', label: 'Project', icon: SettingsIcon },
]

function EmptyTabState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof TypeIcon
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center">
      <Icon className="mx-auto size-6 text-muted-foreground" />
      <p className="mt-2 text-sm font-medium">{title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

export function PropertiesPanel() {
  const selectedClipId = useVideoEditorStore(s => s.selectedClipId)
  const selectedOverlayId = useVideoEditorStore(s => s.selectedOverlayId)
  const [tab, setTab] = useState<InspectorTab>('project')

  useEffect(() => {
    if (selectedClipId) setTab('clip')
    else if (selectedOverlayId) setTab('overlay')
  }, [selectedClipId, selectedOverlayId])

  useEffect(() => {
    if (!selectedClipId && tab === 'clip') setTab('project')
    if (!selectedOverlayId && tab === 'overlay') setTab('project')
  }, [selectedClipId, selectedOverlayId, tab])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b bg-muted/15 px-2.5 py-2">
        <div className="flex gap-0.5 rounded-lg border border-border/50 bg-muted/40 p-0.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setTab(id)}
              className={cn(
                'h-7 flex-1 gap-1.5 rounded-md px-2 text-xs font-medium',
                tab === id
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
              )}
              aria-pressed={tab === id}
            >
              <Icon className="size-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </Button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto sidebar-scrollbar">
        <div className="flex flex-col gap-3 p-3">
          {tab === 'clip' && selectedClipId ? (
            <ClipProperties key={selectedClipId} clipId={selectedClipId} />
          ) : tab === 'clip' ? (
            <EmptyTabState
              icon={FilmIcon}
              title="No clip selected"
              description="Click a clip on the timeline to edit volume, speed, filters, and transitions."
            />
          ) : null}

          {tab === 'overlay' && selectedOverlayId ? (
            <OverlayProperties overlayId={selectedOverlayId} />
          ) : tab === 'overlay' ? (
            <EmptyTabState
              icon={TypeIcon}
              title="No text overlay selected"
              description="Click Add text in the toolbar, or select an overlay on the timeline or preview."
            />
          ) : null}

          {tab === 'project' ? <ProjectProperties /> : null}
        </div>
      </div>
    </div>
  )
}
