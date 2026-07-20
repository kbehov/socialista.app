'use client'

import { MetaAccountsDialog } from '@/components/accounts/meta-accounts-dialog'
import { getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: 'Sign in to connect an account',
  no_workspace: 'Select a workspace first',
  provider_denied: 'Connection was cancelled',
  invalid_state: 'Connection expired. Please try again',
  expired: 'Connection expired. Please try again',
  misconfigured: 'This platform is not configured yet',
  provider_error: 'Something went wrong connecting the account',
  invalid_request: 'Invalid connection request',
  not_found: 'No accounts were found for this login',
}

/**
 * Handles OAuth return query params on the accounts page.
 * Keeps `facebook_pending` in the URL until the Meta picker closes so a soft
 * navigation cannot remount and dismiss the dialog before accounts load.
 */
export function AccountsOAuthHandler() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const handledQuery = useRef<string | null>(null)

  const pendingMeta = searchParams.get('connected') === 'facebook_pending'
  const [metaOpen, setMetaOpen] = useState(pendingMeta)

  useEffect(() => {
    const connected = searchParams.get('connected')
    const skipped = searchParams.get('skipped')
    const error = searchParams.get('error')
    const queryKey = searchParams.toString()

    if (!connected && !skipped && !error) return
    if (handledQuery.current === queryKey) return
    handledQuery.current = queryKey

    if (connected === 'facebook_pending') {
      queueMicrotask(() => setMetaOpen(true))
      return
    }

    if (connected) {
      toast.success(`${getSocialPlatformLabel(connected)} account connected`)
      router.refresh()
    } else if (skipped) {
      toast.message(`${getSocialPlatformLabel(skipped)} is already connected`)
    } else if (error) {
      toast.error(ERROR_MESSAGES[error] ?? 'Failed to connect account')
    }

    router.replace(pathname, { scroll: false })
  }, [pathname, router, searchParams])

  const handleMetaOpenChange = (open: boolean) => {
    setMetaOpen(open)
    if (!open && searchParams.get('connected') === 'facebook_pending') {
      router.replace(pathname, { scroll: false })
    }
  }

  return (
    <MetaAccountsDialog
      open={metaOpen}
      onOpenChange={handleMetaOpenChange}
      onConnected={() => router.refresh()}
    />
  )
}
