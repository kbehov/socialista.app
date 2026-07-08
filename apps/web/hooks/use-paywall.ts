'use client'

import { PaywallDialog, type PaywallDialogProps } from '@/components/paywall/paywall-dialog'
import type { PaywallReason } from '@/lib/paywall'
import { useWorkspaceStore } from '@/store/workspace.store'
import { useCallback, useMemo, useState } from 'react'

type UsePaywallOptions = {
  workspaceId?: string
  currentPlan?: PaywallDialogProps['currentPlan']
  featuredProductId?: string
}

export function usePaywall(options: UsePaywallOptions = {}) {
  const currentWorkspace = useWorkspaceStore(state => state.currentWorkspace)
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<PaywallReason>('generic')
  const [copyOverrides, setCopyOverrides] = useState<{
    title?: string
    description?: string
    eyebrow?: string
  }>({})

  const workspaceId = options.workspaceId ?? currentWorkspace?.id
  const currentPlan = options.currentPlan ?? currentWorkspace?.billing.plan ?? 'free'

  const show = useCallback(
    (
      nextReason: PaywallReason = 'generic',
      overrides?: {
        title?: string
        description?: string
        eyebrow?: string
      },
    ) => {
      setReason(nextReason)
      setCopyOverrides(overrides ?? {})
      setOpen(true)
    },
    [],
  )

  const hide = useCallback(() => {
    setOpen(false)
  }, [])

  const dialogProps = useMemo(
    () => ({
      open,
      onOpenChange: setOpen,
      workspaceId,
      currentPlan,
      reason,
      featuredProductId: options.featuredProductId,
      title: copyOverrides.title,
      description: copyOverrides.description,
      eyebrow: copyOverrides.eyebrow,
      onDismiss: hide,
    }),
    [
      copyOverrides.description,
      copyOverrides.eyebrow,
      copyOverrides.title,
      currentPlan,
      hide,
      open,
      options.featuredProductId,
      reason,
      workspaceId,
    ],
  )

  return {
    open,
    reason,
    show,
    hide,
    dialogProps,
  }
}
