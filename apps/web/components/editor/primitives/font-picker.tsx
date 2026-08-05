'use client'

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

type FontPickerProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

const FONT_GROUPS: { label: string; fonts: FontFamily[] }[] = [
  {
    label: 'Popular',
    fonts: [
      'Arial, Helvetica, sans-serif',
      'Impact, Haettenschweiler, sans-serif',
      'Inter, system-ui, sans-serif',
      'Helvetica, Arial, sans-serif',
      '"Arial Black", Gadget, sans-serif',
    ],
  },
  {
    label: 'Sans serif',
    fonts: [
      'Verdana, Geneva, sans-serif',
      '"Trebuchet MS", Helvetica, sans-serif',
      '"Segoe UI", Tahoma, sans-serif',
      'system-ui, sans-serif',
    ],
  },
  {
    label: 'Serif & mono',
    fonts: [
      'Georgia, serif',
      '"Times New Roman", Times, serif',
      '"Courier New", Courier, monospace',
    ],
  },
  {
    label: 'Display',
    fonts: ['"Comic Sans MS", cursive'],
  },
]

function fontLabel(family: FontFamily): string {
  if (family === 'Arial, Helvetica, sans-serif') return 'Arial (default)'
  return FONT_LABELS[family]
}

export function FontPicker({ value, onChange, className }: FontPickerProps) {
  const grouped = new Set(FONT_GROUPS.flatMap(group => group.fonts))
  const ungrouped = FONT_FAMILIES.filter(family => !grouped.has(family))

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" className={className}>
        <SelectValue placeholder="Font">
          {FONT_LABELS[value as FontFamily] ?? value.split(',')[0]?.replace(/"/g, '') ?? 'Font'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-72">
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
