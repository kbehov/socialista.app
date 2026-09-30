'use client'

import { Kbd } from '@/components/ui/kbd'
import { useState } from 'react'

function getSubmitShortcutLabel() {
  if (typeof navigator === 'undefined') return '⌘↵'
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? navigator.userAgent) ? '⌘↵' : 'Ctrl↵'
}

export function StudioHomePromptExtras() {
  const [submitShortcut] = useState(getSubmitShortcutLabel)

  return (
    <p className="pointer-fine:flex hidden flex-wrap items-center justify-center gap-1.5 text-[12px] tracking-[-0.01em] text-black/36 dark:text-white/36">
      <Kbd className="h-4 min-w-4 border-black/8 bg-transparent px-1 text-[10px] text-black/42 dark:border-white/10 dark:text-white/42">
        /
      </Kbd>
      <span>focus prompt</span>
      <span aria-hidden className="text-black/14 dark:text-white/14">·</span>
      <Kbd className="h-4 min-w-4 border-black/8 bg-transparent px-1 text-[10px] text-black/42 dark:border-white/10 dark:text-white/42">
        {submitShortcut}
      </Kbd>
      <span>generate</span>
    </p>
  )
}
