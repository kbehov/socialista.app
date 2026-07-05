'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CheckIcon,
  CropIcon,
  FolderOpenIcon,
  ImageIcon,
  LinkIcon,
  SparklesIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from 'lucide-react'
import { useEditorStore } from '@/lib/carousel/store'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSlideImageEdit } from '@/components/carousel/slide-image-edit-provider'
import { WorkspaceImagePickerDialog } from '@/components/carousel/workspace-image-picker-dialog'
import { ColorPicker } from './primitives/color-picker'

export function SlideBackgroundPanel() {
  const slide = useEditorStore(s => s.slides.find(sl => sl.id === s.activeSlideId) ?? null)
  const canvas = useEditorStore(s => s.canvas)
  const setSlideBackground = useEditorStore(s => s.setSlideBackground)
  const setSlideBackgroundColor = useEditorStore(s => s.setSlideBackgroundColor)
  const clearSlideBackgroundImage = useEditorStore(s => s.clearSlideBackgroundImage)
  const { openEditDialog, openAdjustMode, replaceSlideImage, isEditingSlide } = useSlideImageEdit()

  const [urlVisible, setUrlVisible] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [filesDialogOpen, setFilesDialogOpen] = useState(false)
  const [filesDialogSlideId, setFilesDialogSlideId] = useState<string | null>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  const isFilesDialogOpen = filesDialogOpen && filesDialogSlideId === slide?.id

  const openFilesDialog = () => {
    if (!slide) return
    setFilesDialogSlideId(slide.id)
    setFilesDialogOpen(true)
  }

  const handleFilesDialogOpenChange = (open: boolean) => {
    setFilesDialogOpen(open)
    if (!open) {
      setFilesDialogSlideId(null)
    }
  }

  // Reset the URL input whenever the active slide changes.
  useEffect(() => {
    setUrlVisible(false)
    setUrlValue('')
  }, [slide?.id])

  // Focus the input as soon as the URL form mounts.
  useEffect(() => {
    if (urlVisible) urlInputRef.current?.focus()
  }, [urlVisible])

  if (!slide) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
        Select a slide to edit its background.
      </div>
    )
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSlideBackground(slide.id, URL.createObjectURL(file))
    e.target.value = ''
    setUrlVisible(false)
  }

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

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Background color or photo. Click the image on canvas to pan and zoom.
      </p>

      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium text-muted-foreground">Fill color</Label>
        <ColorPicker
          value={slide.backgroundColor}
          onChange={color => color && setSlideBackgroundColor(slide.id, color)}
          allowNone={false}
          className="w-full"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium text-muted-foreground">Image</Label>

        {slide.backgroundImageUrl ? (
          <div className="space-y-2">
            <div
              className="relative mx-auto w-full max-w-[200px] overflow-hidden rounded-md border bg-muted shadow-xs"
              style={{ aspectRatio: `${canvas.width} / ${canvas.height}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.backgroundImageUrl}
                alt="Slide background"
                className="size-full object-cover"
              />
            </div>

            {urlVisible ? (
              <UrlInputForm
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
                  className="w-full"
                  disabled={isEditingSlide(slide.id)}
                  onClick={() => openEditDialog(slide.id, slide.backgroundImageUrl)}
                >
                  <SparklesIcon className="size-3.5" />
                  Edit with AI
                </Button>
                <div className="grid grid-cols-5 gap-1">
                  <ImageActionButton
                    label="Crop & position"
                    disabled={isEditingSlide(slide.id)}
                    onClick={() => openAdjustMode(slide.id, slide.backgroundImageUrl)}
                  >
                    <CropIcon className="size-3" />
                  </ImageActionButton>
                  <ImageActionButton
                    label="Replace image"
                    disabled={isEditingSlide(slide.id)}
                    onClick={() => replaceSlideImage(slide.id)}
                  >
                    <ImageIcon className="size-3" />
                  </ImageActionButton>
                  <ImageActionButton
                    label="Select from files"
                    disabled={isEditingSlide(slide.id)}
                    onClick={openFilesDialog}
                  >
                    <FolderOpenIcon className="size-3" />
                  </ImageActionButton>
                  <ImageActionButton
                    label="Paste image URL"
                    disabled={isEditingSlide(slide.id)}
                    onClick={() => setUrlVisible(true)}
                  >
                    <LinkIcon className="size-3" />
                  </ImageActionButton>
                  <ImageActionButton
                    label="Remove image"
                    disabled={isEditingSlide(slide.id)}
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
          <div className="flex flex-col gap-1.5">
            <UrlInputForm
              inputRef={urlInputRef}
              value={urlValue}
              onChange={setUrlValue}
              onSubmit={handleUrlSubmit}
              onCancel={cancelUrl}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-input bg-muted/30 px-2 text-xs font-medium transition hover:border-primary/40 hover:bg-muted/50">
              <UploadIcon className="size-3.5" />
              Upload image
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
            <Button size="sm" variant="outline" className="w-full" onClick={openFilesDialog}>
              <FolderOpenIcon className="size-3.5" />
              Select from files
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={() => setUrlVisible(true)}>
              <LinkIcon className="size-3.5" /> Paste image URL
            </Button>
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Solid color shows when no image is set.
            </p>
          </div>
        )}
      </div>

      <WorkspaceImagePickerDialog
        open={isFilesDialogOpen}
        onOpenChange={handleFilesDialogOpenChange}
        onSelect={handleSelectFromFiles}
      />
    </div>
  )
}

type UrlInputFormProps = {
  inputRef: React.RefObject<HTMLInputElement | null>
  value: string
  onChange: (v: string) => void
  onSubmit: (e?: React.FormEvent) => void
  onCancel: () => void
}

function UrlInputForm({ inputRef, value, onChange, onSubmit, onCancel }: UrlInputFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex gap-1">
      <input
        ref={inputRef}
        type="url"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="https://…"
        className="min-w-0 flex-1 rounded-md border border-input bg-background/60 px-2 py-1 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
      />
      <Button size="icon-xs" type="submit" disabled={!value.trim()} aria-label="Apply URL">
        <CheckIcon />
      </Button>
      <Button size="icon-xs" variant="ghost" type="button" onClick={onCancel} aria-label="Cancel">
        <XIcon />
      </Button>
    </form>
  )
}

type ImageActionButtonProps = {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  destructive?: boolean
}

function ImageActionButton({ children, label, onClick, disabled, destructive }: ImageActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon-xs"
          variant="outline"
          className={destructive ? 'text-destructive hover:bg-destructive/10 hover:text-destructive' : undefined}
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}
