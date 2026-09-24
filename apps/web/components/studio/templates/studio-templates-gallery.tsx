'use client'

import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import {
  StudioTemplateCard,
  StudioTemplateCardSkeleton,
  type StudioTemplateCardVariant,
} from '@/components/studio/templates/studio-template-card'
import { StudioTemplatePreviewDialog } from '@/components/studio/templates/studio-template-preview-dialog'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { getStudioTemplateCategories, getStudioTemplates } from '@/services/studio-templates.service'
import {
  STUDIO_TEMPLATE_PAGE_SIZE,
  type StudioTemplateCategoryDto,
  type StudioTemplateDto,
  type StudioTemplateKind,
} from '@socialista/types'
import { ChevronLeftIcon, ChevronRightIcon, LayoutTemplateIcon, Loader2Icon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

const SCROLL_TARGET_ID = 'dashboard-scroll'
const EMPTY_TEMPLATE_CATEGORIES: StudioTemplateCategoryDto[] = []

function categorySeedKey(categories: readonly StudioTemplateCategoryDto[]) {
  let key = ''
  for (const category of categories) {
    key += `${category._id}\0${category.templatesCount}\0${category.name}\0`
  }
  return key
}

function ScrollLoader() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2Icon className="size-3.5 animate-spin text-black/36 dark:text-white/36" />
    </div>
  )
}

function CategoryCarouselNav({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const { canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useCarousel()

  if (!canScrollPrev && !canScrollNext) return null

  const buttonClass = cn(
    'inline-flex items-center justify-center',
    'text-black/44 dark:text-white/44',
    'transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
    'hover:bg-black/[0.05] hover:text-foreground dark:hover:bg-white/[0.08]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
    'active:scale-[0.96] motion-reduce:active:scale-100',
    'disabled:pointer-events-none disabled:opacity-30',
    size === 'md' ? 'size-8 rounded-full' : 'size-6 rounded-md',
  )

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        aria-label="Scroll categories left"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        className={buttonClass}
      >
        <ChevronLeftIcon className="size-3.5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="Scroll categories right"
        disabled={!canScrollNext}
        onClick={scrollNext}
        className={buttonClass}
      >
        <ChevronRightIcon className="size-3.5" strokeWidth={1.75} />
      </button>
    </div>
  )
}

type CategoryChipTone = 'outline' | 'studio'

type TemplateCategoryFilterProps = {
  categories: StudioTemplateCategoryDto[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  disabled?: boolean
  sectionTitle: string
  sectionDescription?: string
  accentFilters?: boolean
  headingTone?: 'display' | 'quiet'
  chipTone?: CategoryChipTone
}

function categoryTabClass(active: boolean, accentFilters: boolean, chipTone: CategoryChipTone) {
  const shared = cn(
    'inline-flex shrink-0 items-center font-medium leading-none tracking-[-0.015em]',
    'transition-[background-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
    'active:scale-[0.96] motion-reduce:active:scale-100',
    'disabled:pointer-events-none disabled:opacity-50',
  )

  if (chipTone === 'studio') {
    return cn(
      shared,
      'h-8 rounded-full px-3.5 text-[13px]',
      active
        ? 'bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.16),inset_0_1px_0_0_rgba(255,255,255,0.2)]'
        : cn(
            'bg-black/[0.045] text-foreground/72',
            'hover:bg-black/[0.08] hover:text-foreground',
            'dark:bg-white/[0.07] dark:text-white/74 dark:hover:bg-white/[0.12] dark:hover:text-white',
          ),
    )
  }

  return cn(
    shared,
    accentFilters ? 'h-8 rounded-full px-3.5 text-[12px]' : 'h-7 rounded-lg px-2.5 text-[12px]',
    active
      ? 'bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
      : cn(
          'bg-transparent text-black/58 ring-1 ring-inset ring-black/10',
          'hover:bg-black/[0.03] hover:text-foreground hover:ring-black/14',
          'dark:text-white/58 dark:ring-white/12 dark:hover:bg-white/[0.04] dark:hover:ring-white/16',
        ),
  )
}

function TemplateCategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  disabled,
  sectionTitle,
  sectionDescription,
  accentFilters = false,
  headingTone = 'display',
  chipTone = 'outline',
}: TemplateCategoryFilterProps) {
  const quiet = headingTone === 'quiet'
  const studio = chipTone === 'studio'
  const chipGap = studio ? 'pl-2' : 'pl-1.5'

  const chips = (
    <CarouselContent className="ml-0" role="tablist" aria-label="Template categories">
      <CarouselItem className="basis-auto self-stretch pl-0">
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === null}
          disabled={disabled}
          onClick={() => onCategoryChange(null)}
          className={categoryTabClass(selectedCategory === null, accentFilters, chipTone)}
        >
          All
        </button>
      </CarouselItem>

      {categories.map(category => {
        const active = selectedCategory === category.name

        return (
          <CarouselItem key={category._id} className={cn('basis-auto self-stretch', chipGap)}>
            <button
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              onClick={() => onCategoryChange(category.name)}
              className={categoryTabClass(active, accentFilters, chipTone)}
            >
              <span className="whitespace-nowrap">{category.name}</span>
            </button>
          </CarouselItem>
        )
      })}
    </CarouselContent>
  )

  return (
    <Carousel
      className="w-full min-w-0"
      opts={{
        align: 'start',
        dragFree: true,
        containScroll: 'trimSnaps',
      }}
    >
      <div
        className={cn(
          'flex justify-between gap-4',
          quiet ? 'mb-3 items-center' : 'mb-4 items-start sm:mb-5',
        )}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <h2
            className={cn(
              quiet
                ? 'text-[13px] font-medium leading-none tracking-[-0.011em] text-black/56 dark:text-white/56'
                : 'text-[17px] font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-[18px]',
            )}
          >
            {sectionTitle}
          </h2>
          {sectionDescription ? (
            <p className="max-w-md text-[13px] leading-[1.45] tracking-[-0.01em] text-black/48 dark:text-white/48">
              {sectionDescription}
            </p>
          ) : null}
        </div>
        {studio ? null : <CategoryCarouselNav />}
      </div>

      {categories.length > 0 ? (
        studio ? (
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-background to-transparent"
              />
              {chips}
            </div>
            <CategoryCarouselNav size="md" />
          </div>
        ) : (
          <div className={cn('relative pb-0.5', accentFilters && 'pt-0.5')}>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-linear-to-l from-background to-transparent"
            />
            {chips}
          </div>
        )
      ) : null}
    </Carousel>
  )
}

type StudioTemplatesGalleryProps = {
  kind: StudioTemplateKind
  initialCategories?: StudioTemplateCategoryDto[]
  onRecreate: (template: StudioTemplateDto) => void
  onPreview?: (template: StudioTemplateDto) => void
  sectionTitle?: string
  sectionDescription?: string
  headingTone?: 'display' | 'quiet'
  chipTone?: CategoryChipTone
  cardVariant?: StudioTemplateCardVariant
  emptyTitle?: string
  emptyDescription?: string
  hideWhenEmpty?: boolean
  className?: string
}

const GRID_CLASS =
  'grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-3.5 sm:gap-y-7 lg:grid-cols-4 lg:gap-x-4'

function sortCategories(categories: StudioTemplateCategoryDto[]) {
  return [...categories].toSorted((a, b) => b.templatesCount - a.templatesCount)
}

export function StudioTemplatesGallery({
  kind,
  initialCategories = EMPTY_TEMPLATE_CATEGORIES,
  onRecreate,
  onPreview,
  sectionTitle = 'Templates',
  sectionDescription,
  headingTone = 'display',
  chipTone = 'outline',
  cardVariant = 'default',
  emptyTitle = 'No templates yet',
  emptyDescription = 'Import templates to start recreating content from a reference.',
  hideWhenEmpty = false,
  className,
}: StudioTemplatesGalleryProps) {
  const nextSeedKey = categorySeedKey(initialCategories)
  const [seedKey, setSeedKey] = useState(nextSeedKey)
  const [categories, setCategories] = useState<StudioTemplateCategoryDto[]>(() =>
    sortCategories(initialCategories),
  )
  const [templates, setTemplates] = useState<StudioTemplateDto[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [loadingMore, setLoadingMore] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<StudioTemplateDto | null>(null)
  const requestIdRef = useRef(0)

  const fetchPage = useCallback(
    async (nextPage: number, category: string | null, append: boolean) => {
      const requestId = ++requestIdRef.current
      const response = await getStudioTemplates({
        kind,
        page: nextPage,
        limit: STUDIO_TEMPLATE_PAGE_SIZE,
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
    [kind],
  )

  useEffect(() => {
    let ignore = false
    startTransition(async () => {
      try {
        const categoriesRes = await getStudioTemplateCategories(kind)
        if (!ignore && categoriesRes.success && categoriesRes.data) {
          setCategories(sortCategories(categoriesRes.data.categories))
        }
      } catch {
        // Keep server-provided categories when the client refresh fails.
      }
      if (!ignore) await fetchPage(1, null, false)
    })
    return () => {
      ignore = true
    }
  }, [fetchPage, kind])

  if (nextSeedKey !== seedKey) {
    setSeedKey(nextSeedKey)
    setCategories(sortCategories(initialCategories))
    setSelectedCategory(null)
  }

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

  if (hideWhenEmpty && selectedCategory === null && !error && templates.length === 0) {
    return null
  }

  return (
    <div className={cn('flex w-full flex-col', className)}>
      <TemplateCategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        disabled={pending}
        sectionTitle={sectionTitle}
        sectionDescription={sectionDescription}
        headingTone={headingTone}
        chipTone={chipTone}
        accentFilters={cardVariant === 'visual'}
      />

      <div className={cn(categories.length > 0 ? 'mt-5 sm:mt-6' : 'mt-4')}>
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
            title={emptyTitle}
            description={emptyDescription}
            variant="ghost"
            minHeight="sm"
          />
        ) : null}

        {pending && templates.length === 0 ? (
          <div className={GRID_CLASS}>
            {Array.from({ length: 8 }, (_, index) => (
              <StudioTemplateCardSkeleton key={index} variant={cardVariant} />
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
            <div className={cn(GRID_CLASS, pending && 'opacity-60')}>
              {templates.map(template => (
                <StudioTemplateCard
                  key={template._id}
                  template={template}
                  onPreview={onPreview ?? setPreviewTemplate}
                  onRecreate={onRecreate}
                  openLabel={onPreview ? 'Open' : 'Preview'}
                  variant={cardVariant}
                />
              ))}
            </div>
          </InfiniteScroll>
        ) : null}
      </div>

      {onPreview ? null : (
        <StudioTemplatePreviewDialog
          template={previewTemplate}
          open={previewTemplate !== null}
          onOpenChange={open => {
            if (!open) setPreviewTemplate(null)
          }}
          onRecreate={onRecreate}
        />
      )}
    </div>
  )
}
