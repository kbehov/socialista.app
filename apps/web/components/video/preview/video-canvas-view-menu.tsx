'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useVideoEditorStore } from '@/lib/video/store'
import { MagnetIcon, RulerIcon, ScanIcon, SlidersHorizontalIcon } from 'lucide-react'

export function VideoCanvasViewMenu() {
  const showRulers = useVideoEditorStore(s => s.showRulers)
  const showGuides = useVideoEditorStore(s => s.showGuides)
  const canvasSnapEnabled = useVideoEditorStore(s => s.canvasSnapEnabled)
  const showSafeZones = useVideoEditorStore(s => s.showSafeZones)
  const toggleShowRulers = useVideoEditorStore(s => s.toggleShowRulers)
  const toggleShowGuides = useVideoEditorStore(s => s.toggleShowGuides)
  const toggleCanvasSnapEnabled = useVideoEditorStore(s => s.toggleCanvasSnapEnabled)
  const setShowSafeZones = useVideoEditorStore(s => s.setShowSafeZones)

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="video-studio-press size-7 rounded-full"
              aria-label="Canvas view options"
            >
              <SlidersHorizontalIcon className="size-3.5" strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>View options</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuCheckboxItem
          checked={showRulers}
          onCheckedChange={checked => {
            if (checked !== showRulers) toggleShowRulers()
          }}
        >
          <RulerIcon className="size-3.5" strokeWidth={1.75} />
          Rulers
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showGuides}
          onCheckedChange={checked => {
            if (checked !== showGuides) toggleShowGuides()
          }}
        >
          <ScanIcon className="size-3.5" strokeWidth={1.75} />
          Center guides
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={canvasSnapEnabled}
          onCheckedChange={checked => {
            if (checked !== canvasSnapEnabled) toggleCanvasSnapEnabled()
          }}
        >
          <MagnetIcon className="size-3.5" strokeWidth={1.75} />
          Snap on canvas
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showSafeZones}
          onCheckedChange={checked => setShowSafeZones(checked === true)}
        >
          <ScanIcon className="size-3.5" strokeWidth={1.75} />
          Safe zones
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
