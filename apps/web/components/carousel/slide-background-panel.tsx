'use client'

import { ImageActionButton, ImageSourcePicker, ImageUrlInput } from '@/components/carousel/image-source-picker'
import { InspectorImageFilters } from '@/components/carousel/inspector-image-filters'
import { InspectorImagePreview } from '@/components/carousel/inspector-image-preview'
import { useSlideImageEdit } from '@/components/carousel/slide-image-edit-provider'
import { StudioEmptyState } from '@/components/carousel/studio-segmented-tabs'
import { WorkspaceImagePickerDialog } from '@/components/carousel/workspace-image-picker-dialog'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/lib/carousel/store'
import { filtersToCss } from '@/utils/media-filters'
import { cn } from '@/lib/utils'
import type { Slide } from '@socialista/types'
import { CropIcon, FolderOpenIcon, ImageIcon, LinkIcon, SparklesIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ColorPicker } from './primitives/color-picker'

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-medium text-muted-foreground">{children}</p>
}

export function SlideBackgroundPanel({ compact = false }: { compact?: boolean }) {
  const slide = useEditorStore(s => s.slides.find(sl => sl.id === s.activeSlideId) ?? null)
  const setSlideBackgroundColor = useEditorStore(s => s.setSlideBackgroundColor)

  if (!slide) {
    return (
      <StudioEmptyState
        title="No slide selected"
        description="Select a slide on the canvas to edit its background."
      />
    )
  }

  return (
    <div className={cn('flex flex-col', compact ? 'gap-3.5' : 'gap-3')}>
      {!compact ? (
        <p className="text-[11px] leading-[1.45] text-muted-foreground">
          Background color or photo. Click the image on canvas to pan and zoom.
        </p>
      ) : null}

      <div className="space-y-2">
        <FieldLabel>Fill color</FieldLabel>
        <ColorPicker
          value={slide.backgroundColor}
          onChange={color => color && setSlideBackgroundColor(slide.id, color)}
          allowNone={false}
          className="w-full"
        />
      </div>

      <SlideBackgroundImageSection key={slide.id} slide={slide} compact={compact} />
    </div>
  )
}

function SlideBackgroundImageSection({ slide, compact }: { slide: Slide; compact: boolean }) {
  const canvas = useEditorStore(s => s.canvas)
  const setSlideBackground = useEditorStore(s => s.setSlideBackground)
  const clearSlideBackgroundImage = useEditorStore(s => s.clearSlideBackgroundImage)
  const setSlideBackgroundFilter = useEditorStore(s => s.setSlideBackgroundFilter)
  const removeSlideBackgroundFilter = useEditorStore(s => s.removeSlideBackgroundFilter)
  const setSlideBackgroundFilterLive = useEditorStore(s => s.setSlideBackgroundFilterLive)
  const removeSlideBackgroundFilterLive = useEditorStore(s => s.removeSlideBackgroundFilterLive)
  const setSlideBackgroundFilters = useEditorStore(s => s.setSlideBackgroundFilters)
  const { openEditDialog, openAdjustMode, replaceSlideImage, isEditingSlide } = useSlideImageEdit()

  const [urlVisible, setUrlVisible] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [filesDialogOpen, setFilesDialogOpen] = useState(false)
  const urlInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (urlVisible) urlInputRef.current?.focus()
  }, [urlVisible])

  const handleUrlSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = urlValue.trim()
    if (trimmed) setSlideBackground(slide.id, trimmed)
    setUrlVisible(false)
    setUrlValue('')
  }

  const cancelUrl = () => {
    setUrlVisible(false)
    setUrlValue('')
  }

  const handleSelectFromFiles = (imageUrl: string) => {
    setSlideBackground(slide.id, imageUrl)
    setUrlVisible(false)
  }

  const previewFilter = filtersToCss(slide.backgroundImageFilters)
  const editing = isEditingSlide(slide.id)

  return (
    <div className="space-y-2">
      <FieldLabel>Image</FieldLabel>

      {slide.backgroundImageUrl ? (
        <div className="space-y-2.5">
          <InspectorImagePreview
            imageUrl={slide.backgroundImageUrl}
            canvas={canvas}
            alt="Slide background"
            filterCss={previewFilter || undefined}
          />

          <InspectorImageFilters
            filters={slide.backgroundImageFilters}
            previewImageUrl={slide.backgroundImageUrl}
            onChange={filter => setSlideBackgroundFilterLive(slide.id, filter)}
            onCommit={filter => setSlideBackgroundFilter(slide.id, filter)}
            onRemove={type => removeSlideBackgroundFilterLive(slide.id, type)}
            onRemoveCommit={type => removeSlideBackgroundFilter(slide.id, type)}
            onApplyFilters={next => setSlideBackgroundFilters(slide.id, next)}
          />

          {urlVisible ? (
            <ImageUrlInput
              inputRef={urlInputRef}
              value={urlValue}
              onChange={setUrlValue}
              onSubmit={handleUrlSubmit}
              onCancel={cancelUrl}
            />
          ) : (
            <div className="flex flex-col gap-1.5">
              <Button
                size="sm"
                className="h-8 w-full gap-1.5 rounded-lg text-[12px] font-medium tracking-tight"
                disabled={editing}
                onClick={() =>
                  openEditDialog({
                    kind: 'background',
                    slideId: slide.id,
                    imageUrl: slide.backgroundImageUrl,
                  })
                }
              >
                <SparklesIcon className="size-3.5" />
                Edit with AI
              </Button>
              <div className="grid grid-cols-5 gap-1">
                <ImageActionButton
                  label="Crop & position"
                  disabled={editing}
                  onClick={() => openAdjustMode(slide.id, slide.backgroundImageUrl!)}
                >
                  <CropIcon className="size-3" />
                </ImageActionButton>
                <ImageActionButton label="Replace image" disabled={editing} onClick={() => replaceSlideImage(slide.id)}>
                  <ImageIcon className="size-3" />
                </ImageActionButton>
                <ImageActionButton
                  label="Select from files"
                  disabled={editing}
                  onClick={() => setFilesDialogOpen(true)}
                >
                  <FolderOpenIcon className="size-3" />
                </ImageActionButton>
                <ImageActionButton label="Paste image URL" disabled={editing} onClick={() => setUrlVisible(true)}>
                  <LinkIcon className="size-3" />
                </ImageActionButton>
                <ImageActionButton
                  label="Remove image"
                  disabled={editing}
                  destructive
                  onClick={() => clearSlideBackgroundImage(slide.id)}
                >
                  <Trash2Icon className="size-3" />
                </ImageActionButton>
              </div>
            </div>
          )}
        </div>
      ) : urlVisible ? (
        <ImageUrlInput
          inputRef={urlInputRef}
          value={urlValue}
          onChange={setUrlValue}
          onSubmit={handleUrlSubmit}
          onCancel={cancelUrl}
        />
      ) : (
        <ImageSourcePicker
          disabled={editing}
          layout={compact ? 'studio' : 'prominent'}
          hint={compact ? 'Solid fill shows when no image is set.' : 'Solid color shows when no image is set.'}
          onImageSelected={url => setSlideBackground(slide.id, url)}
        />
      )}

      <WorkspaceImagePickerDialog
        open={filesDialogOpen}
        onOpenChange={setFilesDialogOpen}
        onSelect={handleSelectFromFiles}
      />
    </div>
  )
}
