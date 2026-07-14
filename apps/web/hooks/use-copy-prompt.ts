'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'

import { commitHaptic } from '@/utils/haptics'

export function useCopyPrompt() {
  const copyPrompt = useCallback(async (prompt: string, label = 'Prompt copied') => {
    try {
      await navigator.clipboard.writeText(prompt)
      commitHaptic({ vibrateDuration: 10 })
      toast.success(label)
      return true
    } catch {
      toast.error('Could not copy prompt')
      return false
    }
  }, [])

  return { copyPrompt }
}
