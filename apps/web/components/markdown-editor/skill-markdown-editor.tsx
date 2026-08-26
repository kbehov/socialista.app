'use client'

import { SKILL_CONTENT_MAX_WORDS } from '@socialista/types'
import { MarkdownEditor, type MarkdownEditorProps } from './markdown-editor'
import { DEFAULT_SLASH_COMMANDS } from './slash-commands'

export type SkillMarkdownEditorProps = Omit<MarkdownEditorProps, 'slashCommands'>

export function SkillMarkdownEditor({
  placeholder = 'Type / to open menu',
  maxWords = SKILL_CONTENT_MAX_WORDS,
  ...props
}: SkillMarkdownEditorProps) {
  return (
    <MarkdownEditor
      {...props}
      maxWords={maxWords}
      placeholder={placeholder}
      slashCommands={DEFAULT_SLASH_COMMANDS}
    />
  )
}
