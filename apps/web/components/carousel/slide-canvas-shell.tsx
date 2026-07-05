'use client'

import { useCallback, useEffect, type ReactNode } from 'react'
import type { Slide } from '@socialista/types'
import {
  CropIcon,
  Loader2Icon,
  SparklesIcon,
  Trash2Icon,
  UploadIcon,
} from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
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
  canvasHint?: string | null
}

export function SlideCanvasShell({
  slide,
  interactive,
  className,
  maxWidth,
  forceWidth,
  canvasHint,
}: SlideCanvasShellProps) {
  const setActiveLayer = useEditorStore(s => s.setActiveLayer)
  const {
    isEditingSlide,
    adjustTarget,
    isAdjustingSlide,
    isBackgroundEditSelected,
    selectBackgroundEdit,
    deselectBackgroundEdit,
    openEditDialog,
    openAdjustMode,
    closeAdjustMode,
    replaceSlideImage,
    removeSlideImage,
  } = useSlideImageEdit()

  const isEditing = isEditingSlide(slide.id)
  const isAdjusting = isAdjustingSlide(slide.id)
  const activeAdjust =
    interactive &&
    adjustTarget?.slideId === slide.id &&
    adjustTarget.imageUrl === slide.backgroundImageUrl
      ? adjustTarget
      : null
  const hasBackground = Boolean(slide.backgroundImageUrl)
  const isBackgroundSelected =
    interactive && isBackgroundEditSelected(slide.id) && hasBackground && !isEditing && !isAdjusting

  const clearSelection = useCallback(() => {
    deselectBackgroundEdit()
    setActiveLayer(slide.id, null)
  }, [deselectBackgroundEdit, setActiveLayer, slide.id])

  const handleBackgroundSelect = useCallback(() => {
    if (!interactive || !hasBackground || isEditing || isAdjusting) return
    setActiveLayer(slide.id, null)
    selectBackgroundEdit(slide.id)
  }, [interactive, hasBackground, isEditing, isAdjusting, setActiveLayer, selectBackgroundEdit, slide.id])

  const handleEditImage = useCallback(() => {
    if (!slide.backgroundImageUrl) return
    deselectBackgroundEdit()
    openEditDialog(slide.id, slide.backgroundImageUrl)
  }, [deselectBackgroundEdit, openEditDialog, slide.backgroundImageUrl, slide.id])

  const handleCropAdjust = useCallback(() => {
    if (!slide.backgroundImageUrl) return
    deselectBackgroundEdit()
    openAdjustMode(slide.id, slide.backgroundImageUrl)
  }, [deselectBackgroundEdit, openAdjustMode, slide.backgroundImageUrl, slide.id])

  const handleReplace = useCallback(() => {
    deselectBackgroundEdit()
    replaceSlideImage(slide.id)
  }, [deselectBackgroundEdit, replaceSlideImage, slide.id])

  const handleRemove = useCallback(() => {
    deselectBackgroundEdit()
    removeSlideImage(slide.id)
  }, [deselectBackgroundEdit, removeSlideImage, slide.id])

  useEffect(() => {
    deselectBackgroundEdit()
  }, [slide.backgroundImageUrl, deselectBackgroundEdit])

  const canvas = (
    <div className={cn('relative h-full w-full', className)}>
      <SlideCanvas
        slide={slide}
        interactive={interactive}
        maxWidth={maxWidth}
        forceWidth={forceWidth}
        isBackgroundEditing={isEditing}
        isBackgroundSelected={isBackgroundSelected}
        hideBackgroundImage={Boolean(activeAdjust)}
        onBackgroundSelect={interactive && hasBackground ? handleBackgroundSelect : undefined}
        onClearSelection={interactive ? clearSelection : undefined}
        canvasHint={canvasHint}
        className="h-full"
        backgroundToolbar={
          isBackgroundSelected ? (
            <BackgroundEditToolbar
              onEditImage={handleEditImage}
              onCropAdjust={handleCropAdjust}
              onReplace={handleReplace}
              onRemove={handleRemove}
            />
          ) : null
        }
      />

      {activeAdjust ? (
        <SlideImageAdjustOverlay
          slideId={slide.id}
          imageUrl={activeAdjust.imageUrl}
          onDone={closeAdjustMode}
          onCancel={closeAdjustMode}
        />
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
        <ContextMenuItem disabled={!hasBackground || isEditing || isAdjusting} onSelect={handleCropAdjust}>
          <CropIcon />
          Crop image
        </ContextMenuItem>
        <ContextMenuItem disabled={isEditing || isAdjusting} onSelect={handleReplace}>
          <UploadIcon />
          {hasBackground ? 'Replace image' : 'Upload image'}
        </ContextMenuItem>
        {hasBackground ? (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              variant="destructive"
              disabled={isEditing || isAdjusting}
              onSelect={handleRemove}
            >
              <Trash2Icon />
              Remove image
            </ContextMenuItem>
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  )
}

function BackgroundEditToolbar({
  onEditImage,
  onCropAdjust,
  onReplace,
  onRemove,
}: {
  onEditImage: () => void
  onCropAdjust: () => void
  onReplace: () => void
  onRemove: () => void
}) {
  return (
    <div className="pointer-events-auto flex flex-col gap-0.5 rounded-xl border bg-background/95 p-0.5 shadow-md backdrop-blur-sm">
      <ToolbarIconButton label="AI edit" onClick={onEditImage}>
        <SparklesIcon className="size-3" />
      </ToolbarIconButton>
      <ToolbarIconButton label="Crop" variant="outline" onClick={onCropAdjust}>
        <CropIcon className="size-3" />
      </ToolbarIconButton>
      <ToolbarIconButton label="Replace" variant="outline" onClick={onReplace}>
        <UploadIcon className="size-3" />
      </ToolbarIconButton>
      <ToolbarIconButton label="Remove" variant="ghost" destructive onClick={onRemove}>
        <Trash2Icon className="size-3" />
      </ToolbarIconButton>
    </div>
  )
}

function ToolbarIconButton({
  children,
  label,
  onClick,
  variant = 'default',
  destructive = false,
}: {
  children: ReactNode
  label: string
  onClick: () => void
  variant?: 'default' | 'outline' | 'ghost'
  destructive?: boolean
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon-xs"
          variant={variant}
          className={cn('size-7 rounded-md', destructive && 'text-destructive hover:text-destructive')}
          onClick={onClick}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">{label}</TooltipContent>
    </Tooltip>
  )
}
