'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { StaticAdTemplateCategoryDto } from '@socialista/types'
import { Loader2Icon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

type StaticAdTemplatesToolbarProps = {
  category?: string
  categories: StaticAdTemplateCategoryDto[]
  total: number
}

export function StaticAdTemplatesToolbar({ category, categories, total }: StaticAdTemplatesToolbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const navigate = (next: { category?: string | null }) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')

    if (next.category === null) {
      params.delete('category')
    } else if (next.category) {
      params.set('category', next.category)
    }

    const query = params.toString()
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }

  return (
    <div className={cn('flex flex-col gap-3', isPending && 'pointer-events-none opacity-60')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isPending && <Loader2Icon className="size-3.5 animate-spin" />}
          <span className="tabular-nums">
            {total} {total === 1 ? 'template' : 'templates'}
          </span>
          {category ? (
            <>
              <span aria-hidden className="text-border">
                ·
              </span>
              <button
                type="button"
                onClick={() => navigate({ category: null })}
                className="text-foreground/80 underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Clear
              </button>
            </>
          ) : null}
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={category ? 'outline' : 'default'}
            className="h-7 rounded-full px-2.5 text-xs"
            onClick={() => navigate({ category: null })}
          >
            All
          </Button>
          {categories.map(item => {
            const selected = category === item.name
            return (
              <Button
                key={item._id}
                type="button"
                size="sm"
                variant={selected ? 'default' : 'outline'}
                className="h-7 rounded-full px-2.5 text-xs"
                onClick={() => navigate({ category: item.name })}
              >
                {item.name}
                <span className="text-[11px] opacity-70">{item.templatesCount}</span>
              </Button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
