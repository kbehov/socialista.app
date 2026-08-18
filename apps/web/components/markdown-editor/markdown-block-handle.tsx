'use client'

import { cn } from '@/lib/utils'
import type { Editor } from '@tiptap/react'
import DragHandle from '@tiptap/extension-drag-handle-react'
import { GripVertical, Plus } from 'lucide-react'
import { useRef, useState } from 'react'

import { prepareInsertRange, type SlashCommandRange } from './slash-commands'

export function MarkdownBlockHandle({
  editor,
  onInsert,
}: {
  editor: Editor
  onInsert: (range: SlashCommandRange) => void
}) {
  const posRef = useRef(-1)
  const [dragging, setDragging] = useState(false)

  const openInsertMenu = (event: React.SyntheticEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const handle = event.currentTarget.closest('.markdown-block-handle')
    if (handle instanceof HTMLElement) {
      handle.draggable = false
      const preventDrag = (dragEvent: Event) => {
        dragEvent.preventDefault()
        dragEvent.stopPropagation()
        dragEvent.stopImmediatePropagation()
      }
      handle.addEventListener('dragstart', preventDrag, { capture: true, once: true })
    }
    onInsert(prepareInsertRange(editor, posRef.current))
  }

  return (
    <DragHandle
      editor={editor}
      nested
      className={cn(
        'markdown-block-handle z-20 flex items-center gap-px',
        dragging && 'opacity-40',
      )}
      computePositionConfig={{
        placement: 'left-start',
        strategy: 'absolute',
      }}
      onNodeChange={({ pos }) => {
        posRef.current = pos
      }}
      onElementDragStart={event => {
        if ((event.target as HTMLElement).closest('[data-insert-block]')) {
          event.preventDefault()
          event.stopPropagation()
          return
        }
        setDragging(true)
      }}
      onElementDragEnd={() => setDragging(false)}
    >
      <button
        type="button"
        data-insert-block=""
        draggable={false}
        aria-label="Insert block"
        title="Insert block"
        className={cn(
          'flex size-6 items-center justify-center rounded-md text-muted-foreground/70',
          'transition-[color,background-color,transform] duration-100 ease-out',
          'hover:bg-muted hover:text-foreground active:scale-95',
        )}
        onPointerDown={event => {
          if (event.button !== 0) return
          openInsertMenu(event)
        }}
        onMouseDown={event => {
          event.preventDefault()
          event.stopPropagation()
        }}
        onClick={event => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <Plus className="size-3.5" strokeWidth={2} />
      </button>
      <div
        aria-label="Drag to move"
        title="Drag to move"
        className={cn(
          'flex size-6 cursor-grab items-center justify-center rounded-md text-muted-foreground/70',
          'transition-[color,background-color] duration-100 ease-out',
          'hover:bg-muted hover:text-foreground active:cursor-grabbing',
        )}
      >
        <GripVertical className="size-3.5" strokeWidth={2} />
      </div>
    </DragHandle>
  )
}
