'use client'

import { EmojiPicker, EmojiPickerIconButton } from '@/components/ui/emoji-picker'
import { Textarea } from '@/components/ui/textarea'
import { CaptionLengthIndicator } from '@/components/posts/composer/caption-length-indicator'
import { insertTextAtCursor } from '@/lib/insert-text-at-cursor'
import { cn } from '@/lib/utils'
import type { ComposerLayout, ComposerMediaItem } from '@/types/composer-types'
import { uploadComposerMediaFiles } from '@/utils/composer-media.utils'
import { getStrictestCaptionLimit } from '@/constants/platform-limits'
import type { SocialProvider } from '@socialista/types'
import { ImagePlusIcon, StickyNoteIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react'

import { ComposerSection } from './composer-section'
import { MediaCarouselManager } from './media-carousel-manager'
import { MediaUploader } from './media-uploader'
import { PostCopywriterDialog } from './post-copywriter'

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
  layout?: ComposerLayout
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
  layout = 'default',
}: ComposerEditorProps) {
  const isSheet = layout === 'sheet'
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [copywriterOpen, setCopywriterOpen] = useState(false)
  const limit = getStrictestCaptionLimit(selectedProviders)
  const length = caption.length
  const overLimit = length > limit
  const hasMedia = media.length > 0

  const handleApplyGeneratedCaption = useCallback(
    (generated: string, mode: 'replace' | 'append') => {
      if (mode === 'append' && caption.trim()) {
        onCaptionChange(`${caption.trim()}\n\n${generated}`)
      } else {
        onCaptionChange(generated)
      }
    },
    [caption, onCaptionChange],
  )

  const insertEmoji = useCallback(
    (emoji: string) => {
      const el = textareaRef.current
      if (!el) {
        onCaptionChange(caption ? `${caption}${emoji}` : emoji)
        return
      }
      onCaptionChange(insertTextAtCursor(el, emoji, caption))
    },
    [caption, onCaptionChange],
  )

  const handleFileDrop = useCallback(
    async (files: FileList | File[]) => {
      await uploadComposerMediaFiles(workspaceId, files, onAddMedia)
    },
    [onAddMedia, workspaceId],
  )

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(isSheet ? 120 : 168, el.scrollHeight)}px`
  }, [caption, isSheet])

  const setDragging = (event: DragEvent, value: boolean) => {
    event.preventDefault()
    setIsDragging(value)
  }

  return (
    <ComposerSection
      title="Content"
      icon={<StickyNoteIcon className="size-3.5" strokeWidth={1.75} />}
      description="Write once — customize per platform below if needed."
      variant="focus"
      className={cn(isDragging && 'border-foreground/20 ring-1 ring-foreground/10', className)}
      contentClassName="space-y-0 p-0 sm:p-0"
      compact={isSheet}
    >
      <div
        className="relative border-t border-border/40"
        onDragEnter={event => setDragging(event, true)}
        onDragOver={event => setDragging(event, true)}
        onDragLeave={event => setDragging(event, false)}
        onDrop={event => {
          event.preventDefault()
          setIsDragging(false)
          if (event.dataTransfer.files.length > 0) {
            void handleFileDrop(event.dataTransfer.files)
          }
        }}
      >
        {isDragging ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-b-xl bg-background/85 backdrop-blur-[3px]">
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-background px-5 py-4 shadow-xs">
              <span className="flex size-9 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                <ImagePlusIcon className="size-4" strokeWidth={1.75} />
              </span>
              <p className="text-xs font-medium text-foreground">Drop to attach</p>
              <p className="text-[10px] text-muted-foreground">Images or videos</p>
            </div>
          </div>
        ) : null}

        <Textarea
          ref={textareaRef}
          value={caption}
          onChange={event => onCaptionChange(event.target.value)}
          placeholder="What's on your mind?"
          rows={6}
          className={cn(
            'min-h-40 resize-none rounded-none border-0 bg-transparent py-4 text-[15px] leading-[1.65] shadow-none',
            'placeholder:text-muted-foreground/55 focus-visible:ring-0 focus-visible:ring-offset-0',
            isSheet ? 'min-h-28 px-3.5 text-sm' : 'px-4 sm:px-5 sm:py-5',
            overLimit && 'text-destructive',
          )}
        />

        {hasMedia ? (
          <div className={cn('border-t border-border/40 py-3', isSheet ? 'px-3.5' : 'px-4 sm:px-5')}>
            <MediaCarouselManager
              media={media}
              onRemove={onRemoveMedia}
              onReorder={onReorderMedia}
              onUpdateAltText={onUpdateMediaAltText}
              layout={layout}
            />
          </div>
        ) : null}

        <div
          className={cn(
            'border-t border-border/40',
            isSheet
              ? 'space-y-2 px-3.5 py-2.5'
              : 'flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5',
          )}
        >
          <div
            className={cn(
              'flex items-center gap-0.5',
              !isSheet && 'min-w-0 flex-1',
            )}
          >
            <MediaUploader
              workspaceId={workspaceId}
              onUploaded={onAddMedia}
              compact
              iconOnly={isSheet}
            />
            {isSheet ? (
              <EmojiPickerIconButton onEmojiSelect={insertEmoji} side="top" align="start" />
            ) : (
              <>
                <EmojiPicker onEmojiSelect={insertEmoji} side="top" align="start" />
                <div className="mx-1 h-4 w-px shrink-0 bg-border/50" aria-hidden />
              </>
            )}
            <PostCopywriterDialog
              open={copywriterOpen}
              onOpenChange={setCopywriterOpen}
              selectedProviders={selectedProviders}
              caption={caption}
              media={media}
              onApply={handleApplyGeneratedCaption}
              compact
            />
          </div>

          <CaptionLengthIndicator
            current={length}
            max={limit}
            className={cn(isSheet ? 'justify-end' : 'shrink-0')}
          />
        </div>
      </div>
    </ComposerSection>
  )
}
