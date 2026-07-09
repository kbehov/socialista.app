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
  updateWorkspaceBilling,
} from '@socialista/db'
import type {
  PolarOrderWebhookData,
  PolarSubscriptionWebhookData,
  PolarWebhookEvent,
  PolarWebhookEventType,
  PolarWebhookMetadata,
} from '@socialista/types'

const SUPPORTED_EVENTS = new Set<PolarWebhookEventType>([
  'subscription.created',
  'subscription.updated',
  'subscription.active',
  'subscription.canceled',
  'subscription.revoked',
  'subscription.uncanceled',
  'order.created',
  'order.updated',
  'order.paid',
])

const toDate = (value?: string | null) => {
  if (!value) return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

const getWorkspaceIdFromMetadata = (metadata?: PolarWebhookMetadata | null) => {
  const workspaceId = metadata?.workspaceId
  return typeof workspaceId === 'string' ? workspaceId : undefined
}

const resolvePlanFromProductId = (productId?: string | null): Plan => {
  const proProductId = process.env.POLAR_PRO_PRODUCT_ID

  if (proProductId && productId === proProductId) {
    return Plan.PRO
  }

  return Plan.PRO
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

export const handleSubscriptionCreated = async (subscription: PolarSubscriptionWebhookData) => {
  const workspace = await resolveWorkspaceFromSubscription(subscription)
  if (!workspace) {
    console.warn('[polar] subscription.created: workspace not found', subscription.id)
    return false
  }

  const workspaceId = workspace._id.toString()
  const plan = resolvePlanFromProductId(subscription.productId)
  const currentPeriodEnd = toDate(subscription.currentPeriodEnd)

  await updateWorkspaceBilling(workspaceId, {
    polarCustomerId: subscription.customerId,
    polarSubscriptionId: subscription.id,
    status: mapPolarStatus(subscription.status),
    currentPeriodStart: toDate(subscription.currentPeriodStart),
    currentPeriodEnd,
    nextBillingDate: currentPeriodEnd ?? new Date(),
    nextBillingAmount: PLAN_LIMITS[plan].price,
  })

  if (mapPolarStatus(subscription.status) === BillingStatus.ACTIVE) {
    await provisionPlan(workspaceId, plan)
  }

  return true
}

export const handleSubscriptionUpdated = async (subscription: PolarSubscriptionWebhookData) => {
  const workspace = await resolveWorkspaceFromSubscription(subscription)
  if (!workspace) {
    console.warn('[polar] subscription.updated: workspace not found', subscription.id)
    return false
  }

  await syncSubscriptionPeriod(workspace._id.toString(), subscription)
  return true
}

export const handleSubscriptionActive = async (subscription: PolarSubscriptionWebhookData) => {
  const workspace = await resolveWorkspaceFromSubscription(subscription)
  if (!workspace) {
    console.warn('[polar] subscription.active: workspace not found', subscription.id)
    return false
  }

  const workspaceId = workspace._id.toString()
  const plan = resolvePlanFromProductId(subscription.productId)

  await syncSubscriptionPeriod(workspaceId, subscription)
  await provisionPlan(workspaceId, plan)
  await resetBillingPeriodUsage(workspaceId)

  return true
}

export const handleSubscriptionCanceled = async (subscription: PolarSubscriptionWebhookData) => {
  const workspace = await resolveWorkspaceFromSubscription(subscription)
  if (!workspace) {
    console.warn('[polar] subscription.canceled: workspace not found', subscription.id)
    return false
  }

  await updateWorkspaceBilling(workspace._id.toString(), {
    status: BillingStatus.CANCELLED,
    currentPeriodEnd: toDate(subscription.currentPeriodEnd),
    nextBillingDate: toDate(subscription.currentPeriodEnd) ?? workspace.billing.nextBillingDate,
  })

  return true
}

export const handleSubscriptionRevoked = async (subscription: PolarSubscriptionWebhookData) => {
  const workspace = await resolveWorkspaceFromSubscription(subscription)
  if (!workspace) {
    console.warn('[polar] subscription.revoked: workspace not found', subscription.id)
    return false
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

  return true
}

export const handleSubscriptionUncanceled = async (subscription: PolarSubscriptionWebhookData) => {
  const workspace = await resolveWorkspaceFromSubscription(subscription)
  if (!workspace) {
    console.warn('[polar] subscription.uncanceled: workspace not found', subscription.id)
    return false
  }

  const workspaceId = workspace._id.toString()
  const plan = resolvePlanFromProductId(subscription.productId)

  await syncSubscriptionPeriod(workspaceId, subscription)
  await provisionPlan(workspaceId, plan)

  return true
}

export const handleOrderPaid = async (order: PolarOrderWebhookData) => {
  const workspace = await resolveWorkspaceFromOrder(order)
  if (!workspace) {
    console.warn('[polar] order.paid: workspace not found', order.id)
    return false
  }

  const workspaceId = workspace._id.toString()

  await updateWorkspaceBilling(workspaceId, {
    polarCustomerId: order.customerId,
    status: BillingStatus.ACTIVE,
    nextBillingAmount: order.totalAmount,
    ...(order.subscriptionId ? { polarSubscriptionId: order.subscriptionId } : {}),
  })

  if (order.subscription) {
    await syncSubscriptionPeriod(workspaceId, order.subscription)
    await provisionPlan(workspaceId, resolvePlanFromProductId(order.subscription.productId ?? order.productId))
    return true
  }

  if (order.productId) {
    await provisionPlan(workspaceId, resolvePlanFromProductId(order.productId))
  }

  return true
}

export const handleOrderUpdated = async (order: PolarOrderWebhookData) => {
  if (!order.paid) {
    return false
  }

  return await handleOrderPaid(order)
}

export const handleOrderCreated = async (order: PolarOrderWebhookData) => {
  const workspace = await resolveWorkspaceFromOrder(order)
  if (!workspace) {
    console.warn('[polar] order.created: workspace not found', order.id)
    return false
  }

  await updateWorkspaceBilling(workspace._id.toString(), {
    polarCustomerId: order.customerId,
    ...(order.subscriptionId ? { polarSubscriptionId: order.subscriptionId } : {}),
    status: order.paid ? BillingStatus.ACTIVE : BillingStatus.PENDING,
  })

  return true
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
  if (!isRecord(body) || typeof body.type !== 'string' || !SUPPORTED_EVENTS.has(body.type as PolarWebhookEventType)) {
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

export const processPolarWebhookEvent = async (event: PolarWebhookEvent) => {
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
