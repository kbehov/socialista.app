'use client'

import { useEditorStore } from '@/lib/carousel/store'
import { useEffect, useState } from 'react'

export type SidebarTab = 'generate' | 'edit'

export function useSidebarTab(initialTab: SidebarTab = 'generate') {
  const [tab, setTab] = useState<SidebarTab>(initialTab)
  const activeLayerId = useEditorStore(s => s.activeLayerId)

  useEffect(() => {
    if (activeLayerId) setTab('edit')
  }, [activeLayerId])

  return { tab, setTab }
}
