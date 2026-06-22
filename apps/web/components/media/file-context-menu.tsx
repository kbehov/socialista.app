'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { FilePreview, type FilePreviewProps } from '@/components/media/file-preview'
import { ExternalLinkIcon, Trash2Icon } from 'lucide-react'
import type { ReactNode } from 'react'

type FileContextMenuProps = FilePreviewProps & {
  fileName?: string
  onDelete?: () => void
  onOpen?: () => void
  children?: ReactNode
}

export function FileContextMenu({
  fileName,
  onDelete,
  onOpen,
  children,
  ...previewProps
}: FileContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="size-full">{children ?? <FilePreview {...previewProps} />}</div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-44">
        {onOpen && (
          <ContextMenuItem onClick={onOpen}>
            <ExternalLinkIcon />
            Open file
          </ContextMenuItem>
        )}
        {onOpen && onDelete && <ContextMenuSeparator />}
        {onDelete && (
          <ContextMenuItem variant="destructive" onClick={onDelete}>
            <Trash2Icon />
            Delete file
          </ContextMenuItem>
        )}
        {fileName && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem disabled className="text-xs text-muted-foreground">
              {fileName}
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
