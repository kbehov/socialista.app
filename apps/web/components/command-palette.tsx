'use client'

import { getGenerationTitle } from '@/components/generations/generation-meta'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import {
  COMMAND_PALETTE_SECTIONS,
  commandPaletteSearchValue,
  type CommandPaletteItem,
} from '@/lib/command-palette/items'
import { getGenerationHref, getGenerationKindLabel } from '@/lib/generation-href'
import { resolveGeneratedImagePreviewUrl } from '@/lib/image-generation/preview'
import { cn } from '@/lib/utils'
import { getWorkspaceGenerations } from '@/services/generation.service'
import { getProjectId, useProjectStore } from '@/store/project.store'
import { getWorkspaceId, useWorkspaceStore } from '@/store/workspace.store'
import type { Generation } from '@socialista/types'
import { CornerDownLeftIcon, ImageIcon, ImagesIcon, SearchIcon, VideoIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

type CommandPaletteProps = {
  className?: string
}

const paletteDialogClassName = cn(
  'top-[18%] max-w-xl overflow-hidden rounded-[1.25rem] !border-border/40 !bg-background p-0 sm:max-w-xl',
  'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_16px_-8px_rgba(0,0,0,0.08),0_32px_64px_-24px_rgba(0,0,0,0.2)]',
  'dark:border-border/50',
  'dark:shadow-[0_1px_2px_rgba(0,0,0,0.35),0_12px_24px_-10px_rgba(0,0,0,0.4),0_36px_72px_-24px_rgba(0,0,0,0.6)]',
)

const paletteCommandClassName = cn(
  '!rounded-none !border-0 !bg-transparent !p-0 text-foreground shadow-none',
  '**:data-[slot=command-input-wrapper]:border-b **:data-[slot=command-input-wrapper]:border-border/35',
  '**:data-[slot=command-input-wrapper]:px-3.5 **:data-[slot=command-input-wrapper]:py-3',
  '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:h-9',
  '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:rounded-none',
  '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:border-0',
  '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:bg-transparent',
  '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:shadow-none',
  '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:ring-0',
  '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:has-[[data-slot=command-input]:focus-visible]:border-0',
  '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:has-[[data-slot=command-input]:focus-visible]:bg-transparent',
  '**:data-[slot=command-input-wrapper]:[&_[data-slot=input-group]]:has-[[data-slot=command-input]:focus-visible]:ring-0',
)

const paletteGroupClassName = cn(
  '!p-0',
  '**:[[cmdk-group-heading]]:px-2.5 **:[[cmdk-group-heading]]:pt-3 **:[[cmdk-group-heading]]:pb-1',
  '**:[[cmdk-group-heading]]:text-[10px] **:[[cmdk-group-heading]]:font-medium',
  '**:[[cmdk-group-heading]]:tracking-[0.06em] **:[[cmdk-group-heading]]:text-muted-foreground/55',
  '**:[[cmdk-group-heading]]:uppercase',
)

const paletteItemClassName = cn(
  'gap-3 rounded-lg px-2.5 py-2',
  '!border-0 !bg-transparent !shadow-none',
  'transition-[background-color,color] duration-150',
  '!data-selected:bg-foreground/[0.05] !data-selected:text-foreground',
  'data-selected:**:[svg]:text-foreground/65',
  '[&>svg:last-child]:hidden',
)

const paletteShortcutClassName = cn(
  'gap-1 text-[11px] font-medium tracking-[-0.01em] text-foreground/40',
  'group-data-selected/command-item:text-foreground/50',
)

function isApplePlatform() {
  if (typeof navigator === 'undefined') return true
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? navigator.userAgent)
}

function generationThumbUrl(generation: Generation): string | undefined {
  const result = generation.result
  if (!result) return undefined

  const type = result.type ?? (generation.kind === 'video' ? 'video' : 'image')
  const raw = type === 'video' ? result.thumbnailUrl : (result.urls?.[0] ?? result.url)
  if (!raw || !/^https?:\/\//.test(raw)) return undefined

  return type === 'video' ? raw : resolveGeneratedImagePreviewUrl(raw)
}

function GenerationThumb({ generation }: { generation: Generation }) {
  const imageSrc = generationThumbUrl(generation)
  const type = generation.result?.type ?? (generation.kind === 'video' ? 'video' : 'image')

  if (imageSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote generation URLs vary by provider
      <img src={imageSrc} alt="" className="size-full object-cover" />
    )
  }

  return (
    <span className="flex size-full items-center justify-center text-foreground/45">
      {type === 'video' ? (
        <VideoIcon className="size-3.5" strokeWidth={1.5} />
      ) : generation.kind === 'slideshow' ? (
        <ImagesIcon className="size-3.5" strokeWidth={1.5} />
      ) : (
        <ImageIcon className="size-3.5" strokeWidth={1.5} />
      )}
    </span>
  )
}

function PaletteItemRow({ item }: { item: CommandPaletteItem }) {
  const Icon = item.icon

  return (
    <>
      <Icon className="size-4 shrink-0 text-foreground/45" strokeWidth={1.5} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium tracking-[-0.01em] text-foreground">
          {item.title}
        </span>
        <span className="mt-0.5 block truncate text-[11px] leading-tight text-muted-foreground/75">
          {item.subtitle}
        </span>
      </span>
      <CommandShortcut className={cn('hidden sm:inline-flex', paletteShortcutClassName)}>
        <span>Open</span>
        <CornerDownLeftIcon className="size-3" strokeWidth={1.5} />
      </CommandShortcut>
    </>
  )
}

export function CommandPalette({ className }: CommandPaletteProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [recentGenerations, setRecentGenerations] = useState<Generation[]>([])
  const [loadingRecent, setLoadingRecent] = useState(false)
  const workspaceId = useWorkspaceStore(state => getWorkspaceId(state.currentWorkspace))
  const projectId = useProjectStore(state => getProjectId(state.currentProject))
  const showAppleShortcut = isApplePlatform()

  const runCommand = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router],
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(current => !current)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!open || !workspaceId) return

    let cancelled = false
    setLoadingRecent(true)

    void getWorkspaceGenerations(workspaceId, {
      limit: 5,
      sort: '-createdAt',
      projectId,
    })
      .then(response => {
        if (cancelled) return
        setRecentGenerations(response.data?.generations ?? [])
      })
      .finally(() => {
        if (!cancelled) setLoadingRecent(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, projectId, workspaceId])

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn('dashboard-header-search', className)}
            aria-label="Search tools and routes"
          >
            <SearchIcon className="size-3.5 shrink-0 opacity-45" strokeWidth={1.75} />
            <span className="min-w-0 flex-1 truncate text-left">Search everything...</span>
            <span className="hidden shrink-0 items-center gap-0.5 sm:inline-flex" aria-hidden>
              <kbd className="dashboard-header-search-kbd">{showAppleShortcut ? '⌘' : 'Ctrl'}</kbd>
              <kbd className="dashboard-header-search-kbd">K</kbd>
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={6}>
          Search{showAppleShortcut ? ' · ⌘K' : ' · Ctrl+K'}
        </TooltipContent>
      </Tooltip>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Jump to studio tools, routes, and recent generations"
        className={paletteDialogClassName}
        showCloseButton={false}
      >
        <Command className={paletteCommandClassName}>
          <CommandInput
            placeholder="Search tools, routes, generations..."
            className="text-[13px] tracking-[-0.012em] placeholder:text-muted-foreground/50"
          />
          <CommandList className="max-h-[min(22rem,52vh)] scroll-py-1.5 px-2 py-2">
            <CommandEmpty className="py-10 text-[13px] text-muted-foreground/75">
              No results found.
            </CommandEmpty>

            {COMMAND_PALETTE_SECTIONS.map(section => (
              <CommandGroup key={section.heading} heading={section.heading} className={paletteGroupClassName}>
                {section.items.map(item => (
                  <CommandItem
                    key={item.id}
                    value={commandPaletteSearchValue(item)}
                    onSelect={() => runCommand(item.href)}
                    className={paletteItemClassName}
                  >
                    <PaletteItemRow item={item} />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}

            {(loadingRecent || recentGenerations.length > 0) && (
              <CommandGroup heading="Recent" className={paletteGroupClassName}>
                {loadingRecent && recentGenerations.length === 0 ? (
                  <div className="px-2.5 py-3 text-[12px] text-muted-foreground/70">
                    Loading recent generations…
                  </div>
                ) : null}

                {recentGenerations.map(generation => {
                  const title = getGenerationTitle(generation.prompt, generation.kind)
                  const subtitle = getGenerationKindLabel(generation.kind)
                  const href = getGenerationHref(generation)

                  return (
                    <CommandItem
                      key={generation._id}
                      value={[title, subtitle, generation.prompt, generation.kind, 'recent'].join(' ')}
                      onSelect={() => runCommand(href)}
                      className={paletteItemClassName}
                    >
                      <span className="size-8 shrink-0 overflow-hidden rounded-md">
                        <GenerationThumb generation={generation} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium tracking-[-0.01em] text-foreground">
                          {title}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] leading-tight text-muted-foreground/75">
                          {subtitle}
                        </span>
                      </span>
                      <CommandShortcut className={cn('hidden sm:inline-flex', paletteShortcutClassName)}>
                        <span>Open</span>
                        <CornerDownLeftIcon className="size-3" strokeWidth={1.5} />
                      </CommandShortcut>
                    </CommandItem>
                  )
                })}

                {!loadingRecent && recentGenerations.length > 0 ? (
                  <CommandItem
                    value="all generations history recent runs"
                    onSelect={() => runCommand(DASHBOARD_ROUTES.GENERATIONS)}
                    className={cn(paletteItemClassName, 'text-muted-foreground/75')}
                  >
                    <span className="min-w-0 flex-1 px-1 text-[12px]">View all generations</span>
                  </CommandItem>
                ) : null}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
