'use client'

import { createContext, useContext } from 'react'

export const TimelineFocusContext = createContext<((time: number) => void) | null>(null)

export function useTimelineFocus() {
  return useContext(TimelineFocusContext)
}
