'use client'

import { useEditorStore } from '@/lib/carousel/store'

export type SidebarTab = 'create' | 'design' | 'text' | 'media' | 'layers'

export function useSidebarTab() {
  const tab = useEditorStore(s => s.studioPanelTab)
  const setTab = useEditorStore(s => s.setStudioPanelTab)

  return { tab, setTab }
}
