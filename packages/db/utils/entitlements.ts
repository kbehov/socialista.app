import {
  BillingStatus,
  Plan,
  type IWorkspace,
} from '../types/workspace.types.js'

/** Pro / Enterprise with an active billing status. Shared by API middleware and Trigger jobs. */
export const hasAnalyticsAccess = (workspace: Pick<IWorkspace, 'billing'>): boolean =>
  (workspace.billing.plan === Plan.PRO || workspace.billing.plan === Plan.ENTERPRISE) &&
  workspace.billing.status === BillingStatus.ACTIVE
