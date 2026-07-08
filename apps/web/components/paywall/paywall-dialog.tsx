'use client'

import { Paywall, type PaywallProps } from '@/components/paywall/paywall'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { getPolarProducts } from '@/services/billing.service'
import type { PolarProduct } from '@socialista/types'
import { useCallback, useEffect, useState } from 'react'

export type PaywallDialogProps = Omit<PaywallProps, 'variant' | 'products' | 'isLoading' | 'error' | 'onRetry'> & {
  open: boolean
  onOpenChange: (open: boolean) => void
  products?: PolarProduct[]
}

export function PaywallDialog({
  open,
  onOpenChange,
  products: initialProducts,
  onDismiss,
  ...paywallProps
}: PaywallDialogProps) {
  const [products, setProducts] = useState<PolarProduct[]>(initialProducts ?? [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    if (initialProducts?.length) {
      setProducts(initialProducts)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await getPolarProducts({ recurringOnly: true })

      if (!response.success || !response.data) {
        setProducts([])
        setError(response.message ?? 'Failed to load plans')
        return
      }

      setProducts(response.data.products)
    } catch {
      setProducts([])
      setError('Failed to load plans')
    } finally {
      setIsLoading(false)
    }
  }, [initialProducts])

  useEffect(() => {
    if (!open) return
    void loadProducts()
  }, [open, loadProducts])

  useEffect(() => {
    if (initialProducts?.length) {
      setProducts(initialProducts)
    }
  }, [initialProducts])

  const handleDismiss = () => {
    onDismiss?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[min(92vh,960px)] gap-0 overflow-y-auto border-border/80 p-0 sm:max-w-3xl"
      >
        <DialogTitle className="sr-only">Upgrade your workspace</DialogTitle>

        <div className="p-6 sm:p-8">
          <Paywall
            {...paywallProps}
            products={products}
            variant="embedded"
            isLoading={isLoading}
            error={error}
            onRetry={() => void loadProducts()}
            onDismiss={handleDismiss}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
