'use client'

import { MarkdownEditor, type MarkdownEditorProps } from './markdown-editor'
import { DEFAULT_SLASH_COMMANDS, type SlashCommand } from './slash-commands'
import { useMemo } from 'react'

export type SkillVariableOption = {
  key: string
  label: string
}

export type SkillMarkdownEditorProps = Omit<MarkdownEditorProps, 'slashCommands'> & {
  variables?: SkillVariableOption[]
}

export function SkillMarkdownEditor({
  variables = [],
  placeholder = 'Type / to open menu',
  ...props
}: SkillMarkdownEditorProps) {
  const slashCommands = useMemo(() => {
    if (variables.length === 0) return DEFAULT_SLASH_COMMANDS
    const variableCommands: SlashCommand[] = variables.map(variable => ({
      id: `var-${variable.key}`,
      title: `{{${variable.key}}}`,
      description: variable.label,
      keywords: [variable.key, variable.label, 'variable', 'placeholder'],
      group: 'variables',
      icon: 'variable',
      run: (editor, range) => {
        editor.chain().focus().deleteRange(range).insertContent(`{{${variable.key}}}`).run()
      },
    }))
    return [...DEFAULT_SLASH_COMMANDS, ...variableCommands]
  }, [variables])

  return <MarkdownEditor {...props} placeholder={placeholder} slashCommands={slashCommands} />
}
