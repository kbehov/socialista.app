'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Slide } from '@socialista/types'
import {
  CropIcon,
  ImageIcon,
  Loader2Icon,
  SparklesIcon,
  Trash2Icon,
  UploadIcon,
  ZoomInIcon,
} from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'
import { useSlideImageEdit } from './slide-image-edit-provider'
import { SlideCanvas } from './slide-canvas'
import { SlideImageAdjustOverlay } from './slide-image-adjust-overlay'

type SlideCanvasShellProps = {
  slide: Slide
  interactive: boolean
  className?: string
  maxWidth?: number
  forceWidth?: number
}

export function SlideCanvasShell({
  slide,
  interactive,
  className,
  maxWidth,
  forceWidth,
}: SlideCanvasShellProps) {
  const setActiveLayer = useEditorStore(s => s.setActiveLayer)
  const {
    isEditingSlide,
    adjustTarget,
    isAdjustingSlide,
    openEditDialog,
    openAdjustMode,
    closeAdjustMode,
    replaceSlideImage,
    removeSlideImage,
  } = useSlideImageEdit()

  const [bgActionsVisible, setBgActionsVisible] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)
  const isEditing = isEditingSlide(slide.id)
  const isAdjusting = isAdjustingSlide(slide.id)
  const activeAdjust =
    interactive &&
    adjustTarget?.slideId === slide.id &&
    adjustTarget.imageUrl === slide.backgroundImageUrl
      ? adjustTarget
      : null
  const hasBackground = Boolean(slide.backgroundImageUrl)

  useEffect(() => {
    if (!bgActionsVisible || isAdjusting || !interactive) return

    const dismiss = (event: PointerEvent) => {
      if (shellRef.current?.contains(event.target as Node)) return
      setBgActionsVisible(false)
    }

    window.addEventListener('pointerdown', dismiss)
    return () => window.removeEventListener('pointerdown', dismiss)
  }, [bgActionsVisible, interactive, isAdjusting])

  const handleBackgroundSelect = useCallback(() => {
    if (!interactive || !hasBackground || isEditing || isAdjusting) return
    setActiveLayer(slide.id, null)
    setBgActionsVisible(true)
  }, [interactive, hasBackground, isEditing, isAdjusting, setActiveLayer, slide.id])

  const handleEditImage = useCallback(() => {
    if (!slide.backgroundImageUrl) return
    setBgActionsVisible(false)
    openEditDialog(slide.id, slide.backgroundImageUrl)
  }, [openEditDialog, slide.backgroundImageUrl, slide.id])

  const handleZoomAdjust = useCallback(() => {
    if (!slide.backgroundImageUrl) return
    setBgActionsVisible(false)
    openAdjustMode(slide.id, slide.backgroundImageUrl, 'zoom')
  }, [openAdjustMode, slide.backgroundImageUrl, slide.id])

  const handleCropAdjust = useCallback(() => {
    if (!slide.backgroundImageUrl) return
    setBgActionsVisible(false)
    openAdjustMode(slide.id, slide.backgroundImageUrl, 'crop')
  }, [openAdjustMode, slide.backgroundImageUrl, slide.id])

  const handleReplace = useCallback(() => {
    setBgActionsVisible(false)
    replaceSlideImage(slide.id)
  }, [replaceSlideImage, slide.id])

  const handleRemove = useCallback(() => {
    setBgActionsVisible(false)
    removeSlideImage(slide.id)
  }, [removeSlideImage, slide.id])

  const canvas = (
    <div ref={shellRef} className={cn('relative h-full min-h-0 max-h-full w-full', className)}>
      <SlideCanvas
        slide={slide}
        interactive={interactive}
        maxWidth={maxWidth}
        forceWidth={forceWidth}
        isBackgroundEditing={isEditing}
        hideBackgroundImage={Boolean(activeAdjust)}
        onBackgroundSelect={interactive && hasBackground ? handleBackgroundSelect : undefined}
        className="h-full"
      />

      {activeAdjust ? (
        <SlideImageAdjustOverlay
          slideId={slide.id}
          imageUrl={activeAdjust.imageUrl}
          mode={activeAdjust.mode}
          onDone={closeAdjustMode}
          onCancel={closeAdjustMode}
        />
      ) : null}

      {bgActionsVisible && hasBackground && interactive && !isEditing && !isAdjusting ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center p-4">
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 rounded-full border bg-background/95 p-1 shadow-lg backdrop-blur-sm">
            <Button size="sm" className="h-8 rounded-full px-3.5" onClick={handleEditImage}>
              <SparklesIcon className="size-3.5" />
              Edit image
            </Button>
            <Button size="sm" variant="outline" className="h-8 rounded-full px-3" onClick={handleZoomAdjust}>
              <ZoomInIcon className="size-3.5" />
              Zoom
            </Button>
            <Button size="sm" variant="outline" className="h-8 rounded-full px-3" onClick={handleCropAdjust}>
              <CropIcon className="size-3.5" />
              Crop
            </Button>
            <Button size="sm" variant="outline" className="h-8 rounded-full px-3" onClick={handleReplace}>
              <UploadIcon className="size-3.5" />
              Replace
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              className="size-8 rounded-full text-destructive hover:text-destructive"
              onClick={handleRemove}
              aria-label="Remove background"
            >
              <Trash2Icon className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : null}

      {isEditing ? (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-background/35 backdrop-blur-[2px]">
          <Loader2Icon className="size-8 animate-spin text-primary" />
          <p className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
            Editing image…
          </p>
        </div>
      ) : null}
    </div>
  )

  if (!interactive) return canvas

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{canvas}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem disabled={!hasBackground || isEditing || isAdjusting} onSelect={handleEditImage}>
          <SparklesIcon />
          Edit with AI
        </ContextMenuItem>
        <ContextMenuItem disabled={!hasBackground || isEditing || isAdjusting} onSelect={handleZoomAdjust}>
          <ZoomInIcon />
          Zoom &amp; pan
        </ContextMenuItem>
        <ContextMenuItem disabled={!hasBackground || isEditing || isAdjusting} onSelect={handleCropAdjust}>
          <CropIcon />
          Crop image
        </ContextMenuItem>
        <ContextMenuItem disabled={isEditing || isAdjusting} onSelect={handleReplace}>
          <UploadIcon />
          {hasBackground ? 'Replace image' : 'Upload image'}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          variant="destructive"
          disabled={!hasBackground || isEditing || isAdjusting}
          onSelect={handleRemove}
        >
          <Trash2Icon />
          Remove image
        </ContextMenuItem>
        {!hasBackground ? (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem disabled className="text-muted-foreground">
              <ImageIcon />
              No background image
            </ContextMenuItem>
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  )
}
