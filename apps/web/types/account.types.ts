import type { AccountSummary } from '@socialista/types'
export type ConfirmAction = {
  type: 'disconnect' | 'delete'
  account: AccountSummary
}
