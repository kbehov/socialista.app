'use client'

import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { StaticAdTemplateCard } from '@/components/studio/static-ads/templates/static-ad-template-card'
import { StaticAdTemplatePreviewDialog } from '@/components/studio/static-ads/templates/static-ad-template-preview-dialog'
import { useStaticAdStudio } from '@/components/studio/static-ads/static-ad-studio-provider'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '@/components/ui/carousel'
import { STATIC_AD_TEMPLATE_PAGE_SIZE } from '@/lib/studio/static-ads/recreate-prompt'
import { cn } from '@/lib/utils'
import { getStaticAdTemplateCategories, getStaticAdTemplates } from '@/services/static-ad-templates.service'
import type { StaticAdTemplateCategoryDto, StaticAdTemplateDto } from '@socialista/types'
import { ChevronLeftIcon, ChevronRightIcon, LayoutTemplateIcon, Loader2Icon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

const SCROLL_TARGET_ID = 'dashboard-scroll'

function ScrollLoader() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2Icon className="size-4 animate-spin text-black/44 dark:text-white/44" />
    </div>
  )
}

function CategoryCarouselNav() {
  const { canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useCarousel()

  if (!canScrollPrev && !canScrollNext) return null

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        aria-label="Scroll categories left"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded-full',
          'text-black/56 ring-1 ring-black/10 dark:text-white/56 dark:ring-white/12',
          'transition-[color,background-color,opacity] duration-150 ease-out',
          'hover:bg-black/[0.05] hover:text-black dark:hover:bg-white/[0.08] dark:hover:text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
          'disabled:pointer-events-none disabled:opacity-30',
        )}
      >
        <ChevronLeftIcon className="size-3.5" strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="Scroll categories right"
        disabled={!canScrollNext}
        onClick={scrollNext}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded-full',
          'text-black/56 ring-1 ring-black/10 dark:text-white/56 dark:ring-white/12',
          'transition-[color,background-color,opacity] duration-150 ease-out',
          'hover:bg-black/[0.05] hover:text-black dark:hover:bg-white/[0.08] dark:hover:text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
          'disabled:pointer-events-none disabled:opacity-30',
        )}
      >
        <ChevronRightIcon className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  )
}

type TemplateCategoryFilterProps = {
  categories: StaticAdTemplateCategoryDto[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  disabled?: boolean
}

function TemplateCategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  disabled,
}: TemplateCategoryFilterProps) {
  if (categories.length === 0) return null

  return (
    <Carousel
      className="w-full min-w-0"
      opts={{
        align: 'start',
        dragFree: true,
        containScroll: 'trimSnaps',
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-medium tracking-[-0.02em] text-foreground">Templates</h2>
        <CategoryCarouselNav />
      </div>

      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-linear-to-r from-background to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-linear-to-l from-background to-transparent"
        />

        <CarouselContent className="ml-0" role="tablist" aria-label="Template categories">
          <CarouselItem className="basis-auto self-stretch pl-0.5">
            <button
              type="button"
              role="tab"
              aria-selected={selectedCategory === null}
              disabled={disabled}
              onClick={() => onCategoryChange(null)}
              className={cn(
                'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-2.5',
                'text-[13px] font-medium leading-none tracking-[-0.015em]',
                'transition-[background-color,color,box-shadow] duration-150 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
                'active:scale-[0.97] motion-reduce:active:scale-100',
                'disabled:pointer-events-none disabled:opacity-50',
                selectedCategory === null
                  ? 'bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                  : 'text-black/64 hover:bg-black/[0.05] hover:text-foreground dark:text-white/64 dark:hover:bg-white/[0.08]',
              )}
            >
              All
            </button>
          </CarouselItem>

          {categories.map((category, index) => {
            const active = selectedCategory === category.name

            return (
              <CarouselItem
                key={category._id}
                className={cn('basis-auto self-stretch pl-0', index >= 0 && 'pl-1.5')}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  disabled={disabled}
                  onClick={() => onCategoryChange(category.name)}
                  className={cn(
                    'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-2.5',
                    'text-[13px] font-medium leading-none tracking-[-0.015em]',
                    'transition-[background-color,color,box-shadow] duration-150 ease-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
                    'active:scale-[0.97] motion-reduce:active:scale-100',
                    'disabled:pointer-events-none disabled:opacity-50',
                    active
                      ? 'bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                      : 'text-black/64 hover:bg-black/[0.05] hover:text-foreground dark:text-white/64 dark:hover:bg-white/[0.08]',
                  )}
                >
                  <span className="whitespace-nowrap">{category.name}</span>
                  <span
                    className={cn(
                      'tabular-nums text-[11px] font-normal',
                      active ? 'text-background/70' : 'text-black/44 dark:text-white/44',
                    )}
                  >
                    {category.templatesCount}
                  </span>
                </button>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </div>
    </Carousel>
  )
}

export function StaticAdTemplatesGallery() {
  const { applyTemplate } = useStaticAdStudio()
  const [categories, setCategories] = useState<StaticAdTemplateCategoryDto[]>([])
  const [templates, setTemplates] = useState<StaticAdTemplateDto[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [loadingMore, setLoadingMore] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<StaticAdTemplateDto | null>(null)
  const requestIdRef = useRef(0)

  const fetchPage = useCallback(
    async (nextPage: number, category: string | null, append: boolean) => {
      const requestId = ++requestIdRef.current
      const response = await getStaticAdTemplates({
        page: nextPage,
        limit: STATIC_AD_TEMPLATE_PAGE_SIZE,
        ...(category ? { category } : {}),
      })

      if (requestId !== requestIdRef.current) return

      if (!response.success || !response.data) {
        setError(response.message ?? 'Failed to load templates.')
        if (!append) setTemplates([])
        return
      }

      const nextTemplates = response.data.templates
      const nextHasMore = Boolean(response.meta?.hasNextPage)
      setError(null)
      setTemplates(current => (append ? [...current, ...nextTemplates] : nextTemplates))
      setPage(nextPage)
      setHasMore(nextHasMore)
    },
    [],
  )

  useEffect(() => {
    startTransition(async () => {
      const categoriesRes = await getStaticAdTemplateCategories()
      if (categoriesRes.success && categoriesRes.data) {
        setCategories(
          [...categoriesRes.data.categories].toSorted((a, b) => b.templatesCount - a.templatesCount),
        )
      }
      await fetchPage(1, null, false)
    })
  }, [fetchPage])

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category)
    startTransition(async () => {
      await fetchPage(1, category, false)
    })
  }

  const handleLoadMore = () => {
    if (loadingMore || pending || !hasMore) return
    setLoadingMore(true)
    void fetchPage(page + 1, selectedCategory, true).finally(() => setLoadingMore(false))
  }

  const handleRecreate = (template: StaticAdTemplateDto) => {
    applyTemplate({ imageUrl: template.imageUrl, name: template.name })
  }

  return (
    <div className="flex w-full flex-col">
      <TemplateCategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        disabled={pending}
      />

      <div className="mt-5">
        {error ? (
          <ErrorState
            title="Could not load templates"
            description={error}
            action={
              <Button type="button" size="sm" variant="outline" onClick={() => handleCategoryChange(selectedCategory)}>
                Try again
              </Button>
            }
          />
        ) : null}

        {!error && templates.length === 0 && !pending ? (
          <EmptyState
            icon={LayoutTemplateIcon}
            title="No templates yet"
            description="Import static ad templates to start recreating ads from a reference."
          />
        ) : null}

        {pending && templates.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-black/44 dark:text-white/44">
            <Loader2Icon className="size-5 animate-spin" />
          </div>
        ) : null}

        {templates.length > 0 ? (
          <InfiniteScroll
            dataLength={templates.length}
            next={handleLoadMore}
            hasMore={hasMore}
            loader={<ScrollLoader />}
            scrollableTarget={SCROLL_TARGET_ID}
            scrollThreshold={0.9}
            className="!overflow-visible"
            style={{ overflow: 'visible' }}
          >
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
              {templates.map(template => (
                <StaticAdTemplateCard
                  key={template._id}
                  template={template}
                  onPreview={setPreviewTemplate}
                  onRecreate={handleRecreate}
                />
              ))}
            </div>
          </InfiniteScroll>
        ) : null}
      </div>

      <StaticAdTemplatePreviewDialog
        template={previewTemplate}
        open={previewTemplate !== null}
        onOpenChange={open => {
          if (!open) setPreviewTemplate(null)
        }}
        onRecreate={handleRecreate}
      />
    </div>
  )
}
