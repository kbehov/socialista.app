'use client'

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  ImageIcon,
  SparklesIcon,
  Trash2Icon,
} from 'lucide-react'
import { useEditorStore } from '@/lib/carousel/store'
import { useSlideImageEdit } from '@/components/carousel/slide-image-edit-provider'
import { ImageSourcePicker } from '@/components/carousel/image-source-picker'
import { InspectorImageFilters } from '@/components/carousel/inspector-image-filters'
import { InspectorImagePreview } from '@/components/carousel/inspector-image-preview'
import { filtersToCss } from '@/lib/media-filters'
import { useActiveLayer } from '@/hooks/carousel/use-active-layer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ImageLayerObjectFit } from '@socialista/types'

export function ImageLayerToolbar() {
  const { slide, layer } = useActiveLayer()
  const canvas = useEditorStore(s => s.canvas)
  const addImageLayer = useEditorStore(s => s.addImageLayer)
  const updateLayer = useEditorStore(s => s.updateLayer)
  const duplicateLayer = useEditorStore(s => s.duplicateLayer)
  const removeLayer = useEditorStore(s => s.removeLayer)
  const bringForward = useEditorStore(s => s.bringForward)
  const sendBackward = useEditorStore(s => s.sendBackward)
  const promoteImageLayerToBackground = useEditorStore(s => s.promoteImageLayerToBackground)
  const setImageLayerFilter = useEditorStore(s => s.setImageLayerFilter)
  const removeImageLayerFilter = useEditorStore(s => s.removeImageLayerFilter)
  const setImageLayerFilterLive = useEditorStore(s => s.setImageLayerFilterLive)
  const removeImageLayerFilterLive = useEditorStore(s => s.removeImageLayerFilterLive)
  const { openEditDialog, isEditingSlide } = useSlideImageEdit()

  if (!slide) {
    return (
      <div className="rounded-lg border border-dashed border-border/50 bg-muted/10 px-3 py-6 text-center text-xs text-muted-foreground">
        Select a slide to add an image layer.
      </div>
    )
  }

  const editing = isEditingSlide(slide.id)

  if (!layer || layer.type !== 'image') {
    return (
      <div className="flex flex-col gap-2.5">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Add an image layer on top of text and other elements.
        </p>
        <ImageSourcePicker
          disabled={editing}
          hint="Upload, pick from workspace files, or paste a URL."
          onImageSelected={url => addImageLayer(slide.id, url)}
        />
      </div>
    )
  }

  const imageLayer = layer
  const editTarget = {
    kind: 'layer' as const,
    slideId: slide.id,
    layerId: imageLayer.id,
    imageUrl: imageLayer.imageUrl,
  }
  const previewFilter = filtersToCss(imageLayer.filters)

  const setImageUrl = (url: string) => updateLayer(slide.id, imageLayer.id, { imageUrl: url })

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Drag to move, use corner handles to resize, and the top handle to rotate.
      </p>

      {imageLayer.imageUrl ? (
        <InspectorImagePreview
          imageUrl={imageLayer.imageUrl}
          canvas={canvas}
          alt="Image layer"
          filterCss={previewFilter || undefined}
          objectFit={imageLayer.objectFit}
          opacity={imageLayer.opacity}
          rotation={imageLayer.rotation}
        />
      ) : (
        <InspectorImagePreview imageUrl={null} canvas={canvas} alt="Image layer" />
      )}

      {!imageLayer.imageUrl ? (
        <ImageSourcePicker
          disabled={editing}
          onImageSelected={setImageUrl}
        />
      ) : (
        <>
          <InspectorImageFilters
            filters={imageLayer.filters}
            onChange={filter => setImageLayerFilterLive(slide.id, imageLayer.id, filter)}
            onCommit={filter => setImageLayerFilter(slide.id, imageLayer.id, filter)}
            onRemove={type => removeImageLayerFilterLive(slide.id, imageLayer.id, type)}
            onRemoveCommit={type => removeImageLayerFilter(slide.id, imageLayer.id, type)}
          />

          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-muted-foreground">Opacity</Label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(imageLayer.opacity * 100)}
              onChange={e =>
                updateLayer(slide.id, imageLayer.id, { opacity: Number(e.target.value) / 100 })
              }
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-[11px] font-medium text-muted-foreground">Rotation</Label>
              <span className="text-[11px] tabular-nums text-muted-foreground">{imageLayer.rotation}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={359}
              value={((imageLayer.rotation % 360) + 360) % 360}
              onChange={e => updateLayer(slide.id, imageLayer.id, { rotation: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium text-muted-foreground">Fit</Label>
            <div className="flex gap-1">
              {(['contain', 'cover'] as ImageLayerObjectFit[]).map(fit => (
                <Button
                  key={fit}
                  type="button"
                  size="sm"
                  variant={imageLayer.objectFit === fit ? 'secondary' : 'outline'}
                  className="h-7 flex-1 text-xs capitalize"
                  onClick={() => updateLayer(slide.id, imageLayer.id, { objectFit: fit })}
                >
                  {fit}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Button
              size="sm"
              className="w-full"
              disabled={editing}
              onClick={() => openEditDialog(editTarget)}
            >
              <SparklesIcon className="size-3.5" />
              Edit with AI
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              disabled={editing}
              onClick={() => promoteImageLayerToBackground(slide.id, imageLayer.id)}
            >
              <ImageIcon className="size-3.5" />
              Set as background
            </Button>
            <ImageSourcePicker
              disabled={editing}
              layout="compact"
              onImageSelected={setImageUrl}
            />
            <div className="grid grid-cols-4 gap-1">
              <Button size="icon-sm" variant="outline" onClick={() => bringForward(slide.id, imageLayer.id)}>
                <ArrowUpIcon className="size-3.5" />
              </Button>
              <Button size="icon-sm" variant="outline" onClick={() => sendBackward(slide.id, imageLayer.id)}>
                <ArrowDownIcon className="size-3.5" />
              </Button>
              <Button size="icon-sm" variant="outline" onClick={() => duplicateLayer(slide.id, imageLayer.id)}>
                <CopyIcon className="size-3.5" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                className={cn('text-destructive hover:bg-destructive/10')}
                onClick={() => removeLayer(slide.id, imageLayer.id)}
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
