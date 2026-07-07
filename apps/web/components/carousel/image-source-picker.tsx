'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CheckIcon,
  FolderOpenIcon,
  LinkIcon,
  SearchIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react'
import { WorkspaceImagePickerDialog } from '@/components/carousel/workspace-image-picker-dialog'
import { PinterestImageSearchDialog } from '@/components/carousel/pinterest-image-search-dialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type ImageSourcePickerProps = {
  disabled?: boolean
  hint?: string
  filesDescription?: string
  layout?: 'prominent' | 'compact'
  showUrl?: boolean
  onImageSelected: (url: string) => void
}

export function ImageSourcePicker({
  disabled = false,
  hint,
  filesDescription = 'Choose an image from your workspace files and folders.',
  layout = 'prominent',
  showUrl = true,
  onImageSelected,
}: ImageSourcePickerProps) {
  const [urlVisible, setUrlVisible] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [filesDialogOpen, setFilesDialogOpen] = useState(false)
  const [pinterestDialogOpen, setPinterestDialogOpen] = useState(false)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (urlVisible) urlInputRef.current?.focus()
  }, [urlVisible])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    onImageSelected(URL.createObjectURL(file))
    e.target.value = ''
    setUrlVisible(false)
    setUrlValue('')
  }

  const handleUrlSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = urlValue.trim()
    if (trimmed) onImageSelected(trimmed)
    setUrlVisible(false)
    setUrlValue('')
  }

  const cancelUrl = () => {
    setUrlVisible(false)
    setUrlValue('')
  }

  const handleSelectFromFiles = (imageUrl: string) => {
    onImageSelected(imageUrl)
    setUrlVisible(false)
    setUrlValue('')
  }

  const handleSelectFromPinterest = (imageUrl: string) => {
    onImageSelected(imageUrl)
    setUrlVisible(false)
    setUrlValue('')
  }

  const sourceDialogs = (
    <>
      <WorkspaceImagePickerDialog
        open={filesDialogOpen}
        onOpenChange={setFilesDialogOpen}
        description={filesDescription}
        onSelect={handleSelectFromFiles}
      />
      <PinterestImageSearchDialog
        open={pinterestDialogOpen}
        onOpenChange={setPinterestDialogOpen}
        onSelect={handleSelectFromPinterest}
      />
    </>
  )

  if (urlVisible) {
    return (
      <ImageUrlInput
        inputRef={urlInputRef}
        value={urlValue}
        onChange={setUrlValue}
        onSubmit={handleUrlSubmit}
        onCancel={cancelUrl}
      />
    )
  }

  if (layout === 'compact') {
    return (
      <div className="flex flex-col gap-1.5">
        <div
          className={cn(
            'grid gap-1',
            showUrl ? 'grid-cols-4' : 'grid-cols-3',
          )}
        >
          <ImageActionButton label="Upload image" disabled={disabled} onClick={() => fileInputRef.current?.click()}>
            <UploadIcon className="size-3" />
          </ImageActionButton>
          <ImageActionButton label="Select from files" disabled={disabled} onClick={() => setFilesDialogOpen(true)}>
            <FolderOpenIcon className="size-3" />
          </ImageActionButton>
          <ImageActionButton label="Search Pinterest" disabled={disabled} onClick={() => setPinterestDialogOpen(true)}>
            <SearchIcon className="size-3" />
          </ImageActionButton>
          {showUrl ? (
            <ImageActionButton label="Paste image URL" disabled={disabled} onClick={() => setUrlVisible(true)}>
              <LinkIcon className="size-3" />
            </ImageActionButton>
          ) : null}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        {sourceDialogs}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className={cn(
          'flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-input bg-muted/30 px-2 text-xs font-medium transition',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer hover:border-primary/40 hover:bg-muted/50',
        )}
      >
        <UploadIcon className="size-3.5" />
        Upload image
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={disabled}
          onChange={handleUpload}
        />
      </label>
      <Button size="sm" variant="outline" className="w-full" disabled={disabled} onClick={() => setFilesDialogOpen(true)}>
        <FolderOpenIcon className="size-3.5" />
        Select from files
      </Button>
      <Button size="sm" variant="outline" className="w-full" disabled={disabled} onClick={() => setPinterestDialogOpen(true)}>
        <SearchIcon className="size-3.5" />
        Search images
      </Button>
      {showUrl ? (
        <Button size="sm" variant="outline" className="w-full" disabled={disabled} onClick={() => setUrlVisible(true)}>
          <LinkIcon className="size-3.5" />
          Paste image URL
        </Button>
      ) : null}
      {hint ? <p className="text-[10px] leading-relaxed text-muted-foreground">{hint}</p> : null}
      {sourceDialogs}
    </div>
  )
}

type ImageUrlInputProps = {
  inputRef: React.RefObject<HTMLInputElement | null>
  value: string
  onChange: (value: string) => void
  onSubmit: (e?: React.FormEvent) => void
  onCancel: () => void
}

export function ImageUrlInput({ inputRef, value, onChange, onSubmit, onCancel }: ImageUrlInputProps) {
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

export function ImageActionButton({ children, label, onClick, disabled, destructive }: ImageActionButtonProps) {
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
