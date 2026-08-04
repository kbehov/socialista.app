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
import { UnsplashImageSearchDialog } from '@/components/carousel/unsplash-image-search-dialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type ImageSourcePickerProps = {
  disabled?: boolean
  hint?: string
  filesDescription?: string
  layout?: 'prominent' | 'compact' | 'studio'
  showUrl?: boolean
  onImageSelected: (url: string) => void
}

const STUDIO_SOURCES = [
  {
    id: 'upload',
    label: 'Upload',
    description: 'From your device',
    icon: UploadIcon,
  },
  {
    id: 'files',
    label: 'Files',
    description: 'Workspace library',
    icon: FolderOpenIcon,
  },
  {
    id: 'unsplash',
    label: 'Unsplash',
    description: 'Stock photos',
    icon: SearchIcon,
  },
  {
    id: 'url',
    label: 'URL',
    description: 'Paste a link',
    icon: LinkIcon,
  },
] as const

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
  const [unsplashDialogOpen, setUnsplashDialogOpen] = useState(false)
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

  const handleSelectFromUnsplash = (imageUrl: string) => {
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
      <UnsplashImageSearchDialog
        open={unsplashDialogOpen}
        onOpenChange={setUnsplashDialogOpen}
        onSelect={handleSelectFromUnsplash}
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
        <div className={cn('grid gap-1', showUrl ? 'grid-cols-4' : 'grid-cols-3')}>
          <ImageActionButton label="Upload image" disabled={disabled} onClick={() => fileInputRef.current?.click()}>
            <UploadIcon className="size-3" />
          </ImageActionButton>
          <ImageActionButton label="Select from files" disabled={disabled} onClick={() => setFilesDialogOpen(true)}>
            <FolderOpenIcon className="size-3" />
          </ImageActionButton>
          <ImageActionButton label="Search images" disabled={disabled} onClick={() => setUnsplashDialogOpen(true)}>
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

  if (layout === 'studio') {
    const sources = showUrl ? STUDIO_SOURCES : STUDIO_SOURCES.filter(source => source.id !== 'url')

    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-1.5">
          {sources.map(source => {
            const Icon = source.icon
            const onClick =
              source.id === 'upload'
                ? () => fileInputRef.current?.click()
                : source.id === 'files'
                  ? () => setFilesDialogOpen(true)
                  : source.id === 'unsplash'
                    ? () => setUnsplashDialogOpen(true)
                    : () => setUrlVisible(true)

            return (
              <button
                key={source.id}
                type="button"
                disabled={disabled}
                onClick={onClick}
                className={cn(
                  'group flex w-full items-center gap-2.5 rounded-xl border border-border/40 bg-muted/10 px-3 py-2.5 text-left',
                  'transition-[background-color,border-color,box-shadow,transform] duration-150',
                  'hover:border-border/70 hover:bg-muted/30 hover:shadow-xs active:scale-[0.99]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  'disabled:pointer-events-none disabled:opacity-50',
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background shadow-xs ring-1 ring-border/40 transition-colors group-hover:ring-border/70">
                  <Icon className="size-3.5 text-foreground/75" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-medium tracking-tight text-foreground">{source.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-[1.35] text-muted-foreground">
                    {source.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" disabled={disabled} onChange={handleUpload} />
        {hint ? <p className="text-[10px] leading-[1.45] tracking-[0.01em] text-muted-foreground/80">{hint}</p> : null}
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
      <Button size="sm" variant="outline" className="w-full" disabled={disabled} onClick={() => setUnsplashDialogOpen(true)}>
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
