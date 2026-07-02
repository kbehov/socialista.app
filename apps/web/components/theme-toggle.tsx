'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

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
      onClick={toggleTheme}
    >
      <SunIcon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <MoonIcon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  )
}
