'use client'

import { cn } from '@/lib/utils'
import {
  Braces,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  TextQuote,
  Type,
} from 'lucide-react'

import { SLASH_GROUP_LABELS, type SlashCommand } from './slash-commands'

const ICON_MAP = {
  text: Type,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  bullet: List,
  ordered: ListOrdered,
  quote: TextQuote,
  code: Code,
  divider: Minus,
  variable: Braces,
} as const

export function MarkdownInsertMenu({
  items,
  grouped,
  activeIndex,
  query,
  onHover,
  onSelect,
}: {
  items: SlashCommand[]
  grouped: boolean
  activeIndex: number
  query: string
  onHover: (index: number) => void
  onSelect: (command: SlashCommand) => void
}) {
  if (items.length === 0) {
    return <p className="px-2.5 py-3 text-[13px] text-muted-foreground">No results</p>
  }

  if (!grouped) {
    return (
      <ul className="max-h-80 overflow-y-auto p-1" role="listbox">
        {items.map((command, index) => (
          <InsertMenuItem
            key={command.id}
            command={command}
            selected={index === activeIndex}
            onHover={() => onHover(index)}
            onSelect={() => onSelect(command)}
          />
        ))}
      </ul>
    )
  }

  let offset = 0
  const sections: { group: SlashCommand['group']; items: SlashCommand[]; start: number }[] = []
  for (const command of items) {
    const last = sections[sections.length - 1]
    if (last && last.group === command.group) {
      last.items.push(command)
    } else {
      sections.push({ group: command.group, items: [command], start: offset })
    }
    offset += 1
  }

  return (
    <div className="max-h-80 overflow-y-auto py-1">
      {sections.map(section => (
        <div key={section.group} className="px-1">
          <p className="px-2 pt-1.5 pb-1 text-[11px] font-medium tracking-[0.01em] text-muted-foreground">
            {query ? 'Matches' : SLASH_GROUP_LABELS[section.group]}
          </p>
          <ul role="listbox">
            {section.items.map((command, index) => {
              const itemIndex = section.start + index
              return (
                <InsertMenuItem
                  key={command.id}
                  command={command}
                  selected={itemIndex === activeIndex}
                  onHover={() => onHover(itemIndex)}
                  onSelect={() => onSelect(command)}
                />
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

function InsertMenuItem({
  command,
  selected,
  onHover,
  onSelect,
}: {
  command: SlashCommand
  selected: boolean
  onHover: () => void
  onSelect: () => void
}) {
  const Icon = ICON_MAP[command.icon]

  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-[10px] px-2 py-1.5 text-left transition-colors duration-100',
          selected ? 'bg-muted' : 'hover:bg-muted/70',
        )}
        onMouseEnter={onHover}
        onMouseDown={event => event.preventDefault()}
        onClick={onSelect}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background text-foreground shadow-[0_1px_0_rgba(0,0,0,0.03)]">
          <Icon className="size-3.5" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium tracking-[-0.01em]">{command.title}</span>
          <span className="block truncate text-[12px] leading-4 text-muted-foreground">{command.description}</span>
        </span>
      </button>
    </li>
  )
}
