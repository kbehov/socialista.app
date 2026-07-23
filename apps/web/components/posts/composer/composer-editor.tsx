'use client'

import { uploadPostMedia } from '@/actions/post.actions'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { SocialProvider } from '@socialista/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { CharacterCountRing, ComposerSection } from './composer-section'
import { MediaCarouselManager } from './media-carousel-manager'
import { MediaUploader } from './media-uploader'
import { getStrictestCaptionLimit } from './platform-limits'
import type { ComposerMediaItem } from './composer-types'

type ComposerEditorProps = {
  workspaceId: string
  caption: string
  media: ComposerMediaItem[]
  selectedProviders: SocialProvider[]
  onCaptionChange: (value: string) => void
  onAddMedia: (item: ComposerMediaItem) => void
  onRemoveMedia: (index: number) => void
  onReorderMedia: (from: number, to: number) => void
  onUpdateMediaAltText: (index: number, altText: string) => void
  className?: string
}

export function ComposerEditor({
  workspaceId,
  caption,
  media,
  selectedProviders,
  onCaptionChange,
  onAddMedia,
  onRemoveMedia,
  onReorderMedia,
  onUpdateMediaAltText,
  className,
}: ComposerEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const limit = getStrictestCaptionLimit(selectedProviders)
  const length = caption.length
  const overLimit = length > limit
  const hasMedia = media.length > 0

  const handleFileDrop = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter(
        file => file.type.startsWith('image/') || file.type.startsWith('video/'),
      )
      if (list.length === 0) {
        toast.error('Only images and videos are supported')
        return
      }

      for (const file of list) {
        const formData = new FormData()
        formData.append('file', file)
        const result = await uploadPostMedia(workspaceId, formData)
        if (!result.success || !result.file) {
          toast.error(result.message ?? `Failed to upload ${file.name}`)
          continue
        }
        if (file.type.startsWith('video/')) {
          onAddMedia({ kind: 'video', url: result.file.url })
        } else {
          onAddMedia({ kind: 'image', url: result.file.url })
        }
      }
    },
    [onAddMedia, workspaceId],
  )

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(160, el.scrollHeight)}px`
  }, [caption])

  return (
    <ComposerSection
      title="Content"
      description="Write once — customize per platform later if needed."
      className={cn(isDragging && 'border-foreground/25 ring-foreground/10', className)}
      contentClassName="space-y-0 p-0 sm:p-0"
    >
      <div
        className="relative border-t border-border/40"
        onDragEnter={event => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={event => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={event => {
          event.preventDefault()
          setIsDragging(false)
        }}
        onDrop={event => {
          event.preventDefault()
          setIsDragging(false)
          if (event.dataTransfer.files.length > 0) {
            void handleFileDrop(event.dataTransfer.files)
          }
        }}
      >
        {isDragging ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-b-2xl bg-background/80 backdrop-blur-[2px]">
            <p className="rounded-full border border-border/50 bg-background px-3 py-1.5 text-xs font-medium text-foreground">
              Drop to attach media
            </p>
          </div>
        ) : null}
        <Textarea
          ref={textareaRef}
          value={caption}
          onChange={event => onCaptionChange(event.target.value)}
          placeholder="What's on your mind? Write your caption here…"
          rows={6}
          className={cn(
            'min-h-[10rem] resize-none rounded-none border-0 bg-transparent px-4 py-4 text-[15px] leading-relaxed shadow-none',
            'placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0',
            'sm:px-5 sm:py-5',
            overLimit && 'text-destructive',
          )}
        />

        {hasMedia ? (
          <div className="border-t border-border/40 px-4 py-3 sm:px-5">
            <MediaCarouselManager
              media={media}
              onRemove={onRemoveMedia}
              onReorder={onReorderMedia}
              onUpdateAltText={onUpdateMediaAltText}
            />
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t border-border/40 px-4 py-3 sm:px-5">
          <MediaUploader
            workspaceId={workspaceId}
            onUploaded={onAddMedia}
            compact
          />

          <div className="flex items-center gap-2">
            <CharacterCountRing current={length} max={limit} />
            <span
              className={cn(
                'text-[11px] tabular-nums tracking-tight',
                overLimit
                  ? 'font-medium text-destructive'
                  : length > limit * 0.9
                    ? 'text-amber-600 dark:text-amber-500'
                    : 'text-muted-foreground',
              )}
            >
              {length.toLocaleString()}
              <span className="text-muted-foreground/60"> / {limit.toLocaleString()}</span>
            </span>
          </div>
        </div>
      </div>
    </ComposerSection>
  )
}
