'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FONT_FAMILIES } from '@/lib/carousel/defaults'

type FontPickerProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

const LABELS: Record<string, string> = {
  'Inter, system-ui, sans-serif': 'Inter',
  'Georgia, serif': 'Georgia',
  '"Times New Roman", serif': 'Times New Roman',
  'Arial, sans-serif': 'Arial',
  '"Courier New", monospace': 'Courier New',
  'Impact, sans-serif': 'Impact',
  '"Comic Sans MS", cursive': 'Comic Sans',
}

export function FontPicker({ value, onChange, className }: FontPickerProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" className={className}>
        <SelectValue placeholder="Font" />
      </SelectTrigger>
      <SelectContent>
        {FONT_FAMILIES.map(family => (
          <SelectItem key={family} value={family} style={{ fontFamily: family }}>
            {LABELS[family] ?? family}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
