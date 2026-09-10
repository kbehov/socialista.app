'use client'

import { Button } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

function useResolvedDarkMode() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  return {
    isDark,
    mounted,
    setDark: (dark: boolean) => setTheme(dark ? 'dark' : 'light'),
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, mounted, setDark } = useResolvedDarkMode()

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" className={className} disabled aria-label="Toggle theme">
        <SunIcon />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn(className)}
      aria-label="Toggle theme"
      onClick={() => setDark(!isDark)}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}

export function ThemeMenuToggle() {
  const { isDark, mounted, setDark } = useResolvedDarkMode()

  return (
    <DropdownMenuItem
      disabled={!mounted}
      onSelect={event => {
        event.preventDefault()
        setDark(!isDark)
      }}
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
      Dark mode
      <Switch size="sm" checked={isDark} tabIndex={-1} aria-hidden className="pointer-events-none ml-auto" />
    </DropdownMenuItem>
  )
}
