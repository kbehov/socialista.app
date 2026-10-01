'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditorStore } from '@/lib/carousel/store'
import { MagnetIcon, RulerIcon, ScanIcon, SlidersHorizontalIcon } from 'lucide-react'

export function CanvasViewMenu() {
  const showRulers = useEditorStore(s => s.showRulers)
  const showGuides = useEditorStore(s => s.showGuides)
  const snapEnabled = useEditorStore(s => s.snapEnabled)
  const toggleShowRulers = useEditorStore(s => s.toggleShowRulers)
  const toggleShowGuides = useEditorStore(s => s.toggleShowGuides)
  const toggleSnapEnabled = useEditorStore(s => s.toggleSnapEnabled)

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="size-7 rounded-full"
              aria-label="Canvas view options"
            >
              <SlidersHorizontalIcon className="size-3.5" strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>View options</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuCheckboxItem
          checked={showRulers}
          onCheckedChange={checked => {
            if (checked !== showRulers) toggleShowRulers()
          }}
        >
          <RulerIcon className="size-3.5" />
          Rulers
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showGuides}
          onCheckedChange={checked => {
            if (checked !== showGuides) toggleShowGuides()
          }}
        >
          <ScanIcon className="size-3.5" />
          Center guides
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={snapEnabled}
          onCheckedChange={checked => {
            if (checked !== snapEnabled) toggleSnapEnabled()
          }}
        >
          <MagnetIcon className="size-3.5" />
          Snap to guides
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
