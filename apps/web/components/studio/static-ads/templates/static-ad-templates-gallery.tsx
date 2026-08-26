'use client'

import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { DashboardSegment, DashboardSegmentButton } from '@/components/dashboard'
import { StaticAdTemplateCard } from '@/components/studio/static-ads/templates/static-ad-template-card'
import { StaticAdTemplatePreviewDialog } from '@/components/studio/static-ads/templates/static-ad-template-preview-dialog'
import { useStaticAdStudio } from '@/components/studio/static-ads/static-ad-studio-provider'
import { Button } from '@/components/ui/button'
import { STATIC_AD_TEMPLATE_PAGE_SIZE } from '@/lib/studio/static-ads/recreate-prompt'
import { getStaticAdTemplateCategories, getStaticAdTemplates } from '@/services/static-ad-templates.service'
import type { StaticAdTemplateCategoryDto, StaticAdTemplateDto } from '@socialista/types'
import { LayoutTemplateIcon, Loader2Icon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

const SCROLL_TARGET_ID = 'dashboard-scroll'

function ScrollLoader() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-[12px] text-muted-foreground">
      <Loader2Icon className="size-3.5 animate-spin" />
      Loading more
    </div>
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
        setCategories(categoriesRes.data.categories)
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
    <section aria-label="Static ad templates" className="flex w-full flex-col gap-5">
      {categories.length > 0 ? (
        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <DashboardSegment className="w-max" label="Template categories">
            <DashboardSegmentButton active={selectedCategory === null} onClick={() => handleCategoryChange(null)}>
              All
            </DashboardSegmentButton>
            {categories.map(category => (
              <DashboardSegmentButton
                key={category._id}
                active={selectedCategory === category.name}
                onClick={() => handleCategoryChange(category.name)}
              >
                {category.name}
                <span className="tabular-nums text-muted-foreground/70">{category.templatesCount}</span>
              </DashboardSegmentButton>
            ))}
          </DashboardSegment>
        </div>
      ) : null}

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
        <div className="flex items-center justify-center py-16 text-muted-foreground">
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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

      <StaticAdTemplatePreviewDialog
        template={previewTemplate}
        open={previewTemplate !== null}
        onOpenChange={open => {
          if (!open) setPreviewTemplate(null)
        }}
        onRecreate={handleRecreate}
      />
    </section>
  )
}
