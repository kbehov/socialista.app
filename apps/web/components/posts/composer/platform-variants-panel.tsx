'use client'

import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { AccountSummary } from '@socialista/types'
import { useMemo } from 'react'

import type { ComposerVariant } from '@/types/composer-types'
import { formatHandle } from '@/utils/account-display.utils'
import { getVariantOrEmpty } from '@/utils/composer.utils'
import { ComposerCollapsibleSection } from './composer-section'
import { PlatformVariantEditor } from './platform-variant-editor'

type PlatformVariantsPanelProps = {
  accounts: AccountSummary[]
  selectedAccountIds: string[]
  commonCaption: string
  variants: Record<string, ComposerVariant>
  onVariantChange: (accountId: string, patch: Partial<Omit<ComposerVariant, 'accountId'>>) => void
  onClearField: (
    accountId: string,
    field: 'caption' | 'description' | 'altText' | 'location' | 'firstComment',
  ) => void
  className?: string
}

function countCustomizations(variant: ComposerVariant): number {
  let count = 0
  if (variant.caption.trim()) count++
  if (variant.description.trim()) count++
  if (variant.altText.trim()) count++
  if (variant.location) count++
  if (variant.firstComment.trim()) count++
  return count
}

export function PlatformVariantsPanel({
  accounts,
  selectedAccountIds,
  commonCaption,
  variants,
  onVariantChange,
  onClearField,
  className,
}: PlatformVariantsPanelProps) {
  const selectedAccounts = accounts.filter(account => selectedAccountIds.includes(account._id))

  const customizationCount = useMemo(
    () =>
      selectedAccounts.reduce((total, account) => {
        const variant = getVariantOrEmpty(variants, account._id)
        return total + countCustomizations(variant)
      }, 0),
    [selectedAccounts, variants],
  )

  if (selectedAccounts.length === 0) {
    return null
  }

  const defaultTab = selectedAccounts[0]?._id

  return (
    <ComposerCollapsibleSection
      title="Platform customization"
      description={
        selectedAccounts.length > 1
          ? 'Optional overrides per channel. Leave blank to keep the shared caption.'
          : 'Optional description, alt text, or caption override for this channel.'
      }
      className={className}
      contentClassName="space-y-3 pt-0"
      variant="subtle"
      compact
      defaultOpen={customizationCount > 0}
      badge={
        customizationCount > 0 ? (
          <Badge
            variant="secondary"
            className="h-5 rounded-full px-2 text-[10px] font-medium tabular-nums"
          >
            {customizationCount} edit{customizationCount === 1 ? '' : 's'}
          </Badge>
        ) : null
      }
    >
      <Tabs defaultValue={defaultTab} key={selectedAccountIds.join(',')}>
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {selectedAccounts.map(account => {
            const variant = getVariantOrEmpty(variants, account._id)
            const hasCustom = countCustomizations(variant) > 0
            const handle = formatHandle(account.username)

            return (
              <TabsTrigger
                key={account._id}
                value={account._id}
                className={cn(
                  'h-7 gap-1.5 rounded-full border border-transparent px-2.5 text-[11px] font-medium',
                  'data-[state=active]:border-border/50 data-[state=active]:bg-background data-[state=active]:shadow-xs',
                )}
              >
                <SocialPlatformIcon provider={account.provider} size={11} framed={false} className="size-3.5" />
                <span className="max-w-22 truncate">
                  {handle || getSocialPlatformLabel(account.provider)}
                </span>
                {hasCustom ? <span className="size-1.5 rounded-full bg-foreground/70" /> : null}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {selectedAccounts.map(account => (
          <TabsContent key={account._id} value={account._id} className="mt-3">
            <div className="rounded-lg border border-border/40 bg-background p-3">
              <PlatformVariantEditor
                account={account}
                commonCaption={commonCaption}
                variant={getVariantOrEmpty(variants, account._id)}
                onChange={patch => onVariantChange(account._id, patch)}
                onClearField={field => onClearField(account._id, field)}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </ComposerCollapsibleSection>
  )
}
