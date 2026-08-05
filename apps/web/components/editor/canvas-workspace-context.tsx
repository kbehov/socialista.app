'use client'

import { createContext, useContext, useEffect, useState, type ReactNode, type RefObject } from 'react'

type WorkspaceSize = {
  width: number
  height: number
}

type CanvasWorkspaceContextValue = {
  size: WorkspaceSize
  /** When true, scale-up is capped so the preview keeps top/bottom breathing room. */
  capPreviewHeight: boolean
}

const CanvasWorkspaceContext = createContext<CanvasWorkspaceContextValue>({
  size: { width: 0, height: 0 },
  capPreviewHeight: false,
})

export function useCanvasWorkspaceSize(): WorkspaceSize {
  return useContext(CanvasWorkspaceContext).size
}

export function useCanvasWorkspaceLayout(): Pick<CanvasWorkspaceContextValue, 'capPreviewHeight'> {
  return useContext(CanvasWorkspaceContext)
}

function useMeasureWorkspace(ref: RefObject<HTMLElement | null>): WorkspaceSize {
  const [size, setSize] = useState<WorkspaceSize>({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const w = Math.round(el.clientWidth)
      const h = Math.round(el.clientHeight)
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
  capPreviewHeight?: boolean
  children: ReactNode
}

export function CanvasWorkspaceProvider({
  workspaceRef,
  capPreviewHeight = false,
  children,
}: CanvasWorkspaceProviderProps) {
  const size = useMeasureWorkspace(workspaceRef)

  return (
    <CanvasWorkspaceContext.Provider value={{ size, capPreviewHeight }}>
      {children}
    </CanvasWorkspaceContext.Provider>
  )
}
