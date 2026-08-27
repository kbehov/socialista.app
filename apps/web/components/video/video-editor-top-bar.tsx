'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { VideoFormatSelector } from '@/components/video/video-format-selector'
import { VideoShortcutHelpDialog } from '@/components/video/video-shortcut-help-dialog'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { useVideoSave, type SaveStatus } from '@/hooks/video/use-video-save'
import { cn } from '@/lib/utils'
import { useVideoEditorStore } from '@/lib/video/store'
import { openVideoStudioPanel, VIDEO_OPEN_SHORTCUTS_EVENT } from '@/lib/video/editor-events'
import {
  ChevronLeftIcon,
  DownloadIcon,
  HelpCircleIcon,
  ImageIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  SaveIcon,
  SparklesIcon,
  TypeIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

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
            : 'Not saved yet'

  const isDirty = !hasWorkspace || status === 'unsaved' || status === 'error' || status === 'saving'

  return (
    <>
      <span
        className={cn(
          'hidden size-1.5 shrink-0 rounded-full sm:block',
          isDirty ? 'bg-foreground' : 'bg-foreground/25',
        )}
        aria-hidden
        title={statusText}
      />
      <span className="sr-only" aria-live="polite">
        {statusText}
      </span>
    </>
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

  const isNewProject = !projectId || projectId.startsWith('project_')
  const isDirty = status === 'unsaved' || status === 'error'
  const saveVariant = isNewProject ? 'default' : isDirty ? 'outline' : 'ghost'

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

  const commitName = useCallback(
    (value: string) => {
      setProjectName(value.trim() || 'Untitled video')
    },
    [setProjectName],
  )

  return (
    <>
      <div className="video-editor-canvas-bar flex min-w-0 shrink-0 items-center gap-1.5 overflow-x-auto border-b border-border/40 bg-background px-2 py-1.5 sm:gap-2 sm:px-3">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                size="icon-sm"
                variant="ghost"
                className="size-7 shrink-0"
                aria-label="Back to videos"
              >
                <Link href={DASHBOARD_ROUTES.STUDIO.VIDEOS}>
                  <ChevronLeftIcon className="size-3.5" strokeWidth={1.75} />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>All videos</TooltipContent>
          </Tooltip>

          <div className="flex min-w-0 max-w-52 flex-1 items-center gap-1 sm:max-w-64">
            <Input
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              onBlur={e => commitName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') {
                  e.currentTarget.value = projectName
                  e.currentTarget.blur()
                }
              }}
              placeholder="Untitled video"
              className={cn(
                'h-7 min-w-0 w-full border-transparent bg-transparent px-1.5 py-0 text-xs font-medium tracking-tight shadow-none',
                'transition-colors hover:bg-foreground/[0.04] focus-visible:border-input focus-visible:bg-background',
              )}
              aria-label="Video name"
            />
            <SaveStatusIndicator
              status={status}
              lastSavedAt={lastSavedAt}
              hasWorkspace={Boolean(workspaceId)}
            />
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant={saveVariant}
                className="size-7 shrink-0"
                onClick={() => void save()}
                disabled={!canSave}
                aria-label={isNewProject ? 'Save draft' : 'Save'}
              >
                {status === 'saving' ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : (
                  <SaveIcon className="size-3.5" strokeWidth={1.75} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isNewProject ? 'Save draft' : 'Save'} <Kbd className="ml-1">⌘S</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex h-7 items-center gap-1 lg:hidden">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 gap-1 px-2 text-[12px] font-medium"
            onClick={() => openVideoStudioPanel('media')}
            aria-label="Open media panel"
          >
            <ImageIcon className="size-3.5" strokeWidth={1.75} />
            Media
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 gap-1 px-2 text-[12px] font-medium"
            onClick={() => openVideoStudioPanel('text')}
            aria-label="Open text panel"
          >
            <TypeIcon className="size-3.5" strokeWidth={1.75} />
            Text
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <VideoFormatSelector
            showLabel={false}
            className="hidden h-7 w-[min(100%,148px)] shrink-0 justify-end md:flex lg:w-40"
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="hidden size-7 sm:inline-flex"
                onClick={() => setShortcutOpen(true)}
                aria-label="Keyboard shortcuts"
              >
                <HelpCircleIcon className="size-3.5" strokeWidth={1.75} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Shortcuts <Kbd className="ml-1">?</Kbd>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="size-7 shrink-0 md:hidden"
                aria-label="Project menu"
              >
                <MoreHorizontalIcon className="size-3.5" strokeWidth={1.75} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2">
                <VideoFormatSelector showLabel className="w-full" />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => openVideoStudioPanel('script')}>
                <SparklesIcon className="size-3.5" />
                Script writer
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setShortcutOpen(true)}>
                <HelpCircleIcon className="size-3.5" />
                Shortcuts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                data-tour-anchor="export"
                variant={canExport ? 'default' : 'outline'}
                className="h-7 gap-1.5 px-2.5 text-[12px] font-medium"
                onClick={onExport}
                disabled={!canExport}
                aria-label="Export"
              >
                <DownloadIcon className="size-3.5" strokeWidth={1.75} />
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
