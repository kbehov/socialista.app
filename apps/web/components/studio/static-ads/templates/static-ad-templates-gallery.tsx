'use client'

import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { useStaticAdStudio } from '@/components/studio/static-ads/static-ad-studio-provider'
import {
  StaticAdTemplateCard,
  StaticAdTemplateCardSkeleton,
} from '@/components/studio/static-ads/templates/static-ad-template-card'
import { StaticAdTemplatePreviewDialog } from '@/components/studio/static-ads/templates/static-ad-template-preview-dialog'
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
      <Loader2Icon className="size-3.5 animate-spin text-black/36 dark:text-white/36" />
    </div>
  )
}

function CategoryCarouselNav() {
  const { canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useCarousel()

  if (!canScrollPrev && !canScrollNext) return null

  const buttonClass = cn(
    'inline-flex size-8 items-center justify-center rounded-full',
    'text-black/50 dark:text-white/50',
    'transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
    'hover:bg-black/[0.05] hover:text-foreground dark:hover:bg-white/[0.08]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
    'active:scale-[0.96] motion-reduce:active:scale-100',
    'disabled:pointer-events-none disabled:opacity-30',
  )

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" aria-label="Scroll categories left" disabled={!canScrollPrev} onClick={scrollPrev} className={buttonClass}>
        <ChevronLeftIcon className="size-3.5" strokeWidth={1.75} />
      </button>
      <button type="button" aria-label="Scroll categories right" disabled={!canScrollNext} onClick={scrollNext} className={buttonClass}>
        <ChevronRightIcon className="size-3.5" strokeWidth={1.75} />
      </button>
    </div>
  )
}

function categoryTabClass(active: boolean) {
  return cn(
    'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5',
    'text-[13px] font-medium leading-none tracking-[-0.015em]',
    'transition-[background-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
    'active:scale-[0.96] motion-reduce:active:scale-100',
    'disabled:pointer-events-none disabled:opacity-50',
    active
      ? 'bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.16),inset_0_1px_0_0_rgba(255,255,255,0.2)]'
      : 'bg-black/[0.045] text-foreground/72 hover:bg-black/[0.08] hover:text-foreground dark:bg-white/[0.07] dark:text-white/74 dark:hover:bg-white/[0.12] dark:hover:text-white',
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
  return (
    <Carousel
      className="w-full min-w-0"
      opts={{
        align: 'start',
        dragFree: true,
        containScroll: 'trimSnaps',
      }}
    >
      <h2 className="mb-3 text-[13px] font-medium leading-none tracking-[-0.011em] text-black/56 dark:text-white/56">
        Templates
      </h2>

      {categories.length > 0 ? (
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-background to-transparent"
            />

            <CarouselContent className="ml-0" role="tablist" aria-label="Template categories">
              <CarouselItem className="basis-auto self-stretch pl-0">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === null}
                  disabled={disabled}
                  onClick={() => onCategoryChange(null)}
                  className={categoryTabClass(selectedCategory === null)}
                >
                  All
                </button>
              </CarouselItem>

              {categories.map(category => {
                const active = selectedCategory === category.name

                return (
                  <CarouselItem key={category._id} className="basis-auto self-stretch pl-2">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={active}
                      disabled={disabled}
                      onClick={() => onCategoryChange(category.name)}
                      className={categoryTabClass(active)}
                    >
                      <span className="whitespace-nowrap">{category.name}</span>
                      <span
                        className={cn(
                          'tabular-nums text-[11px] font-normal',
                          active ? 'text-background/70' : 'text-black/40 dark:text-white/40',
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
          <CategoryCarouselNav />
        </div>
      ) : null}
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

  const fetchPage = useCallback(async (nextPage: number, category: string | null, append: boolean) => {
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
  }, [])

  useEffect(() => {
    startTransition(async () => {
      const categoriesRes = await getStaticAdTemplateCategories()
      if (categoriesRes.success && categoriesRes.data) {
        setCategories([...categoriesRes.data.categories].toSorted((a, b) => b.templatesCount - a.templatesCount))
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

  if (selectedCategory === null && !error && templates.length === 0) {
    return null
  }

  return (
    <div className="relative z-10 mx-auto mt-8 flex w-full max-w-5xl flex-col px-4 pb-[max(4rem,calc(env(safe-area-inset-bottom,0px)+3rem))] sm:px-6 lg:px-8">
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
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleCategoryChange(selectedCategory)}
              >
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
            variant="ghost"
            minHeight="sm"
          />
        ) : null}

        {pending && templates.length === 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <StaticAdTemplateCardSkeleton key={index} />
            ))}
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
            <div
              className={cn(
                'grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4',
                pending && 'opacity-60',
              )}
            >
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
