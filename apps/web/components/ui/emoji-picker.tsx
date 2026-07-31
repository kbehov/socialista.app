'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  EMOJI_CATEGORIES,
  EMOJI_CATEGORY_ICONS,
  type EmojiCategoryId,
  type EmojiItem,
  loadRecentEmojis,
  saveRecentEmoji,
  searchEmojis,
} from '@/constants/emoji-data'
import { cn } from '@/lib/utils'
import { commitHaptic } from '@/utils/haptics'
import {
  ClockIcon,
  SearchIcon,
  SmileIcon,
  XIcon,
} from 'lucide-react'
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type EmojiPickerProps = {
  onEmojiSelect: (emoji: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: ReactNode
  closeOnSelect?: boolean
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  disabled?: boolean
  className?: string
}

const CATEGORY_ORDER: Exclude<EmojiCategoryId, 'recent'>[] = [
  'smileys',
  'people',
  'animals',
  'food',
  'travel',
  'activities',
  'objects',
  'symbols',
  'flags',
]

function EmojiButton({
  item,
  onSelect,
}: {
  item: EmojiItem
  onSelect: (item: EmojiItem) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={cn(
        'flex size-8 items-center justify-center rounded-lg text-[1.35rem] leading-none',
        'transition-[transform,background-color] duration-100 ease-out',
        'hover:bg-muted active:scale-90',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
      )}
      aria-label={item.keywords[0] ?? 'emoji'}
    >
      {item.char}
    </button>
  )
}

function EmojiGrid({
  items,
  keyPrefix,
  onSelect,
  emptyMessage = 'No emojis found',
}: {
  items: EmojiItem[]
  keyPrefix: string
  onSelect: (item: EmojiItem) => void
  emptyMessage?: string
}) {
  if (items.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center px-4 text-center text-xs text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-8 gap-0.5 p-2">
      {items.map((item, index) => (
        <EmojiButton
          key={`${keyPrefix}-${index}-${item.char}`}
          item={item}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export function EmojiPickerContent({
  onEmojiSelect,
  className,
}: {
  onEmojiSelect: (emoji: string) => void
  className?: string
}) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<EmojiCategoryId>('smileys')
  const [recentEmojis, setRecentEmojis] = useState<EmojiItem[]>(() =>
    typeof window === 'undefined' ? [] : loadRecentEmojis(),
  )
  const sectionRefs = useRef<Partial<Record<EmojiCategoryId, HTMLDivElement | null>>>({})
  const scrollRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const searchResults = useMemo(
    () => (query.trim() ? searchEmojis(query, recentEmojis) : []),
    [query, recentEmojis],
  )

  const handleSelect = useCallback(
    (item: EmojiItem) => {
      commitHaptic({ vibrateDuration: 8 })
      saveRecentEmoji(item)
      setRecentEmojis(loadRecentEmojis())
      onEmojiSelect(item.char)
    },
    [onEmojiSelect],
  )

  const scrollToCategory = useCallback((categoryId: EmojiCategoryId) => {
    setActiveCategory(categoryId)
    setQuery('')
    const section = sectionRefs.current[categoryId]
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const isSearching = query.trim().length > 0

  return (
    <div className={cn('flex w-[min(20rem,calc(100vw-2rem))] flex-col', className)}>
      <div className="border-b border-border/60 p-2">
        <div className="relative">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
          <Input
            ref={searchInputRef}
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search emojis…"
            className="h-8 rounded-lg border-border/60 bg-muted/30 pr-8 pl-8 text-xs shadow-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                searchInputRef.current?.focus()
              }}
              className="absolute top-1/2 right-2 flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <XIcon className="size-3" strokeWidth={2} />
            </button>
          ) : null}
        </div>
      </div>

      {!isSearching ? (
        <div className="flex items-center gap-0.5 overflow-x-auto border-b border-border/60 px-2 py-1.5 scrollbar-none [&::-webkit-scrollbar]:hidden">
          {recentEmojis.length > 0 ? (
            <button
              type="button"
              onClick={() => scrollToCategory('recent')}
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-md text-sm transition-colors',
                activeCategory === 'recent'
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
              aria-label="Recent"
              title="Recent"
            >
              <ClockIcon className="size-3.5" strokeWidth={1.75} />
            </button>
          ) : null}
          {CATEGORY_ORDER.map(categoryId => (
            <button
              key={categoryId}
              type="button"
              onClick={() => scrollToCategory(categoryId)}
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-md text-sm transition-colors',
                activeCategory === categoryId
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
              aria-label={EMOJI_CATEGORIES.find(c => c.id === categoryId)?.label}
              title={EMOJI_CATEGORIES.find(c => c.id === categoryId)?.label}
            >
              {EMOJI_CATEGORY_ICONS[categoryId]}
            </button>
          ))}
        </div>
      ) : null}

      <ScrollArea className="h-[min(16rem,40vh)]" scrollFade>
        <div ref={scrollRef}>
          {isSearching ? (
            <EmojiGrid
              items={searchResults}
              keyPrefix="search"
              onSelect={handleSelect}
              emptyMessage={`No results for "${query.trim()}"`}
            />
          ) : (
            <div className="space-y-1 pb-2">
              {recentEmojis.length > 0 ? (
                <div
                  ref={node => {
                    sectionRefs.current.recent = node
                  }}
                  className="scroll-mt-1"
                >
                  <p className="px-3 pt-2 pb-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Recent
                  </p>
                  <EmojiGrid items={recentEmojis} keyPrefix="recent" onSelect={handleSelect} />
                </div>
              ) : null}
              {EMOJI_CATEGORIES.map(category => (
                <div
                  key={category.id}
                  ref={node => {
                    sectionRefs.current[category.id] = node
                  }}
                  className="scroll-mt-1"
                >
                  <p className="px-3 pt-2 pb-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    {category.label}
                  </p>
                  <EmojiGrid
                    items={category.emojis}
                    keyPrefix={category.id}
                    onSelect={handleSelect}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export function EmojiPicker({
  onEmojiSelect,
  open,
  onOpenChange,
  children,
  closeOnSelect = true,
  side = 'top',
  align = 'start',
  disabled,
  className,
}: EmojiPickerProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  const handleSelect = useCallback(
    (emoji: string) => {
      onEmojiSelect(emoji)
      if (closeOnSelect) setOpen(false)
    },
    [closeOnSelect, onEmojiSelect, setOpen],
  )

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {children ?? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            className={cn(
              'h-8 gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground hover:text-foreground active:scale-[0.98]',
              className,
            )}
            aria-label="Insert emoji"
          >
            <SmileIcon className="size-3.5" strokeWidth={1.75} />
            Emoji
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={8}
        className="w-auto overflow-hidden p-0"
        onOpenAutoFocus={event => event.preventDefault()}
      >
        <EmojiPickerContent onEmojiSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  )
}

export function EmojiPickerIconButton({
  onEmojiSelect,
  disabled,
  className,
  ...props
}: Omit<EmojiPickerProps, 'children'> & { className?: string }) {
  return (
    <EmojiPicker
      onEmojiSelect={onEmojiSelect}
      disabled={disabled}
      className={className}
      {...props}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        className={cn(
          'size-8 rounded-full text-muted-foreground hover:text-foreground active:scale-[0.96]',
          className,
        )}
        aria-label="Insert emoji"
      >
        <SmileIcon className="size-3.5" strokeWidth={1.75} />
      </Button>
    </EmojiPicker>
  )
}
