'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { deleteInfluencer, getWorkspaceInfluencers } from '@/services/influencer.service'
import type { Influencer } from '@socialista/types'
import { PlusIcon, SearchIcon, SparklesIcon, UserRoundIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDeferredValue, useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

type InfluencerListProps = {
  workspaceId: string
  initialInfluencers: Influencer[]
  initialError?: string | null
}

export function InfluencerList({
  workspaceId,
  initialInfluencers,
  initialError = null,
}: InfluencerListProps) {
  const router = useRouter()
  const [influencers, setInfluencers] = useState(initialInfluencers)
  const [error, setError] = useState(initialError)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    const query = deferredSearch.trim()
    const handle = window.setTimeout(() => {
      startTransition(async () => {
        const response = await getWorkspaceInfluencers(workspaceId, {
          query: query || undefined,
          sort: 'newest',
          limit: 48,
        })
        if (!response.success) {
          setError(response.message ?? 'Failed to load influencers')
          return
        }
        setError(null)
        setInfluencers(response.data?.influencers ?? [])
      })
    }, 250)

    return () => window.clearTimeout(handle)
  }, [deferredSearch, workspaceId])

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return
    const response = await deleteInfluencer(id)
    if (!response.success) {
      toast.error(response.message ?? 'Failed to delete')
      return
    }
    setInfluencers(prev => prev.filter(i => i._id !== id))
    toast.success('Influencer deleted')
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-balance text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.03em] text-foreground sm:text-[2rem]">
              AI Influencers
            </h1>
            <p className="mt-1.5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Consistent characters for image and video — search by name anytime.
            </p>
          </div>
          <Button asChild className="h-10 rounded-xl">
            <Link href={DASHBOARD_ROUTES.STUDIO.INFLUENCER_CREATE}>
              <PlusIcon className="size-4" strokeWidth={1.75} />
              Create influencer
            </Link>
          </Button>
        </div>

        <div className="relative mt-8 max-w-md">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="h-10 rounded-xl pl-9"
            aria-label="Search influencers by name"
          />
        </div>

        {error ? (
          <p className="mt-8 text-sm text-destructive">{error}</p>
        ) : influencers.length === 0 ? (
          <EmptyState searching={Boolean(deferredSearch.trim())} />
        ) : (
          <ul
            className={cn(
              'mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
              pending && 'opacity-70 transition-opacity',
            )}
          >
            {influencers.map(influencer => (
              <li key={influencer._id}>
                <article className="group overflow-hidden rounded-2xl ring-1 ring-border/40 transition-shadow hover:shadow-sm">
                  <button
                    type="button"
                    className="block w-full text-left"
                    onClick={() => router.push(DASHBOARD_ROUTES.STUDIO.influencer(influencer._id))}
                  >
                    <div className="relative aspect-4/5 bg-muted/30">
                      {influencer.coverImageUrl ? (
                        <Image
                          src={influencer.coverImageUrl}
                          alt={influencer.name}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 25vw"
                        />
                      ) : (
                        <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                          {influencer.status === 'generating' ? (
                            <>
                              <SparklesIcon className="size-6 animate-pulse" strokeWidth={1.5} />
                              <span className="text-xs">Generating…</span>
                            </>
                          ) : (
                            <UserRoundIcon className="size-8 opacity-40" strokeWidth={1.5} />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5 p-3.5">
                      <h2 className="truncate text-[14px] font-semibold tracking-[-0.02em]">
                        {influencer.name}
                      </h2>
                      <p className="truncate text-xs text-muted-foreground capitalize">
                        {influencer.status}
                        {influencer.niche[0] ? ` · ${influencer.niche[0]}` : ''}
                      </p>
                    </div>
                  </button>
                  <div className="border-t border-border/40 px-3.5 py-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(influencer._id, influencer.name)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function EmptyState({ searching }: { searching: boolean }) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted/40 ring-1 ring-border/40">
        <UserRoundIcon className="size-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h2 className="text-[15px] font-semibold tracking-[-0.02em]">
        {searching ? 'No matches' : 'No influencers yet'}
      </h2>
      <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
        {searching
          ? 'Try a different name.'
          : 'Create a reusable AI character with a consistent look across generations.'}
      </p>
      {!searching ? (
        <Button asChild className="mt-5 rounded-xl">
          <Link href={DASHBOARD_ROUTES.STUDIO.INFLUENCER_CREATE}>Create influencer</Link>
        </Button>
      ) : null}
    </div>
  )
}
