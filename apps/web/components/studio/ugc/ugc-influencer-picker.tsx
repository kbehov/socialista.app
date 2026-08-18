'use client'

import { DashboardSegment, DashboardSegmentButton, dashboardSurface } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { exploreInfluencers, getWorkspaceInfluencers } from '@/services/influencer.service'
import { useUgcProjectStore } from '@/store/ugc-project.store'
import type { Influencer } from '@socialista/types'
import { CheckIcon, CompassIcon, Loader2Icon, PlusIcon, SearchIcon, UserRoundIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

type Tab = 'mine' | 'explore'

function coverUrl(influencer: Influencer) {
  return influencer.coverImageUrl || influencer.galleryImageUrls[0]
}

function InfluencerPickCard({
  influencer,
  selected,
  disabled,
  onToggle,
}: {
  influencer: Influencer
  selected: boolean
  disabled?: boolean
  onToggle: () => void
}) {
  const src = coverUrl(influencer)

  return (
    <button
      type="button"
      disabled={disabled && !selected}
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        'group flex min-w-0 flex-col overflow-hidden rounded-xl border bg-background text-left transition',
        selected ? 'border-foreground/30 shadow-sm' : 'border-border/55 hover:border-border hover:shadow-sm',
        disabled && !selected && 'opacity-50',
      )}
    >
      <span className="relative aspect-[3/4] w-full overflow-hidden bg-muted/30">
        {src ? (
          <Image alt="" aria-hidden className="object-cover" fill sizes="160px" src={src} unoptimized />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <UserRoundIcon className="size-6" strokeWidth={1.5} />
          </span>
        )}
        {selected ? (
          <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-foreground text-background">
            <CheckIcon className="size-3.5" strokeWidth={2.5} />
          </span>
        ) : null}
      </span>
      <span className="truncate px-2.5 py-2 text-[13px] font-medium">{influencer.name}</span>
    </button>
  )
}

type UgcInfluencerPickerProps = {
  workspaceId: string
  selectedIds: string[]
  disabled?: boolean
  max?: number
  onChange: (ids: string[]) => void
}

export function UgcInfluencerPicker({
  workspaceId,
  selectedIds,
  disabled,
  max = 1,
  onChange,
}: UgcInfluencerPickerProps) {
  const influencersById = useUgcProjectStore(s => s.influencersById)
  const cacheInfluencers = useUgcProjectStore(s => s.cacheInfluencers)
  const ensureInfluencer = useUgcProjectStore(s => s.ensureInfluencer)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('mine')
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = { query: query.trim() || undefined, limit: 24, status: 'ready' as const, sort: 'newest' as const }
    const response =
      tab === 'explore' ? await exploreInfluencers(params) : await getWorkspaceInfluencers(workspaceId, params)
    setLoading(false)
    if (!response.success) {
      toast.error(response.message ?? 'Failed to load creators')
      return
    }
    setItems(response.data?.influencers ?? [])
    cacheInfluencers(response.data?.influencers ?? [])
  }, [cacheInfluencers, query, tab, workspaceId])

  useEffect(() => {
    if (!open) return
    const timeout = window.setTimeout(() => {
      void load()
    }, 200)
    return () => window.clearTimeout(timeout)
  }, [load, open])

  const selectedKey = selectedIds.join(',')
  useEffect(() => {
    if (!selectedKey) return
    for (const id of selectedKey.split(',')) {
      void ensureInfluencer(id)
    }
  }, [ensureInfluencer, selectedKey])

  const selected = selectedIds
    .map(id => influencersById[id])
    .filter((item): item is Influencer => Boolean(item))

  const toggle = (influencer: Influencer) => {
    cacheInfluencers([influencer])
    const exists = selectedIds.includes(influencer._id)
    if (exists) {
      onChange(selected.filter(item => item._id !== influencer._id).map(item => item._id))
      return
    }
    if (max <= 1) {
      onChange([influencer._id])
      setOpen(false)
      return
    }
    if (selectedIds.length >= max) {
      toast.error(`You can pick up to ${max} creators`)
      return
    }
    onChange([...selectedIds, influencer._id])
  }

  return (
    <section className={dashboardSurface.section}>
      <div className={cn(dashboardSurface.sectionHeader, 'flex items-center justify-between px-4 py-3')}>
        <div>
          <h2 className={dashboardSurface.sectionTitle}>Creator</h2>
          <p className={dashboardSurface.sectionDescription}>
            Same creator on every clip in this campaign.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => setOpen(true)}>
          <PlusIcon className="size-3.5" />
          Pick
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto p-4">
        {selected.length === 0 ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(true)}
            className={cn(dashboardSurface.insetDashed, 'flex h-28 w-20 shrink-0 flex-col items-center justify-center gap-1')}
          >
            <UserRoundIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-[11px] text-muted-foreground">Add</span>
          </button>
        ) : (
          selected.map(influencer => {
            const src = coverUrl(influencer)
            return (
              <div key={influencer._id} className="relative w-20 shrink-0">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted ring-1 ring-border/60">
                  {src ? (
                    <Image alt={influencer.name} className="object-cover" fill sizes="80px" src={src} unoptimized />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <UserRoundIcon className="size-5 text-muted-foreground" />
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-[11px] font-medium">{influencer.name}</p>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={disabled}
                  className="absolute -top-1 -right-1 size-6 rounded-full bg-background shadow-xs ring-1 ring-border/60"
                  aria-label={`Remove ${influencer.name}`}
                  onClick={() => toggle(influencer)}
                >
                  <XIcon className="size-3" />
                </Button>
              </div>
            )
          })
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pick a creator</DialogTitle>
            <DialogDescription>This person appears in every clip. Keep them consistent.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <DashboardSegment label="Creator library">
                <DashboardSegmentButton active={tab === 'mine'} onClick={() => setTab('mine')}>
                  Mine
                </DashboardSegmentButton>
                <DashboardSegmentButton active={tab === 'explore'} onClick={() => setTab('explore')}>
                  <CompassIcon className="size-3" />
                  Explore
                </DashboardSegmentButton>
              </DashboardSegment>
              <div className="relative min-w-0 flex-1">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search"
                  className="h-8 pl-8"
                />
              </div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2Icon className="size-5 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No ready creators yet.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {items.map(influencer => (
                    <InfluencerPickCard
                      key={influencer._id}
                      influencer={influencer}
                      selected={selectedIds.includes(influencer._id)}
                      disabled={max > 1 && selectedIds.length >= max && !selectedIds.includes(influencer._id)}
                      onToggle={() => toggle(influencer)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
