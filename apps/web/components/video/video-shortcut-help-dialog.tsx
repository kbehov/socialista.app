'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Kbd } from '@/components/ui/kbd'

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
  { keys: ['Click timecode'], label: 'Jump to time' },
  { keys: ['?'], label: 'Show shortcuts' },
]

const TIPS: string[] = [
  'Toggle magnet snapping in the transport bar.',
  'Enable safe zones from the preview corner to keep content clear of platform UI.',
]

type VideoShortcutHelpDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VideoShortcutHelpDialog({ open, onOpenChange }: VideoShortcutHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Speed up editing without leaving the timeline.</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-1.5">
          {SHORTCUTS.map(item => (
            <li
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-md px-1 py-1.5 text-sm"
            >
              <span className="text-muted-foreground">{item.label}</span>
              <span className="flex shrink-0 items-center gap-0.5">
                {item.keys.map(key => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <ul className="mt-2 space-y-1 border-t pt-2 text-[11px] text-muted-foreground">
          {TIPS.map(tip => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
