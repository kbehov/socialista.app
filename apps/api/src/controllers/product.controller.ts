import type { AppContext } from '@/middlewares/auth.middleware.js'
import { getQueryString, parseParamId } from '@/utils/common.utils.js'
import { extractProductFromUrl } from '@/utils/extract-product.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  createProduct as createProductInDb,
  deleteProduct as deleteProductInDb,
  getProductById,
  getProducts,
  toObjectId,
  updateProduct as updateProductInDb,
  type Iproduct,
} from '@socialista/db'
import type { CreateProductPayload, Product, UpdateProductPayload } from '@socialista/types'
import type { Context } from 'hono'

function serializeProduct(product: Iproduct): Product {
  return {
    _id: product._id.toString(),
    workspaceId: product.workspaceId.toString(),
    name: product.name,
    images: product.images,
    description: product.description,
    url: product.url,
    price: product.price,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

function parsePrice(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ''))
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  throw new HttpError(400, 'Valid price is required')
}

function parseCreateProductInput(body: Record<string, unknown>): CreateProductPayload {
  const workspaceId = parseParamId(typeof body.workspaceId === 'string' ? body.workspaceId : undefined, 'workspace ID')
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const url = typeof body.url === 'string' ? body.url.trim() : ''

  if (!name) {
    throw new HttpError(400, 'Product name is required')
  }
  if (!url) {
    throw new HttpError(400, 'Product URL is required')
  }

  return {
    workspaceId,
    name,
    url,
    price: parsePrice(body.price),
    description: typeof body.description === 'string' ? body.description.trim() : '',
    images: Array.isArray(body.images) ? body.images.filter((image): image is string => typeof image === 'string') : [],
  }
}

function parseUpdateProductInput(body: Record<string, unknown>): UpdateProductPayload {
  const updates: UpdateProductPayload = {}

  if (typeof body.name === 'string') {
    const name = body.name.trim()
    if (!name) {
      throw new HttpError(400, 'Product name cannot be empty')
    }
    updates.name = name
  }

  if (typeof body.description === 'string') {
    updates.description = body.description.trim()
  }

  if (typeof body.url === 'string') {
    const url = body.url.trim()
    if (!url) {
      throw new HttpError(400, 'Product URL cannot be empty')
    }
    updates.url = url
  }

  if (body.price !== undefined) {
    updates.price = parsePrice(body.price)
  }

  if (Array.isArray(body.images)) {
    updates.images = body.images.filter((image): image is string => typeof image === 'string')
  }

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, 'No valid fields to update')
  }

  return updates
}

async function getProductForMember(id: string, userId: string) {
  const product = await getProductById(id)
  if (!product) {
    throw new HttpError(404, 'Product not found')
  }
  await getWorkspaceAsMember(product.workspaceId.toString(), userId)
  return product
}

export const extractProduct = async (c: Context<AppContext>) => {
  const body = (await c.req.json()) as Record<string, unknown>
  const url = typeof body.url === 'string' ? body.url.trim() : ''
  if (!url) {
    throw new HttpError(400, 'URL is required')
  }

  const product = await extractProductFromUrl(url)
  if (!product) {
    throw new HttpError(404, 'Could not extract product data from URL')
  }

  return successResponse(c, 200, product)
}

export const createProduct = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const input = parseCreateProductInput((await c.req.json()) as Record<string, unknown>)
  await getWorkspaceAsMember(input.workspaceId, userId)

  const product = await createProductInDb({
    workspaceId: toObjectId(input.workspaceId),
    name: input.name,
    description: input.description ?? '',
    url: input.url,
    price: input.price,
    images: input.images ?? [],
  })

  return successResponse(c, 201, { product: serializeProduct(product.toObject()) })
}

export const getWorkspaceProducts = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const existingQuery = getQueryString(c.req.url)
  const params = new URLSearchParams(existingQuery)
  params.set('workspaceId', workspaceId)

  const data = await getProducts(params.toString())
  return successResponse(c, 200, {
    products: data.products.map(product => serializeProduct(product as Iproduct)),
    meta: data.meta,
  })
}

export const getProduct = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'product ID')
  const product = await getProductForMember(id, userId)
  return successResponse(c, 200, { product: serializeProduct(product) })
}

export const updateProduct = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'product ID')
  const input = parseUpdateProductInput((await c.req.json()) as Record<string, unknown>)
  await getProductForMember(id, userId)

  const product = await updateProductInDb(id, input)
  if (!product) {
    throw new HttpError(404, 'Product not found')
  }

  return successResponse(c, 200, { product: serializeProduct(product.toObject()) })
}

export const deleteProduct = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'product ID')
  await getProductForMember(id, userId)

  const deleted = await deleteProductInDb(id)
  if (!deleted) {
    throw new HttpError(404, 'Product not found')
  }

  return successResponse(c, 200, { id })
}
