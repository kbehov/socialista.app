'use client'

import { useToolbar } from '@/components/toolbars/toolbar-provider'
import type { Editor } from '@tiptap/react'
import { useLayoutEffect, useRef } from 'react'

import { MarkdownBubbleTools } from './markdown-toolbar'
import { getSlashQuery } from './slash-commands'

export function MarkdownBubbleToolbar({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement | null>
}) {
  const { editor } = useToolbar()
  const { empty, from, to } = editor.state.selection
  const slashOpen = Boolean(getSlashQuery(editor))
  const visible = editor.isFocused && !empty && from !== to && !slashOpen
  const menuRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!visible) return
    const menu = menuRef.current
    if (!menu) return
    const position = getBubblePosition(editor, from, to, containerRef.current)
    menu.style.top = `${position.top}px`
    menu.style.left = `${position.left}px`
  }, [visible, editor, from, to, containerRef])

  if (!visible) return null

  return (
    <div
      ref={menuRef}
      className="pointer-events-auto absolute z-20 -translate-x-1/2"
      onMouseDown={event => event.preventDefault()}
    >
      <MarkdownBubbleTools />
    </div>
  )
}

function getBubblePosition(editor: Editor, from: number, to: number, container: HTMLElement | null) {
  const start = editor.view.coordsAtPos(from)
  const end = editor.view.coordsAtPos(to)
  if (!container) return { top: 8, left: 80 }
  const box = container.getBoundingClientRect()
  const mid = (start.left + end.left) / 2 - box.left
  const top = Math.min(start.top, end.top) - box.top - 42
  return {
    top: Math.max(8, top),
    left: Math.max(80, Math.min(mid, box.width - 80)),
  }
}
