'use client'

import { BlockquoteToolbar } from '@/components/toolbars/blockquote'
import { BoldToolbar } from '@/components/toolbars/bold'
import { BulletListToolbar } from '@/components/toolbars/bullet-list'
import { CodeToolbar } from '@/components/toolbars/code'
import { CodeBlockToolbar } from '@/components/toolbars/code-block'
import { HeadingToolbar } from '@/components/toolbars/heading'
import { HorizontalRuleToolbar } from '@/components/toolbars/horizontal-rule'
import { ItalicToolbar } from '@/components/toolbars/italic'
import { OrderedListToolbar } from '@/components/toolbars/ordered-list'
import { RedoToolbar } from '@/components/toolbars/redo'
import { StrikeThroughToolbar } from '@/components/toolbars/strikethrough'
import { UndoToolbar } from '@/components/toolbars/undo'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

function ToolbarDivider() {
  return <Separator orientation="vertical" className="mx-0.5 h-4 self-center" />
}

export function MarkdownToolbar({
  extra,
  className,
}: {
  extra?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'glass sticky top-0 z-10 flex items-center gap-0.5 overflow-x-auto rounded-t-2xl border-x-0 border-t-0 px-2 py-1.5',
        className,
      )}
    >
      <UndoToolbar />
      <RedoToolbar />
      <ToolbarDivider />
      <HeadingToolbar />
      <ToolbarDivider />
      <BoldToolbar />
      <ItalicToolbar />
      <StrikeThroughToolbar />
      <CodeToolbar />
      <ToolbarDivider />
      <BulletListToolbar />
      <OrderedListToolbar />
      <BlockquoteToolbar />
      <CodeBlockToolbar />
      <HorizontalRuleToolbar />
      {extra ? (
        <>
          <ToolbarDivider />
          {extra}
        </>
      ) : null}
    </div>
  )
}

export function MarkdownBubbleTools() {
  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-border/80 bg-popover/95 px-1 py-0.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl">
      <BoldToolbar className="size-7" />
      <ItalicToolbar className="size-7" />
      <StrikeThroughToolbar className="size-7" />
      <CodeToolbar className="size-7" />
      <ToolbarDivider />
      <HeadingToolbar className="h-7 gap-1 px-1.5" />
    </div>
  )
}
