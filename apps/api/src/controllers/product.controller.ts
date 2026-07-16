import type { AppContext } from '@/middlewares/auth.middleware.js'
import { getQueryString, parseParamId } from '@/utils/common.utils.js'
import { extractProductFromUrl } from '@/utils/extract-product.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import { assertWorkspaceMember, getWorkspaceOrThrow } from '@/utils/workspace.utils.js'
import { getAllProducts, getProductById } from '@socialista/db'
import type { Context } from 'hono'

export const extractProduct = async (c: Context) => {
  const { url } = await c.req.json()
  if (!url) {
    throw new HttpError(400, 'URL is required')
  }
  const product = await extractProductFromUrl(url)
  return successResponse(c, 200, product)
}

export const getProducts = async (c: Context<AppContext>) => {
  const query = getQueryString(c.req.url)
  const products = await getAllProducts(query)
  return successResponse(c, 200, products)
}

export const getProduct = async (c: Context<AppContext>) => {
  const id = parseParamId(c.req.param('id'), 'product ID')
  const userId = c.get('userId')
  const product = await getProductById(id)
  if (!product) {
    throw new HttpError(404, 'Product not found')
  }
  const workspace = await getWorkspaceOrThrow(product.workspaceId.toString())
  assertWorkspaceMember(workspace, userId)
  return successResponse(c, 200, product)
}
