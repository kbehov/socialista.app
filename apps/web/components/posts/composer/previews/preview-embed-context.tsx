'use client'

import { createContext, useContext } from 'react'

const PreviewEmbedContext = createContext(false)

export function PreviewEmbedProvider({
  embedded,
  children,
}: {
  embedded: boolean
  children: React.ReactNode
}) {
  return <PreviewEmbedContext.Provider value={embedded}>{children}</PreviewEmbedContext.Provider>
}

export function usePreviewEmbedded(): boolean {
  return useContext(PreviewEmbedContext)
}
