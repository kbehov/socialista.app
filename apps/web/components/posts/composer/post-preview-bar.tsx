'use client'

import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { ComposerMediaItem, ComposerVariant } from '@/types/composer-types'
import { getAccountPreviewMeta } from '@/utils/account-display.utils'
import {
  derivePostType,
  getVariantOrEmpty,
  mergeVariantCaption,
} from '@/utils/composer.utils'
import type { AccountSummary } from '@socialista/types'
import { EyeIcon, PanelRightCloseIcon, PanelRightOpenIcon } from 'lucide-react'

import { PlatformPreview } from './previews/preview-registry'

type PostPreviewBarProps = {
  accounts: AccountSummary[]
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
      <aside className={cn('flex flex-col items-center gap-2', className)}>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 rounded-xl border-border/50 bg-background shadow-xs active:scale-[0.97]"
          onClick={() => onCollapsedChange?.(false)}
          aria-label="Show preview"
        >
          <PanelRightOpenIcon className="size-3.5" strokeWidth={1.75} />
        </Button>
        <span className="rotate-180 text-[10px] font-medium tracking-wide text-muted-foreground [writing-mode:vertical-rl]">
          Preview
        </span>
      </aside>
    )
  }

  if (selectedAccounts.length === 0) {
    return (
      <aside
        className={cn(
          'flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border/50',
          'bg-muted/10 px-5 text-center',
          className,
        )}
      >
        <span className="mb-3 flex size-10 items-center justify-center rounded-2xl border border-border/50 bg-background shadow-xs">
          <EyeIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
        </span>
        <p className="text-xs font-semibold tracking-tight text-foreground">Live preview</p>
        <p className="mt-1.5 max-w-44 text-[11px] leading-relaxed text-muted-foreground">
          Select accounts to see how your post will look on each platform.
        </p>
      </aside>
    )
  }

  const postType = derivePostType(media)
  const activeAccount = selectedAccounts.find(account => account._id === activeId)

  return (
    <aside
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-background shadow-xs',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-tight text-foreground">Preview</p>
          {activeAccount ? (
            <p className="truncate text-[10px] text-muted-foreground">
              {getAccountPreviewMeta(activeAccount)}
            </p>
          ) : null}
        </div>
        {onCollapsedChange ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 rounded-lg text-muted-foreground hover:text-foreground active:scale-[0.97]"
            onClick={() => onCollapsedChange(true)}
            aria-label="Hide preview"
          >
            <PanelRightCloseIcon className="size-3.5" strokeWidth={1.75} />
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
                    'h-7 gap-1 rounded-lg border border-transparent px-2 text-[10px] font-medium',
                    'data-[state=active]:border-border/50 data-[state=active]:bg-muted/40 data-[state=active]:shadow-none',
                  )}
                >
                  <SocialPlatformIcon provider={account.provider} size={10} framed={false} className="size-3" />
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        ) : null}

        <ScrollArea className="min-h-0 flex-1" scrollFade>
          <div className="p-2.5">
            {selectedAccounts.map(account => {
              const variant = getVariantOrEmpty(variants, account._id)
              const caption = mergeVariantCaption(commonCaption, variant)

              return (
                <TabsContent key={account._id} value={account._id} className="mt-0 data-[state=inactive]:hidden">
                  <div className="origin-top scale-[0.92]">
                    <PlatformPreview
                      provider={account.provider}
                      account={account}
                      caption={caption}
                      description={variant.description}
                      media={media}
                      postType={postType}
                      locationName={variant.location?.name}
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
