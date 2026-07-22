import { resolvePlanFromProductId } from '@/services/polar-plan-mapping.js'
import { HttpError } from '@/utils/http-response.js'
import {
  BillingStatus,
  getWorkspaceById,
  getWorkspaceByPolarCustomerId,
  getWorkspaceByPolarSubscriptionId,
  PLAN_LIMITS,
  Plan,
  provisionPlan,
  resetBillingPeriodUsage,
  tryMarkEventProcessed,
  updateWorkspaceBilling,
  type IWorkspace,
} from '@socialista/db'
import type {
  PolarOrderWebhookData,
  PolarSubscriptionWebhookData,
  PolarWebhookEvent,
  PolarWebhookEventType,
  PolarWebhookMetadata,
} from '@socialista/types'
import { POLAR_WEBHOOK_EVENT_TYPE_SET } from '@socialista/types'

const acquireWebhookEvent = (eventKey: string) => tryMarkEventProcessed(eventKey)
const buildWebhookEventKey = (eventType: string, entityId: string) => `${eventType}:${entityId}`

const toDate = (value?: string | null) => {
  if (!value) return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

const getWorkspaceIdFromMetadata = (metadata?: PolarWebhookMetadata | null) => {
  const workspaceId = metadata?.workspaceId
  return typeof workspaceId === 'string' ? workspaceId : undefined
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

const resolveWorkspaceFromSubscription = async (subscription: PolarSubscriptionWebhookData) => {
  const workspaceId = getWorkspaceIdFromMetadata(subscription.metadata)
  if (workspaceId) {
    return await getWorkspaceById(workspaceId)
  }

  const bySubscription = await getWorkspaceByPolarSubscriptionId(subscription.id)
  if (bySubscription) return bySubscription

  return await getWorkspaceByPolarCustomerId(subscription.customerId)
}

const resolveWorkspaceFromOrder = async (order: PolarOrderWebhookData) => {
  const workspaceId = getWorkspaceIdFromMetadata(order.metadata)
  if (workspaceId) {
    return await getWorkspaceById(workspaceId)
  }

  if (order.subscriptionId) {
    const bySubscription = await getWorkspaceByPolarSubscriptionId(order.subscriptionId)
    if (bySubscription) return bySubscription
  }

  return await getWorkspaceByPolarCustomerId(order.customerId)
}

const syncSubscriptionPeriod = async (workspaceId: string, subscription: PolarSubscriptionWebhookData) => {
  const currentPeriodEnd = toDate(subscription.currentPeriodEnd)
  const plan = resolvePlanFromProductId(subscription.productId)

  await updateWorkspaceBilling(workspaceId, {
    polarCustomerId: subscription.customerId,
    polarSubscriptionId: subscription.id,
    status: mapPolarStatus(subscription.status),
    currentPeriodStart: toDate(subscription.currentPeriodStart),
    currentPeriodEnd,
    nextBillingDate: currentPeriodEnd ?? new Date(),
    nextBillingAmount: PLAN_LIMITS[plan].price,
  })
}

async function withSubscriptionWorkspace(
  label: string,
  subscription: PolarSubscriptionWebhookData,
  fn: (workspace: IWorkspace, workspaceId: string) => Promise<void>,
): Promise<boolean> {
  const workspace = await resolveWorkspaceFromSubscription(subscription)
  if (!workspace) {
    console.warn(`[polar] ${label}: workspace not found`, subscription.id)
    return false
  }
  await fn(workspace, workspace._id.toString())
  return true
}

async function withOrderWorkspace(
  label: string,
  order: PolarOrderWebhookData,
  fn: (workspace: IWorkspace, workspaceId: string) => Promise<void>,
): Promise<boolean> {
  const workspace = await resolveWorkspaceFromOrder(order)
  if (!workspace) {
    console.warn(`[polar] ${label}: workspace not found`, order.id)
    return false
  }
  await fn(workspace, workspace._id.toString())
  return true
}

export const handleSubscriptionCreated = async (subscription: PolarSubscriptionWebhookData) => {
  return withSubscriptionWorkspace('subscription.created', subscription, async (_workspace, workspaceId) => {
    const plan = resolvePlanFromProductId(subscription.productId)
    await syncSubscriptionPeriod(workspaceId, subscription)
    if (mapPolarStatus(subscription.status) === BillingStatus.ACTIVE) {
      await provisionPlan(workspaceId, plan)
    }
  })
}

export const handleSubscriptionUpdated = async (subscription: PolarSubscriptionWebhookData) => {
  return withSubscriptionWorkspace('subscription.updated', subscription, async (_workspace, workspaceId) => {
    await syncSubscriptionPeriod(workspaceId, subscription)
  })
}

export const handleSubscriptionActive = async (subscription: PolarSubscriptionWebhookData) => {
  return withSubscriptionWorkspace('subscription.active', subscription, async (_workspace, workspaceId) => {
    const plan = resolvePlanFromProductId(subscription.productId)
    await syncSubscriptionPeriod(workspaceId, subscription)
    await provisionPlan(workspaceId, plan)
    await resetBillingPeriodUsage(workspaceId)
  })
}

export const handleSubscriptionCanceled = async (subscription: PolarSubscriptionWebhookData) => {
  return withSubscriptionWorkspace('subscription.canceled', subscription, async (workspace, workspaceId) => {
    await updateWorkspaceBilling(workspaceId, {
      status: BillingStatus.CANCELLED,
      currentPeriodEnd: toDate(subscription.currentPeriodEnd),
      nextBillingDate: toDate(subscription.currentPeriodEnd) ?? workspace.billing.nextBillingDate,
    })
  })
}

export const handleSubscriptionRevoked = async (subscription: PolarSubscriptionWebhookData) => {
  return withSubscriptionWorkspace('subscription.revoked', subscription, async (_workspace, workspaceId) => {
    await provisionPlan(workspaceId, Plan.FREE)
    await updateWorkspaceBilling(workspaceId, {
      status: BillingStatus.INACTIVE,
      polarSubscriptionId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      nextBillingDate: new Date(),
      nextBillingAmount: 0,
    })
  })
}

export const handleSubscriptionUncanceled = async (subscription: PolarSubscriptionWebhookData) => {
  return withSubscriptionWorkspace('subscription.uncanceled', subscription, async (_workspace, workspaceId) => {
    const plan = resolvePlanFromProductId(subscription.productId)
    await syncSubscriptionPeriod(workspaceId, subscription)
    await provisionPlan(workspaceId, plan)
  })
}

export const handleOrderPaid = async (order: PolarOrderWebhookData) => {
  return withOrderWorkspace('order.paid', order, async (_workspace, workspaceId) => {
    await updateWorkspaceBilling(workspaceId, {
      polarCustomerId: order.customerId,
      status: BillingStatus.ACTIVE,
      nextBillingAmount: order.totalAmount,
      ...(order.subscriptionId ? { polarSubscriptionId: order.subscriptionId } : {}),
    })

    if (order.subscription) {
      await syncSubscriptionPeriod(workspaceId, order.subscription)
      await provisionPlan(workspaceId, resolvePlanFromProductId(order.subscription.productId ?? order.productId))
      return
    }

    if (order.productId) {
      await provisionPlan(workspaceId, resolvePlanFromProductId(order.productId))
    }
  })
}

export const handleOrderUpdated = async (order: PolarOrderWebhookData) => {
  if (!order.paid) {
    return false
  }

  return await handleOrderPaid(order)
}

export const handleOrderCreated = async (order: PolarOrderWebhookData) => {
  return withOrderWorkspace('order.created', order, async (_workspace, workspaceId) => {
    await updateWorkspaceBilling(workspaceId, {
      polarCustomerId: order.customerId,
      ...(order.subscriptionId ? { polarSubscriptionId: order.subscriptionId } : {}),
      status: order.paid ? BillingStatus.ACTIVE : BillingStatus.PENDING,
    })
  })
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const parseMetadata = (value: unknown): PolarWebhookMetadata | null => {
  if (!isRecord(value)) return null

  const metadata: PolarWebhookMetadata = {}
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean') {
      metadata[key] = entry
    }
  }

  return metadata
}

const parseSubscription = (value: unknown): PolarSubscriptionWebhookData => {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.customerId !== 'string') {
    throw new HttpError(400, 'Invalid subscription payload')
  }

  return {
    id: value.id,
    customerId: value.customerId,
    productId: typeof value.productId === 'string' ? value.productId : undefined,
    status: typeof value.status === 'string' ? value.status : 'inactive',
    currentPeriodStart: typeof value.currentPeriodStart === 'string' ? value.currentPeriodStart : null,
    currentPeriodEnd: typeof value.currentPeriodEnd === 'string' ? value.currentPeriodEnd : null,
    metadata: parseMetadata(value.metadata),
  }
}

const parseOrder = (value: unknown): PolarOrderWebhookData => {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.customerId !== 'string') {
    throw new HttpError(400, 'Invalid order payload')
  }

  return {
    id: value.id,
    customerId: value.customerId,
    productId: typeof value.productId === 'string' ? value.productId : null,
    subscriptionId: typeof value.subscriptionId === 'string' ? value.subscriptionId : null,
    status: typeof value.status === 'string' ? value.status : 'pending',
    paid: value.paid === true,
    totalAmount: typeof value.totalAmount === 'number' ? value.totalAmount : 0,
    metadata: parseMetadata(value.metadata),
    subscription: value.subscription ? parseSubscription(value.subscription) : null,
  }
}

export const parsePolarWebhookEvent = (body: unknown): PolarWebhookEvent => {
  if (
    !isRecord(body) ||
    typeof body.type !== 'string' ||
    !POLAR_WEBHOOK_EVENT_TYPE_SET.has(body.type as PolarWebhookEventType)
  ) {
    throw new HttpError(400, 'Unsupported Polar webhook event')
  }

  const type = body.type as PolarWebhookEventType

  if (type.startsWith('subscription.')) {
    return {
      type,
      data: parseSubscription(body.data),
    } as PolarWebhookEvent
  }

  return {
    type,
    data: parseOrder(body.data),
  } as PolarWebhookEvent
}

const getEntityId = (event: PolarWebhookEvent) => event.data.id

export const processPolarWebhookEvent = async (event: PolarWebhookEvent) => {
  const eventKey = buildWebhookEventKey(event.type, getEntityId(event))
  const acquired = await acquireWebhookEvent(eventKey)
  if (!acquired) {
    return true
  }

  switch (event.type) {
    case 'subscription.created':
      return await handleSubscriptionCreated(event.data)
    case 'subscription.updated':
      return await handleSubscriptionUpdated(event.data)
    case 'subscription.active':
      return await handleSubscriptionActive(event.data)
    case 'subscription.canceled':
      return await handleSubscriptionCanceled(event.data)
    case 'subscription.revoked':
      return await handleSubscriptionRevoked(event.data)
    case 'subscription.uncanceled':
      return await handleSubscriptionUncanceled(event.data)
    case 'order.created':
      return await handleOrderCreated(event.data)
    case 'order.updated':
      return await handleOrderUpdated(event.data)
    case 'order.paid':
      return await handleOrderPaid(event.data)
    default:
      return false
  }
}
