'use client'

import { useCallback, useEffect, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import type { BackgroundImageAdjustment, CropAreaPercentages } from '@socialista/types'
import { CheckIcon, CropIcon, XIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT } from '@/lib/carousel/defaults'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'

type SlideImageAdjustOverlayProps = {
  slideId: string
  imageUrl: string
  onDone: () => void
  onCancel: () => void
}

function adjustmentForCrop(existing: BackgroundImageAdjustment): BackgroundImageAdjustment {
  if (existing.type === 'crop') return existing
  return DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT
}

export function SlideImageAdjustOverlay({
  slideId,
  imageUrl,
  onDone,
  onCancel,
}: SlideImageAdjustOverlayProps) {
  const canvas = useEditorStore(s => s.canvas)
  const slide = useEditorStore(s => s.slides.find(item => item.id === slideId))
  const setSlideBackgroundImageAdjustment = useEditorStore(s => s.setSlideBackgroundImageAdjustment)

  const aspect = canvas.width / canvas.height
  const initial = adjustmentForCrop(slide?.backgroundImageAdjustment ?? DEFAULT_BACKGROUND_IMAGE_ADJUSTMENT)

  return (
    <CropAdjustOverlay
      imageUrl={imageUrl}
      aspect={aspect}
      initial={initial}
      onApply={adjustment => {
        setSlideBackgroundImageAdjustment(slideId, adjustment)
        onDone()
      }}
      onCancel={onCancel}
    />
  )
}

type CropAdjustOverlayProps = {
  imageUrl: string
  aspect: number
  initial: BackgroundImageAdjustment
  onApply: (adjustment: BackgroundImageAdjustment) => void
  onCancel: () => void
}

function CropAdjustOverlay({ imageUrl, aspect, initial, onApply, onCancel }: CropAdjustOverlayProps) {
  const initialCrop = initial.type === 'crop' ? initial.crop : { x: 0, y: 0 }
  const initialZoom = initial.type === 'crop' ? initial.zoom : 1
  const initialArea = initial.type === 'crop' ? initial.area : null

  const [crop, setCrop] = useState(initialCrop)
  const [zoom, setZoom] = useState(initialZoom)
  const [croppedArea, setCroppedArea] = useState<CropAreaPercentages | null>(initialArea)

  const handleApply = useCallback(() => {
    if (!croppedArea) return
    onApply({
      type: 'crop',
      crop,
      zoom,
      area: croppedArea,
    })
  }, [crop, croppedArea, onApply, zoom])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
      if (event.key === 'Enter') handleApply()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleApply, onCancel])

  return (
    <div
      className="absolute inset-0 z-40 overflow-hidden bg-black"
      onPointerDown={event => event.stopPropagation()}
    >
      <Cropper
        image={imageUrl}
        crop={crop}
        zoom={zoom}
        aspect={aspect}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropAreaChange={(areaPercentages, _pixels) => {
          setCroppedArea(areaPercentages)
        }}
        onCropComplete={(areaPercentages, _pixels) => {
          setCroppedArea(areaPercentages)
        }}
        classes={{
          containerClassName: '',
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-background/90 to-transparent px-3 pb-6 pt-3">
        <p className="flex items-center justify-center gap-1.5 text-center text-xs font-medium text-foreground">
          <CropIcon className="size-3.5" />
          Drag to reposition · Use the slider to zoom
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 space-y-3 p-4">
        <div className="pointer-events-auto mx-auto flex max-w-xs items-center gap-3 rounded-full border bg-background/95 px-4 py-2 shadow-lg backdrop-blur-sm">
          <ZoomOutIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={event => setZoom(Number(event.target.value))}
            className={cn(
              'h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted',
              '[&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary',
              '[&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary',
            )}
            aria-label="Crop zoom"
          />
          <ZoomInIcon className="size-3.5 shrink-0 text-muted-foreground" />
        </div>

        <div className="flex items-center justify-center">
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border bg-background/95 p-1 shadow-lg backdrop-blur-sm">
            <Button size="sm" variant="ghost" className="h-8 rounded-full px-3" onClick={onCancel}>
              <XIcon className="size-3.5" />
              Cancel
            </Button>
            <Button size="sm" className="h-8 rounded-full px-3.5" onClick={handleApply} disabled={!croppedArea}>
              <CheckIcon className="size-3.5" />
              Apply crop
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
