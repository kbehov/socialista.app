'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import * as React from 'react'

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  // React 19 errors on <script> inside client components. Keep a real script on the
  // server so the theme applies before paint; on the client mark it as JSON so React
  // does not treat it as executable JS (it never re-runs after hydration anyway).
  const scriptProps = typeof window === 'undefined' ? undefined : ({ type: 'application/json' } as const)

  return (
    <NextThemesProvider {...props} scriptProps={scriptProps}>
      {children}
    </NextThemesProvider>
  )
}
