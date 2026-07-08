import {
  BillingStatus,
  getWorkspaceById,
  getWorkspaceByPolarCustomerId,
  getWorkspaceByPolarSubscriptionId,
  PLAN_LIMITS,
  Plan,
  provisionPlan,
  resetBillingPeriodUsage,
  updateWorkspaceBilling,
} from '@socialista/db'

type PolarSubscription = {
  id: string
  customerId: string
  status: string
  currentPeriodStart?: Date | string | null
  currentPeriodEnd?: Date | string | null
  metadata?: Record<string, string | number | boolean> | null
}

const toDate = (value?: Date | string | null) => {
  if (!value) return undefined
  return value instanceof Date ? value : new Date(value)
}

const getWorkspaceIdFromSubscription = (subscription: PolarSubscription) => {
  const workspaceId = subscription.metadata?.workspaceId
  return typeof workspaceId === 'string' ? workspaceId : undefined
}

const resolveWorkspace = async (subscription: PolarSubscription) => {
  const workspaceId = getWorkspaceIdFromSubscription(subscription)
  if (workspaceId) {
    return await getWorkspaceById(workspaceId)
  }

  const bySubscription = await getWorkspaceByPolarSubscriptionId(subscription.id)
  if (bySubscription) return bySubscription

  return await getWorkspaceByPolarCustomerId(subscription.customerId)
}

const mapPolarStatus = (status: string): BillingStatus => {
  switch (status) {
    case 'active':
    case 'trialing':
      return BillingStatus.ACTIVE
    case 'canceled':
      return BillingStatus.CANCELLED
    case 'incomplete':
    case 'past_due':
      return BillingStatus.PENDING
    default:
      return BillingStatus.INACTIVE
  }
}

const syncSubscriptionPeriod = async (workspaceId: string, subscription: PolarSubscription) => {
  const currentPeriodEnd = toDate(subscription.currentPeriodEnd)

  await updateWorkspaceBilling(workspaceId, {
    polarCustomerId: subscription.customerId,
    polarSubscriptionId: subscription.id,
    status: mapPolarStatus(subscription.status),
    currentPeriodStart: toDate(subscription.currentPeriodStart),
    currentPeriodEnd,
    nextBillingDate: currentPeriodEnd ?? new Date(),
    nextBillingAmount: PLAN_LIMITS[Plan.PRO].price,
  })
}

export const handleSubscriptionCreated = async (subscription: PolarSubscription) => {
  const workspace = await resolveWorkspace(subscription)
  if (!workspace) {
    console.warn('[polar] subscription.created: workspace not found', subscription.id)
    return
  }

  const workspaceId = workspace._id.toString()

  await updateWorkspaceBilling(workspaceId, {
    polarCustomerId: subscription.customerId,
    polarSubscriptionId: subscription.id,
    status: BillingStatus.ACTIVE,
    currentPeriodStart: toDate(subscription.currentPeriodStart),
    currentPeriodEnd: toDate(subscription.currentPeriodEnd),
    nextBillingDate: toDate(subscription.currentPeriodEnd) ?? new Date(),
    nextBillingAmount: PLAN_LIMITS[Plan.PRO].price,
  })

  await provisionPlan(workspaceId, Plan.PRO)
}

export const handleSubscriptionUpdated = async (subscription: PolarSubscription) => {
  const workspace = await resolveWorkspace(subscription)
  if (!workspace) {
    console.warn('[polar] subscription.updated: workspace not found', subscription.id)
    return
  }

  await syncSubscriptionPeriod(workspace._id.toString(), subscription)
}

export const handleSubscriptionActive = async (subscription: PolarSubscription) => {
  const workspace = await resolveWorkspace(subscription)
  if (!workspace) {
    console.warn('[polar] subscription.active: workspace not found', subscription.id)
    return
  }

  const workspaceId = workspace._id.toString()

  await syncSubscriptionPeriod(workspaceId, subscription)
  await resetBillingPeriodUsage(workspaceId)
}

export const handleSubscriptionCanceled = async (subscription: PolarSubscription) => {
  const workspace = await resolveWorkspace(subscription)
  if (!workspace) {
    console.warn('[polar] subscription.canceled: workspace not found', subscription.id)
    return
  }

  await updateWorkspaceBilling(workspace._id.toString(), {
    status: BillingStatus.CANCELLED,
    currentPeriodEnd: toDate(subscription.currentPeriodEnd),
    nextBillingDate: toDate(subscription.currentPeriodEnd) ?? workspace.billing.nextBillingDate,
  })
}

export const handleSubscriptionRevoked = async (subscription: PolarSubscription) => {
  const workspace = await resolveWorkspace(subscription)
  if (!workspace) {
    console.warn('[polar] subscription.revoked: workspace not found', subscription.id)
    return
  }

  const workspaceId = workspace._id.toString()

  await provisionPlan(workspaceId, Plan.FREE)
  await updateWorkspaceBilling(workspaceId, {
    status: BillingStatus.INACTIVE,
    polarSubscriptionId: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    nextBillingDate: new Date(),
    nextBillingAmount: 0,
  })
}
