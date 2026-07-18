'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type LanguageOption = {
  code: string
  label: string
  nativeLabel?: string
  flag?: string
}

export const DEFAULT_AD_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'bg', label: 'Bulgarian', nativeLabel: 'Български', flag: '🇧🇬' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', flag: '🇵🇹' },
  { code: 'pl', label: 'Polish', nativeLabel: 'Polski', flag: '🇵🇱' },
  { code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands', flag: '🇳🇱' },
  { code: 'ro', label: 'Romanian', nativeLabel: 'Română', flag: '🇷🇴' },
  { code: 'el', label: 'Greek', nativeLabel: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', flag: '🇸🇦' },
  { code: 'sv', label: 'Swedish', nativeLabel: 'Svenska', flag: '🇸🇪' },
  { code: 'no', label: 'Norwegian', nativeLabel: 'Norsk', flag: '🇳🇴' },
  { code: 'da', label: 'Danish', nativeLabel: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', label: 'Finnish', nativeLabel: 'Suomi', flag: '🇫🇮' },
  { code: 'cs', label: 'Czech', nativeLabel: 'Čeština', flag: '🇨🇿' },
  { code: 'hu', label: 'Hungarian', nativeLabel: 'Magyar', flag: '🇭🇺' },
  { code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', flag: '🇹🇷' },
  { code: 'he', label: 'Hebrew', nativeLabel: 'עברית', flag: '🇮🇱' },
]

export const DEFAULT_AD_LANGUAGE = 'en'

export function getLanguageLabel(code: string, languages = DEFAULT_AD_LANGUAGES): string {
  return languages.find(lang => lang.code === code)?.label ?? code
}

type LanguageSelectorProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'default'
  languages?: LanguageOption[]
}

export function LanguageSelector({
  value,
  onChange,
  disabled,
  className,
  size = 'sm',
  languages = DEFAULT_AD_LANGUAGES,
}: LanguageSelectorProps) {
  const selected = languages.find(lang => lang.code === value)

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        size={size}
        className={cn(
          'h-7 gap-1 rounded-lg border-border/50 bg-background/90 px-2 shadow-xs',
          'hover:border-border hover:bg-background',
          className,
        )}
        aria-label="Ad copy language"
      >
        <SelectValue>
          <span className="flex items-center gap-1.5">
            {selected?.flag ? (
              <span className="text-sm leading-none" aria-hidden>
                {selected.flag}
              </span>
            ) : null}
            <span className="truncate text-xs font-medium">{selected?.label ?? value}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {languages.map(lang => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              {lang.flag ? (
                <span className="text-sm leading-none" aria-hidden>
                  {lang.flag}
                </span>
              ) : null}
              <span>{lang.label}</span>
              {lang.nativeLabel && lang.nativeLabel !== lang.label ? (
                <span className="text-muted-foreground">({lang.nativeLabel})</span>
              ) : null}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
