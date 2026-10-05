'use client'

import { useLayoutEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FONT_FAMILIES, FONT_LABELS, type FontFamily } from '@/lib/carousel/defaults'
import { ensureStudioFonts } from '@/lib/editor/studio-fonts'
import { STUDIO_FONTS } from '@socialista/types'

type FontPickerProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

const SYSTEM_GROUPS: { label: string; fonts: string[] }[] = [
  {
    label: 'Popular',
    fonts: [
      'Arial, Helvetica, sans-serif',
      'Impact, Haettenschweiler, sans-serif',
      'Inter, system-ui, sans-serif',
    ],
  },
  {
    label: 'Sans',
    fonts: [
      'Helvetica, Arial, sans-serif',
      'Verdana, Geneva, sans-serif',
      '"Trebuchet MS", Helvetica, sans-serif',
      '"Segoe UI", Tahoma, sans-serif',
      'system-ui, sans-serif',
    ],
  },
  {
    label: 'Serif',
    fonts: ['Georgia, serif', '"Times New Roman", Times, serif'],
  },
  {
    label: 'Display',
    fonts: ['"Arial Black", Gadget, sans-serif'],
  },
  {
    label: 'Script',
    fonts: ['"Comic Sans MS", cursive'],
  },
  {
    label: 'Mono',
    fonts: ['"Courier New", Courier, monospace'],
  },
]

const FONT_GROUPS: { label: string; fonts: string[] }[] = SYSTEM_GROUPS.map(group => {
  const studio = STUDIO_FONTS.filter(font => font.group === group.label).map(font => font.stack)
  const fonts =
    group.label === 'Popular' && group.fonts[0]
      ? [group.fonts[0], ...studio, ...group.fonts.slice(1)]
      : [...studio, ...group.fonts]
  return { label: group.label, fonts }
})

function fontLabel(family: string): string {
  if (family === 'Arial, Helvetica, sans-serif') return 'Arial (default)'
  const studio = STUDIO_FONTS.find(font => font.stack === family)
  if (studio) return studio.label
  return FONT_LABELS[family as FontFamily] ?? family.split(',')[0]?.replace(/"/g, '') ?? 'Font'
}

export function FontPicker({ value, onChange, className }: FontPickerProps) {
  useLayoutEffect(() => {
    ensureStudioFonts()
  }, [])

  const grouped = new Set(FONT_GROUPS.flatMap(group => group.fonts))
  const ungrouped = FONT_FAMILIES.filter(family => !grouped.has(family))

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" className={className}>
        <SelectValue placeholder="Font">
          <span style={{ fontFamily: value }}>{fontLabel(value)}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[min(28rem,70vh)] min-w-52">
        {FONT_GROUPS.map(group => (
          <SelectGroup key={group.label}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.fonts.map(family => (
              <SelectItem key={family} value={family} style={{ fontFamily: family }}>
                {fontLabel(family)}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
        {ungrouped.length > 0 ? (
          <SelectGroup>
            <SelectLabel>More</SelectLabel>
            {ungrouped.map(family => (
              <SelectItem key={family} value={family} style={{ fontFamily: family }}>
                {fontLabel(family)}
              </SelectItem>
            ))}
          </SelectGroup>
        ) : null}
      </SelectContent>
    </Select>
  )
}
