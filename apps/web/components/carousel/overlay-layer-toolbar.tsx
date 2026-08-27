'use client'

import { ArrowDownIcon, ArrowUpIcon, CopyIcon, Maximize2Icon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useEditorStore } from '@/lib/carousel/store'
import { useActiveLayer } from '@/hooks/carousel/use-active-layer'
import { overlayFillColor } from '@/lib/carousel/overlay-style'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ColorPicker } from './primitives/color-picker'

const OVERLAY_PRESETS = [
  { label: 'Dark 40%', color: '#000000', opacity: 0.4 },
  { label: 'Dark 60%', color: '#000000', opacity: 0.6 },
  { label: 'Light 25%', color: '#ffffff', opacity: 0.25 },
] as const

export function OverlayLayerToolbar() {
  const { slide, layer } = useActiveLayer()
  const addOverlayLayer = useEditorStore(s => s.addOverlayLayer)
  const updateLayer = useEditorStore(s => s.updateLayer)
  const duplicateLayer = useEditorStore(s => s.duplicateLayer)
  const removeLayer = useEditorStore(s => s.removeLayer)
  const bringForward = useEditorStore(s => s.bringForward)
  const sendBackward = useEditorStore(s => s.sendBackward)

  if (!slide) {
    return (
      <div className="px-0.5 py-5 text-[12px] text-muted-foreground">
        Select a slide to edit overlays.
      </div>
    )
  }

  if (!layer || layer.type !== 'overlay') {
    return (
      <div className="flex flex-col gap-3 px-0.5 py-5">
        <p className="text-[12px] text-muted-foreground">
          Select an overlay on the canvas, or add one below.
        </p>
        <Button size="sm" variant="outline" className="w-fit" onClick={() => addOverlayLayer(slide.id)}>
          <PlusIcon className="size-3.5" />
          Add overlay
        </Button>
      </div>
    )
  }

  const overlay = layer
  const previewColor = overlayFillColor(overlay.color, overlay.opacity)

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">Overlay</span>
        <div className="flex gap-1">
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => bringForward(slide.id, overlay.id)}
            aria-label="Bring forward"
          >
            <ArrowUpIcon />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => sendBackward(slide.id, overlay.id)}
            aria-label="Send backward"
          >
            <ArrowDownIcon />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => duplicateLayer(slide.id, overlay.id)}
            aria-label="Duplicate layer"
          >
            <CopyIcon />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => removeLayer(slide.id, overlay.id)}
            aria-label="Delete layer"
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>

      <p className="text-[12px] leading-relaxed text-muted-foreground">
        Drag to move, resize with handles, or cover the full slide.
      </p>

      <div
        className="h-12 w-full rounded-md ring-1 ring-border/50"
        style={{ backgroundColor: previewColor }}
      />

      <div className="flex flex-wrap gap-1">
        {OVERLAY_PRESETS.map(preset => (
          <Button
            key={preset.label}
            type="button"
            size="sm"
            variant="outline"
            className="h-7 flex-1 text-[11px]"
            onClick={() =>
              updateLayer(slide.id, overlay.id, { color: preset.color, opacity: preset.opacity })
            }
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium text-muted-foreground">Color</Label>
        <ColorPicker
          value={overlay.color}
          onChange={color => color && updateLayer(slide.id, overlay.id, { color })}
          allowNone={false}
          className="w-full"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-[11px] font-medium text-muted-foreground">Opacity</Label>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {Math.round(overlay.opacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(overlay.opacity * 100)}
          onChange={e =>
            updateLayer(slide.id, overlay.id, { opacity: Number(e.target.value) / 100 })
          }
          className="w-full accent-primary"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-[11px] font-medium text-muted-foreground">Corner radius</Label>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {overlay.borderRadius ?? 0}px
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={120}
          value={overlay.borderRadius ?? 0}
          onChange={e => updateLayer(slide.id, overlay.id, { borderRadius: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>

      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={() =>
          updateLayer(slide.id, overlay.id, { x: 0, y: 0, width: 100, height: 100, rotation: 0 })
        }
      >
        <Maximize2Icon className="size-3.5" />
        Cover full slide
      </Button>
    </div>
  )
}

/** @deprecated Use OverlayLayerToolbar — kept for any lingering imports. */
export function SlideOverlaySection() {
  return <OverlayLayerToolbar />
}
