'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { useEffect, useRef } from 'react'

export function CollapseAppSidebarOnMount() {
  const { setOpen, open } = useSidebar()
  const wasOpenRef = useRef(open)
  const setOpenRef = useRef(setOpen)
  setOpenRef.current = setOpen

  useEffect(() => {
    wasOpenRef.current = open
    setOpenRef.current(false)

    return () => {
      setOpenRef.current(wasOpenRef.current)
    }
    // Run once on mount. `setOpen` from SidebarProvider changes when `open` toggles,
    // so including it in deps would re-collapse the sidebar on every expand attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
