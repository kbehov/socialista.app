'use client'

import { useToolbar } from '@/components/toolbars/toolbar-provider'
import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'

import { MarkdownInsertMenu } from './markdown-insert-menu'
import {
  filterSlashCommands,
  getSlashQuery,
  groupSlashCommands,
  type SlashCommand,
  type SlashCommandRange,
} from './slash-commands'

export type MarkdownSlashMenuHandle = {
  onKeyDown: (event: KeyboardEvent) => boolean
  openAt: (range: SlashCommandRange) => void
}

type SlashSnapshot = { from: number; to: number; query: string }

export function MarkdownSlashMenu({
  commands,
  containerRef,
  handleRef,
}: {
  commands: SlashCommand[]
  containerRef: React.RefObject<HTMLElement | null>
  handleRef: React.RefObject<MarkdownSlashMenuHandle | null>
}) {
  const { editor } = useToolbar()
  const slash = useEditorState({
    editor,
    selector: ({ editor: instance }): SlashSnapshot | null => {
      const next = getSlashQuery(instance)
      if (!next) return null
      return { from: next.range.from, to: next.range.to, query: next.query }
    },
  })
  const [forcedRange, setForcedRange] = useState<SlashCommandRange | null>(null)
  const [highlight, setHighlight] = useState({ key: null as string | null, index: 0 })
  const [dismissedSlashId, setDismissedSlashId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<SlashCommand[]>([])
  const rangeRef = useRef<SlashCommandRange | null>(null)
  const activeIndexRef = useRef(0)
  const slashId = slash ? `${slash.from}:${slash.query}` : null

  if (!slashId && dismissedSlashId) setDismissedSlashId(null)
  if (slashId && forcedRange) setForcedRange(null)

  const slashVisible = Boolean(slash) && dismissedSlashId !== slashId
  const visible = slashVisible || forcedRange !== null
  const query = slashVisible ? (slash?.query ?? '') : ''
  const range: SlashCommandRange | null = slashVisible && slash
    ? { from: slash.from, to: slash.to }
    : forcedRange
  const items = visible
    ? query
      ? filterSlashCommands(commands, query)
      : groupSlashCommands(filterSlashCommands(commands, query)).flatMap(section => section.items)
    : []
  const from = range?.from ?? null
  const menuKey = slashId ?? (forcedRange ? `plus:${forcedRange.from}` : null)
  const activeIndex = highlight.key === menuKey ? highlight.index : 0

  useEffect(() => {
    itemsRef.current = items
    rangeRef.current = range
    activeIndexRef.current = activeIndex
  })

  const setActiveIndex = useCallback(
    (index: number) => {
      setHighlight({ key: menuKey, index })
    },
    [menuKey],
  )

  const closeForced = useCallback(() => {
    setForcedRange(null)
  }, [])

  const runCommand = useCallback(
    (command: SlashCommand, commandRange: SlashCommandRange) => {
      command.run(editor, commandRange)
      setForcedRange(null)
    },
    [editor],
  )

  useLayoutEffect(() => {
    if (!visible || from == null) return
    const menu = menuRef.current
    if (!menu) return
    const next = getMenuPosition(editor, from, containerRef.current)
    menu.style.top = `${next.top}px`
    menu.style.left = `${next.left}px`
  }, [visible, from, query, editor, containerRef])

  const forcedFrom = forcedRange?.from
  const forcedTo = forcedRange?.to

  useEffect(() => {
    if (forcedFrom == null || forcedTo == null) return

    editor.view.dispatch(editor.state.tr.setMeta('lockDragHandle', true).setMeta('addToHistory', false))

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('[data-markdown-insert-menu], [data-insert-block]')) return
      closeForced()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      editor.view.dispatch(editor.state.tr.setMeta('lockDragHandle', false).setMeta('addToHistory', false))
    }
  }, [closeForced, editor, forcedFrom, forcedTo])

  useImperativeHandle(
    handleRef,
    () => ({
      openAt(nextRange) {
        setDismissedSlashId(null)
        setHighlight({ key: `plus:${nextRange.from}`, index: 0 })
        setForcedRange(nextRange)
        editor.chain().focus(nextRange.from).run()
      },
      onKeyDown(event: KeyboardEvent) {
        const current = rangeRef.current
        if (!current) return false

        if (event.key === 'Escape') {
          if (slashId) setDismissedSlashId(slashId)
          closeForced()
          return true
        }

        const currentItems = itemsRef.current
        if (currentItems.length === 0) return false

        if (event.key === 'ArrowDown') {
          const next = (activeIndexRef.current + 1) % currentItems.length
          setActiveIndex(next)
          return true
        }
        if (event.key === 'ArrowUp') {
          const next = (activeIndexRef.current - 1 + currentItems.length) % currentItems.length
          setActiveIndex(next)
          return true
        }
        if (event.key === 'Enter' || event.key === 'Tab') {
          const command = currentItems[activeIndexRef.current]
          if (command) runCommand(command, current)
          return true
        }
        return false
      },
    }),
    [closeForced, editor, runCommand, setActiveIndex, slashId],
  )

  if (!visible || !range) return null

  return (
    <div
      ref={menuRef}
      data-markdown-insert-menu=""
      className="absolute z-30 w-72 overflow-hidden rounded-xl border border-border/80 bg-popover/95 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl"
    >
      <MarkdownInsertMenu
        items={items}
        grouped={!query}
        activeIndex={activeIndex}
        query={query}
        onHover={setActiveIndex}
        onSelect={command => runCommand(command, range)}
      />
    </div>
  )
}

function getMenuPosition(editor: Editor, pos: number, container: HTMLElement | null) {
  const safePos = Math.max(1, Math.min(pos, editor.state.doc.content.size))
  const coords = editor.view.coordsAtPos(safePos)
  if (!container) return { top: 40, left: 24 }
  const box = container.getBoundingClientRect()
  const top = coords.bottom - box.top + 6
  const left = Math.min(Math.max(8, coords.left - box.left), Math.max(8, box.width - 296))
  return { top, left }
}
