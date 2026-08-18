'use client'

import { ToolbarProvider } from '@/components/toolbars/toolbar-provider'
import { cn } from '@/lib/utils'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'
import NodeRange from '@tiptap/extension-node-range'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useRef, useState } from 'react'

import { MarkdownBlockHandle } from './markdown-block-handle'
import { MarkdownBubbleToolbar } from './markdown-bubble-toolbar'
import { MarkdownSlashMenu, type MarkdownSlashMenuHandle } from './markdown-slash-menu'
import { DEFAULT_SLASH_COMMANDS, type SlashCommand } from './slash-commands'

const baseExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    link: { openOnClick: false, autolink: false },
    dropcursor: {
      color: 'var(--foreground)',
      width: 2,
    },
  }),
  Markdown,
  NodeRange,
]

const editorSurfaceClass = cn(
  'relative min-h-[280px] cursor-text overflow-visible',
  '[&_.tiptap]:min-h-[280px] [&_.tiptap]:py-1 [&_.tiptap]:pr-2 [&_.tiptap]:pl-14 [&_.tiptap]:outline-none',
  '[&_.tiptap]:text-[15px] [&_.tiptap]:leading-7 [&_.tiptap]:text-foreground',
  '[&_.tiptap_p]:my-0.5',
  '[&_.tiptap_h1]:mt-6 [&_.tiptap_h1]:mb-2 [&_.tiptap_h1]:text-[1.75rem] [&_.tiptap_h1]:leading-tight [&_.tiptap_h1]:font-semibold [&_.tiptap_h1]:tracking-[-0.03em]',
  '[&_.tiptap_h2]:mt-5 [&_.tiptap_h2]:mb-1.5 [&_.tiptap_h2]:text-[1.35rem] [&_.tiptap_h2]:leading-snug [&_.tiptap_h2]:font-semibold [&_.tiptap_h2]:tracking-[-0.025em]',
  '[&_.tiptap_h3]:mt-4 [&_.tiptap_h3]:mb-1 [&_.tiptap_h3]:text-[1.1rem] [&_.tiptap_h3]:leading-snug [&_.tiptap_h3]:font-semibold',
  '[&_.tiptap_ul]:my-2 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6',
  '[&_.tiptap_ol]:my-2 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6',
  '[&_.tiptap_li]:my-0.5 [&_.tiptap_li]:leading-7',
  '[&_.tiptap_blockquote]:my-3 [&_.tiptap_blockquote]:border-l-2 [&_.tiptap_blockquote]:border-foreground/15 [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:text-muted-foreground',
  '[&_.tiptap_pre]:my-3 [&_.tiptap_pre]:overflow-x-auto [&_.tiptap_pre]:rounded-xl [&_.tiptap_pre]:border [&_.tiptap_pre]:border-border/80 [&_.tiptap_pre]:bg-muted/50 [&_.tiptap_pre]:p-4',
  '[&_.tiptap_pre_code]:bg-transparent [&_.tiptap_pre_code]:p-0 [&_.tiptap_pre_code]:text-[13px] [&_.tiptap_pre_code]:leading-6 [&_.tiptap_pre_code]:text-foreground',
  '[&_.tiptap_hr]:my-6 [&_.tiptap_hr]:border-border/80',
  '[&_.tiptap_a]:text-foreground [&_.tiptap_a]:underline [&_.tiptap_a]:underline-offset-2',
  '[&_.tiptap_.is-empty]:before:pointer-events-none [&_.tiptap_.is-empty]:before:float-left [&_.tiptap_.is-empty]:before:h-0 [&_.tiptap_.is-empty]:before:text-muted-foreground/40 [&_.tiptap_.is-empty]:before:content-[attr(data-placeholder)]',
  '[&_.ProseMirror-selectednode]:relative [&_.ProseMirror-selectednode]:rounded-md [&_.ProseMirror-selectednode]:bg-muted/60',
  '[&_.ProseMirror-noderangeselection]:rounded-md [&_.ProseMirror-noderangeselection]:bg-muted/50',
)

export type MarkdownEditorProps = {
  value?: string
  defaultValue?: string
  onChange?: (markdown: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  name?: string
  id?: string
  'aria-label'?: string
  'aria-invalid'?: boolean
  slashCommands?: SlashCommand[]
}

export function MarkdownEditor({
  value,
  defaultValue = '',
  onChange,
  onBlur,
  placeholder = 'Type / to open menu',
  disabled = false,
  className,
  name,
  id,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  slashCommands = DEFAULT_SLASH_COMMANDS,
}: MarkdownEditorProps) {
  const onChangeRef = useRef(onChange)
  const onBlurRef = useRef(onBlur)
  const isControlledRef = useRef(value !== undefined)
  const slashMenuRef = useRef<MarkdownSlashMenuHandle | null>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const [uncontrolled, setUncontrolled] = useState(defaultValue)

  useEffect(() => {
    onChangeRef.current = onChange
    onBlurRef.current = onBlur
    isControlledRef.current = value !== undefined
  })

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      ...baseExtensions,
      Placeholder.configure({
        showOnlyCurrent: true,
        includeChildren: true,
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            const level = typeof node.attrs.level === 'number' ? node.attrs.level : 1
            return `Heading ${level}`
          }
          if (node.type.name === 'blockquote') return 'Empty quote'
          if (node.type.name === 'codeBlock') return 'Code'
          return placeholder
        },
      }),
    ],
    content: value ?? defaultValue,
    contentType: 'markdown',
    editable: !disabled,
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
        ...(ariaInvalid ? { 'aria-invalid': 'true' } : {}),
        class: 'markdown-editor-content',
      },
      handleKeyDown: (_view, event) => slashMenuRef.current?.onKeyDown(event) ?? false,
    },
    onUpdate: ({ editor: instance }) => {
      const markdown = instance.getMarkdown()
      onChangeRef.current?.(markdown)
      if (!isControlledRef.current) setUncontrolled(markdown)
    },
    onBlur: () => {
      onBlurRef.current?.()
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [disabled, editor])

  useEffect(() => {
    if (!editor || value === undefined) return
    if (editor.isEmpty && value.trim() === '') return
    const current = editor.getMarkdown()
    if (current === value) return
    editor.commands.setContent(value, { contentType: 'markdown' })
  }, [editor, value])

  const markdown = value ?? uncontrolled

  if (!editor) {
    return (
      <div className={cn('min-h-[280px] pl-14', className)}>
        <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'min-w-0',
        ariaInvalid && '[&_.tiptap]:caret-destructive',
        disabled && 'pointer-events-none opacity-60',
        className,
      )}
    >
      {name ? <textarea name={name} value={markdown} readOnly hidden tabIndex={-1} /> : null}
      <ToolbarProvider editor={editor}>
        <div
          ref={surfaceRef}
          className={editorSurfaceClass}
          onClick={event => {
            const target = event.target as HTMLElement
            if (target.closest('.markdown-block-handle, [data-markdown-insert-menu]')) return
            editor.chain().focus().run()
          }}
        >
          <EditorContent editor={editor} className="relative" />
          {disabled ? null : (
            <MarkdownBlockHandle
              editor={editor}
              onInsert={range => slashMenuRef.current?.openAt(range)}
            />
          )}
          <MarkdownSlashMenu
            commands={slashCommands}
            containerRef={surfaceRef}
            handleRef={slashMenuRef}
          />
          <MarkdownBubbleToolbar containerRef={surfaceRef} />
        </div>
      </ToolbarProvider>
    </div>
  )
}
