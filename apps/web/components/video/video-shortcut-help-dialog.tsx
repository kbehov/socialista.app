'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Kbd } from '@/components/ui/kbd'
import { ScrollArea } from '@/components/ui/scroll-area'

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['Space'], label: 'Play / pause' },
  { keys: ['J', 'K', 'L'], label: 'J rewind · K pause · L forward' },
  { keys: ['←', '→'], label: 'Step frame (⇧ for 1s)' },
  { keys: ['S'], label: 'Split at playhead' },
  { keys: ['⌘', 'D'], label: 'Duplicate selection' },
  { keys: ['⌫'], label: 'Delete selection' },
  { keys: ['Esc'], label: 'Deselect' },
  { keys: ['⌘', 'Z'], label: 'Undo' },
  { keys: ['⌘', '⇧', 'Z'], label: 'Redo' },
  { keys: ['⌘', 'S'], label: 'Save' },
  { keys: ['+', '−'], label: 'Timeline zoom' },
  { keys: ['H', 'V'], label: 'Center selection horizontally / vertically' },
  { keys: ['⌘', 'R'], label: 'Toggle rulers' },
  { keys: ['⌘', ';'], label: 'Toggle center guides' },
  { keys: ['⌘', '⇧', 'G'], label: 'Toggle snap on canvas' },
  { keys: ['Click timecode'], label: 'Jump to time' },
  { keys: ['?'], label: 'Show shortcuts' },
]

const TIPS: string[] = [
  'Timeline magnet snaps clips; canvas snap is in the preview view menu.',
  'Safe zones and rulers live under view options beside the zoom controls.',
]

type VideoShortcutHelpDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VideoShortcutHelpDialog({ open, onOpenChange }: VideoShortcutHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-sm flex-col gap-4 overflow-hidden p-6 sm:max-w-sm">
        <DialogHeader className="shrink-0 space-y-1.5 text-left">
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Speed up editing without leaving the timeline.</DialogDescription>
        </DialogHeader>
        <ScrollArea
          className="h-[min(calc(85vh-10rem),20rem)] shrink-0 pr-1"
          scrollFade
          scrollbarGutter
        >
          <ul className="flex flex-col gap-0.5 pb-1">
            {SHORTCUTS.map(item => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-md px-1 py-1.5 text-sm"
              >
                <span className="min-w-0 text-muted-foreground">{item.label}</span>
                <span className="flex shrink-0 flex-wrap items-center justify-end gap-0.5">
                  {item.keys.map(key => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <ul className="mt-2 space-y-1.5 border-t border-border/40 pt-3 text-[11px] leading-relaxed text-muted-foreground">
            {TIPS.map(tip => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
