'use client'

import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { Account } from '@socialista/types'
import { EyeIcon, PanelRightCloseIcon, PanelRightOpenIcon } from 'lucide-react'

import { createEmptyVariant, derivePostType, mergeVariantCaption } from './composer-utils'
import type { ComposerMediaItem, ComposerVariant } from './composer-types'
import { getPreviewComponent } from './previews/preview-registry'

type PostPreviewBarProps = {
  accounts: Account[]
  selectedAccountIds: string[]
  previewAccountId: string | null
  commonCaption: string
  media: ComposerMediaItem[]
  variants: Record<string, ComposerVariant>
  onPreviewAccountChange: (accountId: string) => void
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  className?: string
}

export function PostPreviewBar({
  accounts,
  selectedAccountIds,
  previewAccountId,
  commonCaption,
  media,
  variants,
  onPreviewAccountChange,
  collapsed = false,
  onCollapsedChange,
  className,
}: PostPreviewBarProps) {
  const selectedAccounts = accounts.filter(account => selectedAccountIds.includes(account._id))
  const activeId =
    previewAccountId && selectedAccountIds.includes(previewAccountId)
      ? previewAccountId
      : (selectedAccounts[0]?._id ?? null)

  if (collapsed) {
    return (
      <aside className={cn('flex flex-col items-center', className)}>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 rounded-lg border-border/50 bg-background shadow-none"
          onClick={() => onCollapsedChange?.(false)}
          aria-label="Show preview"
        >
          <PanelRightOpenIcon className="size-3.5" strokeWidth={1.75} />
        </Button>
      </aside>
    )
  }

  if (selectedAccounts.length === 0) {
    return (
      <aside
        className={cn(
          'flex min-h-[12rem] flex-col items-center justify-center rounded-xl border border-dashed border-border/50',
          'bg-background px-4 text-center',
          className,
        )}
      >
        <EyeIcon className="mb-2 size-4 text-muted-foreground/60" strokeWidth={1.75} />
        <p className="text-xs font-medium text-foreground">Preview</p>
        <p className="mt-1 max-w-[10rem] text-[10px] leading-relaxed text-muted-foreground">
          Select accounts to preview
        </p>
      </aside>
    )
  }

  const postType = derivePostType(media)
  const activeAccount = selectedAccounts.find(account => account._id === activeId)

  return (
    <aside
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-background',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-tight text-foreground">Preview</p>
          {activeAccount ? (
            <p className="truncate text-[10px] text-muted-foreground">
              {getSocialPlatformLabel(activeAccount.provider)}
            </p>
          ) : null}
        </div>
        {onCollapsedChange ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 shrink-0 rounded-md"
            onClick={() => onCollapsedChange(true)}
            aria-label="Hide preview"
          >
            <PanelRightCloseIcon className="size-3" strokeWidth={1.75} />
          </Button>
        ) : null}
      </div>

      <Tabs
        value={activeId ?? undefined}
        onValueChange={onPreviewAccountChange}
        className="flex min-h-0 flex-1 flex-col"
      >
        {selectedAccounts.length > 1 ? (
          <div className="border-b border-border/30 px-2 py-1.5">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-0.5 bg-transparent p-0">
              {selectedAccounts.map(account => (
                <TabsTrigger
                  key={account._id}
                  value={account._id}
                  className={cn(
                    'h-6 gap-1 rounded-md border border-transparent px-1.5 text-[10px] font-medium',
                    'data-[state=active]:border-border/50 data-[state=active]:bg-background',
                  )}
                >
                  <SocialPlatformIcon
                    provider={account.provider}
                    size={10}
                    framed={false}
                    className="size-3"
                  />
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        ) : null}

        <ScrollArea className="min-h-0 flex-1">
          <div className="p-2">
            {selectedAccounts.map(account => {
              const Preview = getPreviewComponent(account.provider)
              const variant = variants[account._id] ?? createEmptyVariant(account._id)
              const caption = mergeVariantCaption(commonCaption, variant)
              const description = variant.description

              return (
                <TabsContent
                  key={account._id}
                  value={account._id}
                  className="mt-0 data-[state=inactive]:hidden"
                >
                  <div className="origin-top scale-[0.88]">
                    <Preview
                      account={account}
                      caption={caption}
                      description={description}
                      media={media}
                      postType={postType}
                    />
                  </div>
                </TabsContent>
              )
            })}
          </div>
        </ScrollArea>
      </Tabs>
    </aside>
  )
}
