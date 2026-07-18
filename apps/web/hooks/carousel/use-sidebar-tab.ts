'use client'

import { useEditorStore } from '@/lib/carousel/store'
import { useEffect } from 'react'

export type SidebarTab = 'generate' | 'edit'

export function useSidebarTab() {
  const tab = useEditorStore(s => s.studioPanelTab)
  const setTab = useEditorStore(s => s.setStudioPanelTab)
  const activeLayerId = useEditorStore(s => s.activeLayerId)

  useEffect(() => {
    if (activeLayerId) setTab('edit')
  }, [activeLayerId, setTab])

  return { tab, setTab }
}
