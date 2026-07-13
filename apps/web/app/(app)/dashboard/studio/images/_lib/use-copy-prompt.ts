'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'

function commitHaptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

export function useCopyPrompt() {
  const copyPrompt = useCallback(async (prompt: string, label = 'Prompt copied') => {
    try {
      await navigator.clipboard.writeText(prompt)
      commitHaptic()
      toast.success(label)
      return true
    } catch {
      toast.error('Could not copy prompt')
      return false
    }
  }, [])

  return { copyPrompt }
}
