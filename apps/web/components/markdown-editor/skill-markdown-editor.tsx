'use client'

import { MarkdownEditor, type MarkdownEditorProps } from './markdown-editor'
import { DEFAULT_SLASH_COMMANDS } from './slash-commands'

export type SkillMarkdownEditorProps = Omit<MarkdownEditorProps, 'slashCommands'>

export function SkillMarkdownEditor({
  placeholder = 'Type / to open menu',
  ...props
}: SkillMarkdownEditorProps) {
  return <MarkdownEditor {...props} placeholder={placeholder} slashCommands={DEFAULT_SLASH_COMMANDS} />
}
