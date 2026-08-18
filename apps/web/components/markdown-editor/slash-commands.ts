import type { Editor } from '@tiptap/react'

export type SlashCommandRange = { from: number; to: number }

export type SlashCommandGroup = 'basic' | 'insert' | 'variables'

export type SlashCommand = {
  id: string
  title: string
  description: string
  keywords: string[]
  group: SlashCommandGroup
  icon: 'text' | 'h1' | 'h2' | 'h3' | 'bullet' | 'ordered' | 'quote' | 'code' | 'divider' | 'variable'
  run: (editor: Editor, range: SlashCommandRange) => void
}

export const SLASH_GROUP_LABELS: Record<SlashCommandGroup, string> = {
  basic: 'Basic blocks',
  insert: 'Insert',
  variables: 'Variables',
}

export const DEFAULT_SLASH_COMMANDS: SlashCommand[] = [
  {
    id: 'text',
    title: 'Text',
    description: 'Plain body copy',
    keywords: ['text', 'paragraph', 'plain'],
    group: 'basic',
    icon: 'text',
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).setParagraph().run()
    },
  },
  {
    id: 'heading-1',
    title: 'Heading 1',
    description: 'Large section title',
    keywords: ['h1', 'heading', 'title'],
    group: 'basic',
    icon: 'h1',
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
    },
  },
  {
    id: 'heading-2',
    title: 'Heading 2',
    description: 'Medium section title',
    keywords: ['h2', 'heading', 'subtitle'],
    group: 'basic',
    icon: 'h2',
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
    },
  },
  {
    id: 'heading-3',
    title: 'Heading 3',
    description: 'Small section title',
    keywords: ['h3', 'heading'],
    group: 'basic',
    icon: 'h3',
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
    },
  },
  {
    id: 'bullet-list',
    title: 'Bulleted list',
    description: 'Simple unordered list',
    keywords: ['bullet', 'list', 'unordered', 'ul'],
    group: 'basic',
    icon: 'bullet',
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    id: 'ordered-list',
    title: 'Numbered list',
    description: 'Simple ordered list',
    keywords: ['numbered', 'ordered', 'list', 'ol'],
    group: 'basic',
    icon: 'ordered',
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    id: 'quote',
    title: 'Quote',
    description: 'Capture a citation',
    keywords: ['quote', 'blockquote', 'citation'],
    group: 'basic',
    icon: 'quote',
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    },
  },
  {
    id: 'code-block',
    title: 'Code',
    description: 'Capture a code snippet',
    keywords: ['code', 'block', 'pre', 'snippet'],
    group: 'basic',
    icon: 'code',
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    },
  },
  {
    id: 'divider',
    title: 'Divider',
    description: 'Visual separator',
    keywords: ['divider', 'line', 'hr', 'rule'],
    group: 'insert',
    icon: 'divider',
    run: (editor, range) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
]

export function getSlashQuery(editor: Editor): { range: SlashCommandRange; query: string } | null {
  const { $from } = editor.state.selection
  if (!$from.parent.isTextblock) return null

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc')
  const match = textBefore.match(/^\/([^\s]*)$/)
  if (!match) return null

  const query = match[1] ?? ''
  const from = $from.start()
  return { range: { from, to: $from.pos }, query }
}

export function filterSlashCommands(commands: SlashCommand[], query: string): SlashCommand[] {
  const q = query.trim().toLowerCase()
  if (!q) return commands
  return commands.filter(command => {
    if (command.title.toLowerCase().includes(q)) return true
    if (command.description.toLowerCase().includes(q)) return true
    return command.keywords.some(keyword => keyword.toLowerCase().includes(q))
  })
}

export function groupSlashCommands(commands: SlashCommand[]): { group: SlashCommandGroup; items: SlashCommand[] }[] {
  const groups: SlashCommandGroup[] = ['basic', 'insert', 'variables']
  return groups.flatMap(group => {
    const items = commands.filter(command => command.group === group)
    return items.length > 0 ? [{ group, items }] : []
  })
}

export function prepareInsertRange(editor: Editor, pos: number): SlashCommandRange {
  const { doc, selection } = editor.state
  const docSize = doc.content.size
  const hasPos = pos >= 0 && pos <= docSize
  const node = hasPos ? doc.nodeAt(pos) : null
  const $pos = hasPos ? doc.resolve(pos) : selection.$from

  if (node?.isBlock) {
    if (node.isTextblock && node.content.size === 0) {
      const from = pos + 1
      editor.chain().focus(from).run()
      return { from, to: from }
    }

    const insertAt = pos + node.nodeSize
    editor.chain().insertContentAt(insertAt, { type: 'paragraph' }).focus(insertAt + 1).run()
    return { from: insertAt + 1, to: insertAt + 1 }
  }

  const blockPos = $pos.depth > 0 ? $pos.before() : 0
  const block = $pos.depth > 0 ? $pos.parent : node

  if (block?.isTextblock && block.content.size === 0) {
    const from = blockPos + 1
    editor.chain().focus(from).run()
    return { from, to: from }
  }

  const insertAt = $pos.depth > 0 ? $pos.after() : docSize
  editor.chain().insertContentAt(insertAt, { type: 'paragraph' }).focus(insertAt + 1).run()
  return { from: insertAt + 1, to: insertAt + 1 }
}
