import type { MouseEvent } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'

/** Run a handler after stopping event bubbling (e.g. card nested buttons). */
export function stopPropagationClick(handler: () => void) {
  return (event: MouseEvent) => {
    event.stopPropagation()
    handler()
  }
}

/** Keyboard + click props so a non-button element behaves like a button. */
export function getClickableElementProps(onActivate: (() => void) | undefined) {
  if (!onActivate) return {}

  return {
    role: 'button' as const,
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (event: ReactKeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onActivate()
      }
    },
  }
}
