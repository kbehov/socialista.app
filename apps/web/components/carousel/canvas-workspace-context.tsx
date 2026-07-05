'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'

type WorkspaceSize = {
  width: number
  height: number
}

const CanvasWorkspaceContext = createContext<WorkspaceSize>({ width: 0, height: 0 })

export function useCanvasWorkspaceSize(): WorkspaceSize {
  return useContext(CanvasWorkspaceContext)
}

function useMeasureWorkspace(ref: RefObject<HTMLElement | null>): WorkspaceSize {
  const [size, setSize] = useState<WorkspaceSize>({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      const w = Math.round(width)
      const h = Math.round(height)
      setSize(prev => (prev.width === w && prev.height === h ? prev : { width: w, height: h }))
    }

    update()

    const observer = new ResizeObserver(() => update())
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  return size
}

type CanvasWorkspaceProviderProps = {
  workspaceRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}

export function CanvasWorkspaceProvider({ workspaceRef, children }: CanvasWorkspaceProviderProps) {
  const size = useMeasureWorkspace(workspaceRef)
  return <CanvasWorkspaceContext.Provider value={size}>{children}</CanvasWorkspaceContext.Provider>
}
