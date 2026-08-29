'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { stopPropagationClick } from '@/utils/dom-events'
import { canDeletePost, canPostNow } from '@/utils/post.utils'
import { isPostEditable } from '@/utils/composer.utils'
import type { Post } from '@socialista/types'
import { Loader2Icon, MoreHorizontalIcon, PencilIcon, SendIcon, Trash2Icon } from 'lucide-react'

type PostActionsMenuProps = {
  post: Post
  isPublishing?: boolean
  onEdit?: (post: Post) => void
  onPostNow?: (post: Post) => void
  onDelete?: (post: Post) => void
  triggerClassName?: string
}

export function PostActionsMenu({
  post,
  isPublishing = false,
  onEdit,
  onPostNow,
  onDelete,
  triggerClassName,
}: PostActionsMenuProps) {
  const editable = Boolean(onEdit) && isPostEditable(post.status)
  const showPostNow = Boolean(onPostNow) && canPostNow(post.status)
  const showDelete = Boolean(onDelete) && canDeletePost(post.status)

  if (!editable && !showPostNow && !showDelete) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className={cn('size-8 rounded-md text-foreground/56 hover:text-foreground', triggerClassName)}
          aria-label="Post actions"
          onClick={event => event.stopPropagation()}
        >
          <MoreHorizontalIcon className="size-4" strokeWidth={1.5} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44" onClick={event => event.stopPropagation()}>
        {editable && onEdit ? (
          <DropdownMenuItem onClick={stopPropagationClick(() => onEdit(post))}>
            <PencilIcon />
            Edit
          </DropdownMenuItem>
        ) : null}
        {showPostNow && onPostNow ? (
          <DropdownMenuItem disabled={isPublishing} onClick={stopPropagationClick(() => onPostNow(post))}>
            {isPublishing ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
            {isPublishing ? 'Publishing…' : 'Post now'}
          </DropdownMenuItem>
        ) : null}
        {showDelete && onDelete ? (
          <>
            {editable || showPostNow ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem variant="destructive" onClick={stopPropagationClick(() => onDelete(post))}>
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
