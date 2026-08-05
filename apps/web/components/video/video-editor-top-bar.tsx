'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { VideoFormatSelector } from '@/components/video/video-format-selector'
import { VideoShortcutHelpDialog } from '@/components/video/video-shortcut-help-dialog'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useVideoSave, type SaveStatus } from '@/hooks/video/use-video-save'
import { cn } from '@/lib/utils'
import { useVideoEditorStore } from '@/lib/video/store'
import {
  ChevronLeftIcon,
  DownloadIcon,
  HelpCircleIcon,
  Loader2Icon,
  SaveIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { VIDEO_OPEN_SHORTCUTS_EVENT } from '@/lib/video/editor-events'

function formatSavedAt(timestamp: number | null): string | null {
  if (!timestamp) return null
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(timestamp))
  } catch {
    return null
  }
}

function SaveStatusIndicator({
  status,
  lastSavedAt,
  hasWorkspace,
}: {
  status: SaveStatus
  lastSavedAt: number | null
  hasWorkspace: boolean
}) {
  const savedLabel = formatSavedAt(lastSavedAt)

  const statusText = !hasWorkspace
    ? 'Select a workspace to save'
    : status === 'saving'
      ? 'Saving…'
      : status === 'unsaved' || status === 'error'
        ? status === 'error'
          ? 'Save failed'
          : 'Unsaved changes'
        : savedLabel
          ? `Saved ${savedLabel}`
          : status === 'saved'
            ? 'Saved'
            : null

  if (!statusText) return null

  return (
    <span
      className={cn(
        'hidden truncate text-[10px] leading-none sm:inline',
        'text-muted-foreground',
      )}
      aria-live="polite"
    >
      {statusText}
    </span>
  )
}

type VideoEditorTopBarProps = {
  onExport: () => void
  canExport: boolean
}

export function VideoEditorTopBar({ onExport, canExport }: VideoEditorTopBarProps) {
  const projectName = useVideoEditorStore(s => s.project.name)
  const projectId = useVideoEditorStore(s => s.project.id)
  const setProjectName = useVideoEditorStore(s => s.setProjectName)
  const { save, status, canSave, lastSavedAt, workspaceId } = useVideoSave()
  const [shortcutOpen, setShortcutOpen] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(projectName)

  const isNewProject = !projectId || projectId.startsWith('project_')
  const isDirty = status === 'unsaved' || status === 'error'

  const commitName = useCallback(() => {
    const next = nameDraft.trim() || 'Untitled video'
    setProjectName(next)
    setEditingName(false)
  }, [nameDraft, setProjectName])

  const startEditingName = useCallback(() => {
    setNameDraft(projectName)
    setEditingName(true)
  }, [projectName])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isEditable =
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void save()
        return
      }

      if (!isEditable && e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setShortcutOpen(true)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [save])

  useEffect(() => {
    const openHelp = () => setShortcutOpen(true)
    window.addEventListener(VIDEO_OPEN_SHORTCUTS_EVENT, openHelp)
    return () => window.removeEventListener(VIDEO_OPEN_SHORTCUTS_EVENT, openHelp)
  }, [])

  return (
    <>
      <div className="video-editor-canvas-bar flex min-w-0 shrink-0 items-center gap-1.5 overflow-x-auto border-b border-border/40 bg-background px-2 py-1.5 sm:gap-2 sm:px-3">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                size="icon-sm"
                variant="ghost"
                className="video-studio-press size-7 shrink-0"
              >
                <Link href={DASHBOARD_ROUTES.STUDIO.VIDEOS} aria-label="Back to videos">
                  <ChevronLeftIcon className="size-3.5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>All videos</TooltipContent>
          </Tooltip>

          <div className="min-w-0 flex-1">
            {editingName ? (
              <Input
                value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitName()
                  if (e.key === 'Escape') {
                    setNameDraft(projectName)
                    setEditingName(false)
                  }
                }}
                autoFocus
                className="h-7 max-w-[220px] border-transparent bg-muted/40 px-2 text-xs font-medium shadow-none focus-visible:border-input focus-visible:bg-background"
                aria-label="Video name"
              />
            ) : (
              <button
                type="button"
                onClick={startEditingName}
                className="video-studio-press max-w-[220px] truncate rounded-md px-2 py-1 text-left text-xs font-medium hover:bg-muted/40"
                title="Rename project"
              >
                {projectName || 'Untitled video'}
              </button>
            )}
          </div>

          <SaveStatusIndicator
            status={status}
            lastSavedAt={lastSavedAt}
            hasWorkspace={Boolean(workspaceId)}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant={!isNewProject && !isDirty ? 'outline' : 'default'}
                className="video-studio-press hidden h-7 px-2 sm:inline-flex"
                onClick={() => void save()}
                disabled={!canSave}
                aria-label={isNewProject ? 'Save draft' : 'Save'}
              >
                {status === 'saving' ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : (
                  <SaveIcon className="size-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isNewProject ? 'Save draft' : 'Save'} <Kbd className="ml-1">⌘S</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <VideoFormatSelector
            showLabel={false}
            className="hidden w-[min(100%,150px)] shrink-0 md:flex lg:w-[170px]"
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="video-studio-press size-7"
                onClick={() => setShortcutOpen(true)}
                aria-label="Keyboard shortcuts"
              >
                <HelpCircleIcon className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Shortcuts <Kbd className="ml-1">?</Kbd>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                data-tour-anchor="export"
                className={cn(
                  'video-studio-press h-7 gap-1.5 px-2.5 text-[11px]',
                  canExport && 'bg-primary hover:bg-primary/90',
                )}
                onClick={onExport}
                disabled={!canExport}
              >
                <DownloadIcon className="size-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </TooltipTrigger>
            {!canExport ? (
              <TooltipContent>Add media before exporting</TooltipContent>
            ) : (
              <TooltipContent>Download MP4</TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>

      <VideoShortcutHelpDialog open={shortcutOpen} onOpenChange={setShortcutOpen} />
    </>
  )
}
