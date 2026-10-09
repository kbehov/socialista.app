import { planFromProduct } from '@/services/polar-plan-mapping.js'
import { HttpError } from '@/utils/http-response.js'
import {
  BillingStatus,
  getWorkspaceById,
  getWorkspaceByPolarCustomerId,
  getWorkspaceByPolarSubscriptionId,
  getUsersByIds,
  notifyWorkspaceOwnersAndAdmins,
  Plan,
  provisionPlan,
  releaseWebhookEvent,
  resetBillingPeriodUsage,
  tryMarkEventProcessed,
  updateWorkspaceBilling,
  type IWorkspace,
  WorkspaceMemberRole,
} from '@socialista/db'
import type {
  PolarOrderWebhookData,
  PolarSubscriptionWebhookData,
  PolarWebhookEvent,
  PolarWebhookEventType,
  PolarWebhookMetadata,
} from '@socialista/types'
import { NotificationResourceKind, NotificationType, POLAR_WEBHOOK_EVENT_TYPE_SET } from '@socialista/types'
import {
  getAppUrl,
  sendBillingCanceledEmail,
  sendBillingFailedEmail,
  sendBillingRenewedEmail,
  sendBillingSuccessEmail,
} from '@socialista/email'

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

async function notifyBillingOwners(
  workspaceId: string,
  input: {
    type: typeof NotificationType.BILLING_SUBSCRIPTION_CREATED
      | typeof NotificationType.BILLING_SUBSCRIPTION_RENEWED
      | typeof NotificationType.BILLING_SUBSCRIPTION_CANCELED
    title: string
    body: string
    subscriptionId: string
    dedupeKey: string
  },
) {
  try {
    await notifyWorkspaceOwnersAndAdmins({
      workspace: workspaceId,
      type: input.type,
      title: input.title,
      body: input.body,
      resource: { kind: NotificationResourceKind.BILLING, id: input.subscriptionId },
      metadata: { polarSubscriptionId: input.subscriptionId },
      dedupeKey: input.dedupeKey,
    })
  } catch (error) {
    console.warn('[polar] failed to create billing notification', error)
  }
}

function ownerAndAdminUserIds(workspace: IWorkspace): string[] {
  const ids = new Set<string>()
  for (const member of workspace.members) {
    if (member.role === WorkspaceMemberRole.OWNER || member.role === WorkspaceMemberRole.ADMIN) {
      ids.add(member.userId.toString())
    }
  }
  if (ids.size === 0) {
    ids.add(workspace.ownerId.toString())
  }
  return [...ids]
}

async function emailBillingOwners(
  workspace: IWorkspace,
  send: (user: { to: string; name: string }) => Promise<void>,
) {
  const users = await getUsersByIds(ownerAndAdminUserIds(workspace))
  await Promise.all(
    users.map(async user => {
      try {
        await send({ to: user.email, name: user.name })
      } catch (error) {
        console.warn('[polar] failed to send billing email', error)
      }
    }),
  )
}

const billingEmailInput = (workspace: IWorkspace, label: string, user: { to: string; name: string }) => ({
  to: user.to,
  name: user.name,
  workspaceName: workspace.name,
  planLabel: label,
  manageUrl: `${getAppUrl()}/dashboard/settings/billing`,
})

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

const syncSubscriptionPeriod = async (
  workspaceId: string,
  subscription: PolarSubscriptionWebhookData,
  options: { includePeriodStart?: boolean } = {},
) => {
  const currentPeriodEnd = toDate(subscription.currentPeriodEnd)
  const includePeriodStart = options.includePeriodStart ?? true

  await updateWorkspaceBilling(workspaceId, {
    polarCustomerId: subscription.customerId,
    polarSubscriptionId: subscription.id,
    status: mapPolarStatus(subscription.status),
    ...(includePeriodStart ? { currentPeriodStart: toDate(subscription.currentPeriodStart) } : {}),
    currentPeriodEnd,
    nextBillingDate: currentPeriodEnd ?? new Date(),
    ...(typeof subscription.amount === 'number' ? { nextBillingAmount: subscription.amount } : {}),
    ...(subscription.product?.name?.trim() ? { polarProductName: subscription.product.name.trim() } : {}),
  })
}

type AppliedPlan = ReturnType<typeof planFromProduct>

const didProductChange = (workspace: IWorkspace, applied: AppliedPlan) => {
  if (applied.productId) {
    return workspace.billing.polarProductId !== applied.productId
  }
  return workspace.billing.plan !== applied.plan
}

const isNewBillingPeriod = (workspace: IWorkspace, subscription: PolarSubscriptionWebhookData) => {
  const previousPeriodStart = workspace.billing.currentPeriodStart
  const newPeriodStart = toDate(subscription.currentPeriodStart)
  return (
    previousPeriodStart != null &&
    newPeriodStart != null &&
    previousPeriodStart.getTime() !== newPeriodStart.getTime()
  )
}

/**
 * A product change adds the new allotment to the current balance.
 * A same-product renewal replaces the balance with that period's allotment.
 */
const applyActiveSubscriptionPlan = async (
  workspace: IWorkspace,
  workspaceId: string,
  applied: AppliedPlan,
  subscription: PolarSubscriptionWebhookData,
) => {
  if (didProductChange(workspace, applied)) {
    await provisionPlan(workspaceId, applied.plan, applied.limits, {
      creditsMode: 'append',
      productName: applied.label,
      productId: applied.productId,
      oncePerProduct: true,
    })
    return { renewal: false, productChanged: true }
  }

  if (isNewBillingPeriod(workspace, subscription)) {
    await provisionPlan(workspaceId, applied.plan, applied.limits, {
      creditsMode: 'keep',
      productName: applied.label,
      productId: applied.productId,
    })
    await resetBillingPeriodUsage(workspaceId, applied.limits.aiCredits)
    return { renewal: true, productChanged: false }
  }

  return { renewal: false, productChanged: false }
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
    const applied = planFromProduct(subscription.product, subscription.productId)
    if (mapPolarStatus(subscription.status) === BillingStatus.ACTIVE) {
      await applyActiveSubscriptionPlan(_workspace, workspaceId, applied, subscription)
    }
    await syncSubscriptionPeriod(workspaceId, subscription)
    await notifyBillingOwners(workspaceId, {
      type: NotificationType.BILLING_SUBSCRIPTION_CREATED,
      title: 'Subscription created',
      body: `Your ${applied.label} plan is now active.`,
      subscriptionId: subscription.id,
      dedupeKey: `billing.created:${workspaceId}:${subscription.id}`,
    })
    await emailBillingOwners(_workspace, user =>
      sendBillingSuccessEmail(billingEmailInput(_workspace, applied.label, user)),
    )
  })
}

export const handleSubscriptionUpdated = async (subscription: PolarSubscriptionWebhookData) => {
  return withSubscriptionWorkspace('subscription.updated', subscription, async (workspace, workspaceId) => {
    const applied = planFromProduct(subscription.product, subscription.productId)
    const appliedChange =
      mapPolarStatus(subscription.status) === BillingStatus.ACTIVE
        ? await applyActiveSubscriptionPlan(workspace, workspaceId, applied, subscription)
        : { renewal: false, productChanged: false }
    await syncSubscriptionPeriod(workspaceId, subscription, { includePeriodStart: !appliedChange.renewal })
    if (subscription.status !== 'past_due' && subscription.status !== 'incomplete') return

    await emailBillingOwners(workspace, user =>
      sendBillingFailedEmail(billingEmailInput(workspace, applied.label, user)),
    )
  })
}

export const handleSubscriptionActive = async (subscription: PolarSubscriptionWebhookData) => {
  return withSubscriptionWorkspace('subscription.active', subscription, async (workspace, workspaceId) => {
    const newPeriodStart = toDate(subscription.currentPeriodStart)
    const applied = planFromProduct(subscription.product, subscription.productId)
    const { renewal } = await applyActiveSubscriptionPlan(workspace, workspaceId, applied, subscription)
    await syncSubscriptionPeriod(workspaceId, subscription)
    if (!renewal || !newPeriodStart) return

    await notifyBillingOwners(workspaceId, {
      type: NotificationType.BILLING_SUBSCRIPTION_RENEWED,
      title: 'Subscription renewed',
      body: `Your ${applied.label} plan has renewed.`,
      subscriptionId: subscription.id,
      dedupeKey: `billing.renewed:${workspaceId}:${newPeriodStart.toISOString()}`,
    })
    await emailBillingOwners(workspace, user =>
      sendBillingRenewedEmail(billingEmailInput(workspace, applied.label, user)),
    )
  })
}

export const handleSubscriptionCanceled = async (subscription: PolarSubscriptionWebhookData) => {
  return withSubscriptionWorkspace('subscription.canceled', subscription, async (workspace, workspaceId) => {
    await updateWorkspaceBilling(workspaceId, {
      status: BillingStatus.CANCELLED,
      currentPeriodEnd: toDate(subscription.currentPeriodEnd),
      nextBillingDate: toDate(subscription.currentPeriodEnd) ?? workspace.billing.nextBillingDate,
    })
    await notifyBillingOwners(workspaceId, {
      type: NotificationType.BILLING_SUBSCRIPTION_CANCELED,
      title: 'Subscription canceled',
      body: 'Your subscription has been canceled. You can resubscribe anytime.',
      subscriptionId: subscription.id,
      dedupeKey: `billing.canceled:${workspaceId}:${subscription.id}`,
    })
    const applied = planFromProduct(subscription.product, subscription.productId)
    await emailBillingOwners(workspace, user =>
      sendBillingCanceledEmail(billingEmailInput(workspace, applied.label, user)),
    )
  })
}

export const handleSubscriptionRevoked = async (subscription: PolarSubscriptionWebhookData) => {
  return withSubscriptionWorkspace('subscription.revoked', subscription, async (_workspace, workspaceId) => {
    await provisionPlan(workspaceId, Plan.FREE, undefined, {
      creditsMode: 'keep',
      productName: null,
      productId: null,
    })
    await updateWorkspaceBilling(workspaceId, {
      status: BillingStatus.INACTIVE,
      polarSubscriptionId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      nextBillingDate: new Date(),
      nextBillingAmount: 0,
      polarProductId: null,
    })
  })
}

export const handleSubscriptionUncanceled = async (subscription: PolarSubscriptionWebhookData) => {
  return withSubscriptionWorkspace('subscription.uncanceled', subscription, async (workspace, workspaceId) => {
    const applied = planFromProduct(subscription.product, subscription.productId)
    if (didProductChange(workspace, applied)) {
      await provisionPlan(workspaceId, applied.plan, applied.limits, {
        creditsMode: 'append',
        productName: applied.label,
        productId: applied.productId,
        oncePerProduct: true,
      })
    } else {
      await provisionPlan(workspaceId, applied.plan, applied.limits, {
        creditsMode: 'keep',
        productName: applied.label,
        productId: applied.productId,
      })
    }
    await syncSubscriptionPeriod(workspaceId, subscription)
  })
}

export const handleOrderPaid = async (order: PolarOrderWebhookData) => {
  return withOrderWorkspace('order.paid', order, async (workspace, workspaceId) => {
    await updateWorkspaceBilling(workspaceId, {
      polarCustomerId: order.customerId,
      status: BillingStatus.ACTIVE,
      nextBillingAmount: order.totalAmount,
      ...(order.subscriptionId ? { polarSubscriptionId: order.subscriptionId } : {}),
    })

    if (order.subscription) {
      const subscription = order.subscription.product
        ? order.subscription
        : {
            ...order.subscription,
            product: order.product,
            productId: order.subscription.productId ?? order.product?.id ?? order.productId ?? undefined,
          }
      const applied = planFromProduct(subscription.product, subscription.productId)
      const appliedChange =
        mapPolarStatus(subscription.status) === BillingStatus.ACTIVE
          ? await applyActiveSubscriptionPlan(workspace, workspaceId, applied, subscription)
          : { renewal: false, productChanged: false }
      await syncSubscriptionPeriod(workspaceId, subscription, { includePeriodStart: !appliedChange.renewal })
      return
    }

    const productId = order.product?.id ?? order.productId
    if (productId || order.product?.name) {
      const applied = planFromProduct(order.product, productId)
      await provisionPlan(workspaceId, applied.plan, applied.limits, {
        creditsMode: 'append',
        productName: applied.label,
        productId: applied.productId,
      })
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

const readString = (record: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    if (typeof record[key] === 'string') return record[key]
  }
  return undefined
}

const readDateString = (record: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    if (typeof record[key] === 'string') return record[key]
    if (record[key] === null) return null
  }
  return null
}

const readNumber = (record: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    if (typeof record[key] === 'number') return record[key]
  }
  return undefined
}

const parseSubscription = (value: unknown): PolarSubscriptionWebhookData => {
  if (!isRecord(value)) {
    throw new HttpError(400, 'Invalid subscription payload')
  }

  const id = readString(value, 'id')
  const customerId = readString(value, 'customerId', 'customer_id')
  if (!id || !customerId) {
    throw new HttpError(400, 'Invalid subscription payload')
  }

  return {
    id,
    customerId,
    productId: readString(value, 'productId', 'product_id'),
    status: readString(value, 'status') ?? 'inactive',
    currentPeriodStart: readDateString(value, 'currentPeriodStart', 'current_period_start'),
    currentPeriodEnd: readDateString(value, 'currentPeriodEnd', 'current_period_end'),
    amount: readNumber(value, 'amount'),
    metadata: parseMetadata(value.metadata),
    product: parseProduct(value.product),
  }
}

const parseProduct = (value: unknown): PolarSubscriptionWebhookData['product'] => {
  if (!isRecord(value)) return null

  const id = typeof value.id === 'string' ? value.id : undefined
  const name = typeof value.name === 'string' ? value.name : undefined
  const metadata = parseMetadata(value.metadata)
  if (!id && !name && !metadata) return null

  return { id, name, metadata }
}

const parseOrder = (value: unknown): PolarOrderWebhookData => {
  if (!isRecord(value)) {
    throw new HttpError(400, 'Invalid order payload')
  }

  const id = readString(value, 'id')
  const customerId = readString(value, 'customerId', 'customer_id')
  if (!id || !customerId) {
    throw new HttpError(400, 'Invalid order payload')
  }

  return {
    id,
    customerId,
    productId: readString(value, 'productId', 'product_id') ?? null,
    subscriptionId: readString(value, 'subscriptionId', 'subscription_id') ?? null,
    status: readString(value, 'status') ?? 'pending',
    paid: value.paid === true,
    totalAmount: readNumber(value, 'totalAmount', 'total_amount') ?? 0,
    metadata: parseMetadata(value.metadata),
    product: parseProduct(value.product),
    subscription: value.subscription ? parseSubscription(value.subscription) : null,
  }
}

export const parsePolarWebhookEvent = (body: unknown): PolarWebhookEvent & { id?: string } => {
  if (
    !isRecord(body) ||
    typeof body.type !== 'string' ||
    !POLAR_WEBHOOK_EVENT_TYPE_SET.has(body.type as PolarWebhookEventType)
  ) {
    throw new HttpError(400, 'Unsupported Polar webhook event')
  }

  const type = body.type as PolarWebhookEventType
  const id = readString(body, 'id')

  if (type.startsWith('subscription.')) {
    return {
      id,
      type,
      data: parseSubscription(body.data),
    } as PolarWebhookEvent & { id?: string }
  }

  return {
    id,
    type,
    data: parseOrder(body.data),
  } as PolarWebhookEvent & { id?: string }
}

const getEntityId = (event: PolarWebhookEvent) => event.data.id

const dispatchPolarWebhookEvent = async (event: PolarWebhookEvent) => {
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

export const processPolarWebhookEvent = async (event: PolarWebhookEvent & { id?: string }) => {
  const eventKey = event.id
    ? `delivery:${event.id}`
    : buildWebhookEventKey(event.type, getEntityId(event))
  const acquired = await acquireWebhookEvent(eventKey)
  if (!acquired) {
    return true
  }

  try {
    const handled = await dispatchPolarWebhookEvent(event)
    if (!handled) {
      throw new HttpError(422, `Polar webhook was not applied: ${event.type}`)
    }
    return true
  } catch (error) {
    await releaseWebhookEvent(eventKey)
    throw error
  }
}
