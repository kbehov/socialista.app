'use client'

import { useEffect, useRef, useState } from 'react'
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
  action,
}: {
  icon: typeof TypeIcon
  title: string
  description: string
  action?: { label: string; onClick: () => void; icon?: typeof TypeIcon }
}) {
  const ActionIcon = action?.icon
  return (
    <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center">
      <Icon className="mx-auto size-6 text-muted-foreground" />
      <p className="mt-2 text-sm font-medium">{title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
      {action ? (
        <Button type="button" size="sm" className="mt-4 h-8 gap-1.5" onClick={action.onClick}>
          {ActionIcon ? <ActionIcon className="size-3.5" /> : null}
          {action.label}
        </Button>
      ) : null}
    </div>
  )
}

export function PropertiesPanel({ embedded = false }: { embedded?: boolean }) {
  const selectedClipId = useVideoEditorStore(s => s.selectedClipId)
  const selectedOverlayId = useVideoEditorStore(s => s.selectedOverlayId)
  const playhead = useVideoEditorStore(s => s.playhead)
  const duration = useVideoEditorStore(s => s.project.duration)
  const addTextOverlay = useVideoEditorStore(s => s.addTextOverlay)
  const [activeTab, setActiveTab] = useState<InspectorTab>('project')
  const prevSelectedClipId = useRef<string | null>(null)
  const prevSelectedOverlayId = useRef<string | null>(null)

  useEffect(() => {
    if (selectedClipId !== prevSelectedClipId.current) {
      prevSelectedClipId.current = selectedClipId
      if (selectedClipId) setActiveTab('clip')
    }
  }, [selectedClipId])

  useEffect(() => {
    if (selectedOverlayId !== prevSelectedOverlayId.current) {
      prevSelectedOverlayId.current = selectedOverlayId
      if (selectedOverlayId) setActiveTab('overlay')
    }
  }, [selectedOverlayId])

  const handleAddText = () => {
    const end = Math.min(duration > 0 ? duration : playhead + 3, playhead + 3)
    addTextOverlay(playhead, Math.max(playhead + 0.5, end))
    setActiveTab('overlay')
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {!embedded ? (
        <div className="shrink-0 border-b bg-background px-2.5 py-2">
          <div className="flex gap-0.5 rounded-lg border border-border/50 bg-background p-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setActiveTab(id)}
                className={cn(
                  'h-7 flex-1 gap-1.5 rounded-md px-2 text-xs font-medium',
                  activeTab === id
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
                )}
                aria-pressed={activeTab === id}
              >
                <Icon className="size-3.5 shrink-0" />
                <span className="truncate">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="shrink-0 space-y-2 border-b bg-background px-3 py-2.5">
          <div>
            <p className="text-xs font-semibold tracking-tight">Edit</p>
            <p className="text-[11px] text-muted-foreground">Clip, text, and project settings</p>
          </div>
          <div className="flex gap-0.5 rounded-md border border-border/50 bg-background p-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setActiveTab(id)}
                className={cn(
                  'h-7 flex-1 gap-1 rounded-sm px-1.5 text-[11px] font-medium',
                  activeTab === id
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
                )}
                aria-pressed={activeTab === id}
              >
                <Icon className="size-3 shrink-0" />
                <span className="truncate">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto sidebar-scrollbar">
        <div className="flex flex-col gap-3 p-3">
          {activeTab === 'clip' && selectedClipId ? (
            <ClipProperties key={selectedClipId} clipId={selectedClipId} />
          ) : activeTab === 'clip' ? (
            <EmptyTabState
              icon={FilmIcon}
              title="No clip selected"
              description="Click a clip on the timeline to edit volume, speed, filters, and transitions."
            />
          ) : null}

          {activeTab === 'overlay' && selectedOverlayId ? (
            <OverlayProperties overlayId={selectedOverlayId} />
          ) : activeTab === 'overlay' ? (
            <EmptyTabState
              icon={TypeIcon}
              title="No text overlay selected"
              description="Add a text layer at the playhead, or select one on the timeline or preview."
              action={{ label: 'Add text', onClick: handleAddText, icon: TypeIcon }}
            />
          ) : null}

          {activeTab === 'project' ? <ProjectProperties /> : null}
        </div>
      </div>
    </div>
  )
}
